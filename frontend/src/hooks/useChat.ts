import { useState, useEffect, useCallback, useRef } from 'react'
import { apiService } from '@/services/api'
import { unreadService } from '@/services/unreadService'
import { getWebSocketClient, WebSocketMessage } from '@/lib/websocket'
import type { User, Team, Channel, Conversation, Message} from '@/types/chat'

export function useChat() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [conversationUsers, setConversationUsers] = useState<User[]>([])
  const conversationUsersRef = useRef<User[]>([])
  // Track optimistic message IDs (avoid extending Message type)
  const optimisticIdsRef = useRef<Set<number>>(new Set())
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isConversationsLoaded, setIsConversationsLoaded] = useState(false)
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false)
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'closing' | 'error'>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [userOnlineSet, setUserOnlineSet] = useState(false)
  const [typingByConversation, setTypingByConversation] = useState<Record<number, Set<number>>>({})
  const [readPointers, setReadPointers] = useState<Record<number, Record<number, number>>>({})

  // Load current user
  const loadCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const res: any = await apiService.getCurrentUser()
      const userData = res?.data?.data ?? res?.data ?? res
      setCurrentUser(userData)
    } catch (err) {
      setError('Failed to load user data')
      console.error('Error loading user:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load teams
  const loadTeams = useCallback(async () => {
    try {
      setIsLoading(true)
      const res: any = await apiService.getTeams()
      const teamsData = res?.data?.data ?? res?.data ?? res
      setTeams(Array.isArray(teamsData) ? teamsData : [])
    } catch (err) {
      setError('Failed to load teams')
      console.error('Error loading teams:', err)
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load channels for a team
  const loadChannels = useCallback(async (teamId: number) => {
    try {
      setIsLoading(true)
      const res: any = await apiService.getChannels(teamId.toString())
      const channelsData = res?.data?.data ?? res?.data ?? res
      setChannels(Array.isArray(channelsData) ? channelsData : [])
    } catch (err) {
      setError('Failed to load channels')
      console.error('Error loading channels:', err)
      setChannels([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const res: any = await apiService.getConversations()
      const conversationsData = res?.data?.data ?? res?.data ?? res
      const baseConversations: any[] = Array.isArray(conversationsData) ? conversationsData : []
      // Tin cậy unread_count do API /conversations trả về, không merge thêm để tránh sai lệch
      setConversations(baseConversations as any)

    } catch (err) {
      setError('Failed to load conversations')
      console.error('Error loading conversations:', err)
      setConversations([])
    } finally {
      setIsLoading(false)
      setIsConversationsLoaded(true)
    }
  }, [currentConversation])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number, page: number = 1) => {
    try {
      setIsLoading(true)
      const res: any = await apiService.getMessages(conversationId.toString(), page)
      const responseData = res?.data?.data ?? res?.data ?? res
      const messagesArray = Array.isArray(responseData?.messages) ? responseData.messages : (Array.isArray(responseData) ? responseData : [])
      const usersArray = Array.isArray(responseData?.users) ? responseData.users : []
      
      // Convert users to User format
      const users = usersArray.map((user: any) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        email: '',
        is_online: false
      }))
      
      setConversationUsers(users)
      conversationUsersRef.current = users
      
      if (page === 1) {
        setMessages(messagesArray)
        // Setup WebSocket subscription for new messages
        setupWebSocketSubscription(conversationId)
        setIsMessagesLoaded(true)
      } else {
        setMessages(prev => [...messagesArray, ...prev])
      }
    } catch (err) {
      setError('Failed to load messages')
      console.error('Error loading messages:', err)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Setup WebSocket subscription for real-time messages
  const setupWebSocketSubscription = useCallback((conversationId: number) => {
    try {
      const wsClient = getWebSocketClient()
      
      // Connect if not already connected
      if (wsClient.getConnectionState() !== 'connected') {
        wsClient.connect()
      }
      
      // Join conversation
      wsClient.joinConversation(conversationId)
      
      // Clear existing message handlers to avoid duplicates
      wsClient.clearMessageHandlers()
      
      // Listen for messages
      wsClient.onMessage(async (message: WebSocketMessage) => {
        // Delivery/Read receipts
        if (message.type === 'message_ack') {
          const ackMsgId = parseInt((message as any).message_id?.toString() || '0')
          const clientId = (message as any).client_id as string | undefined
          const convId = parseInt(message.conversation_id?.toString() || '0')
          setMessages((prev: any[]) => prev.map(m => {
            const sameConv = (m.conversation_id || 0) === convId
            const sameClient = clientId && m.client_id === clientId
            const sameContent = !clientId && (m.content === (message as any).content) && (m.user_id === parseInt(message.sender_id?.toString() || '0'))
            if (sameConv && (sameClient || sameContent)) {
              return { ...m, id: ackMsgId || m.id, status: 'delivered' }
            }
            return m
          }))
          return
        }
        if (message.type === 'message_read') {
          const readMsgId = parseInt((message as any).message_id?.toString() || '0')
          const convId = parseInt(message.conversation_id?.toString() || '0')
          const readerId = parseInt((message as any).user_id?.toString() || '0')
          if (convId && readerId && readMsgId) {
            setReadPointers(prev => ({
              ...prev,
              [convId]: { ...(prev[convId] || {}), [readerId]: Math.max(readMsgId, (prev[convId]?.[readerId] || 0)) }
            }))
          }
          setMessages((prev: any[]) => prev.map(m => {
            if ((m.conversation_id || 0) === convId && m.id && readMsgId && m.id <= readMsgId) {
              return { ...m, status: 'read' }
            }
            return m
          }))
          return
        }
        // Typing indicators
        if (message.type === 'typing_start' || message.type === 'typing_stop') {
          const convId = parseInt(message.conversation_id?.toString() || '0')
          const userId = parseInt(message.user_id?.toString() || '0')
          if (!convId || !userId) return
          setTypingByConversation(prev => {
            const copy: Record<number, Set<number>> = { ...prev }
            const set = new Set(copy[convId] || [])
            if (message.type === 'typing_start') set.add(userId)
            else set.delete(userId)
            copy[convId] = set
            return copy
          })
          return
        }
        
        if (message.type === 'chat_message' || message.type === 'message_received') {
          const senderId = parseInt(message.sender_id?.toString() || '0')
          let sender = null
          if (currentConversation?.members) {
            sender = currentConversation.members.find(member => member.id === senderId)
          }
          if (!sender) {
            sender = conversationUsersRef.current.find(user => user.id === senderId)
          }
          
          // If still not found, try to find in current messages
          if (!sender) {
            const messageWithSender = messages.find(msg => msg.sender?.id === senderId)
            if (messageWithSender?.sender) {
              sender = {
                id: messageWithSender.sender.id,
                name: messageWithSender.sender.name,
                username: messageWithSender.sender.username,
                avatar: messageWithSender.sender.avatar,
                email: '',
                is_online: false
              }
            }
          }
          
          // If still not found, create minimal sender object
          if (!sender) {
            sender = {
              id: senderId,
              name: 'Unknown User',
              username: `user${senderId}`,
              avatar: null
            }
          }
          
          const newMessage = {
            id: Date.now(), // Temporary ID until we get real ID from DB
            conversation_id: parseInt(message.conversation_id?.toString() || '0'),
            user_id: senderId,
            content: message.content || '',
            type: 'text',
            created_at: message.timestamp || new Date().toISOString(),
            updated_at: message.timestamp || new Date().toISOString(),
            sender: {
              id: senderId,
              name: sender.name || `User ${senderId}`,
              username: sender.username || `user${senderId}`,
              avatar: sender.avatar
            },
            reactions: [],
            is_bookmarked: false,
            replies_count: 0,
            status: 'delivered'
          }
          
          
          // If it's from current user, replace optimistic update
          if (parseInt(message.sender_id?.toString() || '0') === currentUser?.id) {
            setMessages((prev: any) => {
              // Find and remove optimistic message by id/content/sender via Set
              const filteredMessages = prev.filter((msg: any) => {
                const isOptimistic = optimisticIdsRef.current.has(msg.id)
                const sameSender = msg.user_id === parseInt(message.sender_id?.toString() || '0')
                const sameContent = msg.content === (message.content || '')
                const shouldRemove = isOptimistic && sameSender && sameContent
                if (shouldRemove) optimisticIdsRef.current.delete(msg.id)
                return !shouldRemove
              })
              // Add real message
              return [...filteredMessages, newMessage]
            })
          } else {
            const messageConversationId = parseInt(message.conversation_id?.toString() || '0')
            // Add new message from other users, but check for duplicates first
            setMessages((prev: any) => {
              // Check if message already exists (by content and timestamp)
              const exists = prev.some((msg: any) => 
                msg.content === newMessage.content && 
                msg.user_id === newMessage.user_id &&
                Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 1000 // Within 1 second
              )
              
              if (exists) {
                return prev
              }
              
              return [...prev, newMessage]
            })

            // Update unread count for the conversation if user is not currently viewing it
            if (currentConversation?.id !== messageConversationId) {
              setConversations(prev => prev.map(conv => 
                conv.id === messageConversationId 
                  ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
                  : conv
              ))
            }
          }
        }
      })

      return () => {
        // WebSocket client will handle cleanup
      }
    } catch (error) {
      console.error('Failed to setup WebSocket subscription:', error)
    }
  }, [currentUser])

  // Send message via WebSocket
  const sendMessage = useCallback(async (conversationId: number, content: string, type: string = 'text') => {
    try {
      
      
      const wsClient = getWebSocketClient()
      
      // Create message object for immediate UI update
      const tempId = Date.now()
      const clientId = `${currentUser?.id || 0}-${Date.now()}`
      const tempMessage = {
        id: tempId, // Temporary ID
        conversation_id: conversationId,
        user_id: currentUser?.id || 0,
        content: content,
        type: type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: currentUser?.id || 0,
          name: currentUser?.name || 'You',
          username: currentUser?.username || 'you',
          avatar: currentUser?.avatar
        },
        reactions: [],
        is_bookmarked: false,
        is_optimistic: true, // Flag for optimistic update
        status: 'sent' as any,
        client_id: clientId
      }
      
      // Add to UI immediately (optimistic update)
      setMessages((prev: any) => [...prev, tempMessage])
      optimisticIdsRef.current.add(tempId)
      
      // Reset unread count for current conversation since user is actively chatting
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      ))
      
      // Send via WebSocket
      try {
        
        
        // Connect if not already connected
        if (wsClient.getConnectionState() !== 'connected') {
          wsClient.connect()
        }
        
        // Join conversation if not already joined
        wsClient.joinConversation(conversationId)
        
        // Send message
        wsClient.sendMessage(conversationId, currentUser?.id || 0, content, currentUser?.name, currentUser?.avatar)
        
        
      } catch (error) {
        console.error('Failed to send message via WebSocket:', error)
      }
      
      
      return tempMessage
    } catch (err) {
      setError('Failed to send message')
      console.error('Error sending message:', err)
      throw err
    }
  }, [currentUser])

  const editMessage = useCallback(async (messageId: number, content: string) => {
    try {
      // Optimistic update
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content, is_edited: true, updated_at: new Date().toISOString() } : m))
      await apiService.updateMessage?.(messageId.toString(), { content } as any)
    } catch (err) {
      console.error('Failed to edit message:', err)
    }
  }, [])

  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_deleted: true, content: '[deleted]' } : m))
      await apiService.deleteMessage?.(messageId.toString())
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }, [])

  // Load online users
  const loadOnlineUsers = useCallback(async () => {
    try {
      const res: any = await apiService.getOnlineUsers()
      const usersData = res?.data?.data ?? res?.data ?? res
      setOnlineUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err) {
      console.error('Error loading online users:', err)
      setOnlineUsers([])
    }
  }, [])

  // Load user statuses from API
  const loadUserStatuses = useCallback(async () => {
    try {
      // Get all user IDs from conversations
      const allUserIds = new Set<number>()
      conversations.forEach(conv => {
        if (conv.members) {
          conv.members.forEach(member => {
            if (member.id !== currentUser?.id) {
              allUserIds.add(member.id)
            }
          })
        }
      })
      
      if (allUserIds.size === 0) return
      
      const res: any = await apiService.getUsersStatus(Array.from(allUserIds))
      const userStatuses = res?.data?.data ?? []
      
      // Create a map of user_id -> is_online
      const onlineUserIds = new Set<number>()
      userStatuses.forEach((status: any) => {
        if (status.is_online) {
          onlineUserIds.add(status.user_id)
        }
      })
      
      setOnlineUserIds(onlineUserIds)
    } catch (err) {
      console.error('Error loading user statuses:', err)
    }
  }, [conversations, currentUser?.id])

  // Search messages
  const searchMessages = useCallback(async (query: string, conversationId?: number) => {
    try {
      const res: any = await apiService.searchMessages(query, conversationId?.toString())
      return res?.data
    } catch (err) {
      setError('Failed to search messages')
      console.error('Error searching messages:', err)
      return []
    }
  }, [])

  // Add reaction
  const addReaction = useCallback(async (messageId: number, emoji: string) => {
    try {
      await apiService.addReaction(messageId.toString(), emoji as any)
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              reactions: (() => {
                const existingReaction = (msg.reactions || []).find(r => r.emoji === emoji)
                if (existingReaction) {
                  // Update existing reaction
                  return (msg.reactions || []).map(r => 
                    r.emoji === emoji 
                      ? {
                          ...r,
                          count: (r.count || 0) + 1,
                          users: [...(r.users || []), currentUser?.id || 0]
                        }
                      : r
                  )
                } else {
                  // Add new reaction
                  return [...(msg.reactions || []), { 
                    emoji, 
                    count: 1, 
                    users: [currentUser?.id || 0] 
                  }]
                }
              })()
            }
          : msg
      ))
    } catch (err) {
      console.error('Error adding reaction:', err)
    }
  }, [currentUser])

  // Remove reaction
  const removeReaction = useCallback(async (messageId: number, emoji: string) => {
    try {
      await apiService.removeReaction(messageId.toString(), emoji as any)
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              reactions: (msg.reactions || []).map(r => 
                r.emoji === emoji 
                  ? {
                      ...r,
                      count: Math.max(0, (r.count || 1) - 1),
                      users: (r.users || []).filter(userId => userId !== currentUser?.id)
                    }
                  : r
              ).filter(r => (r.count || 0) > 0)
            }
          : msg
      ))
    } catch (err) {
      console.error('Error removing reaction:', err)
    }
  }, [currentUser])

  // Bookmark message
  const bookmarkMessage = useCallback(async (messageId: number, note?: string) => {
    try {
      await apiService.bookmarkMessage(messageId.toString(), note)
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_bookmarked: true }
          : msg
      ))
    } catch (err) {
      console.error('Error bookmarking message:', err)
    }
  }, [])

  // Remove bookmark
  const removeBookmark = useCallback(async (messageId: number) => {
    try {
      await apiService.removeBookmark(messageId.toString())
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_bookmarked: false }
          : msg
      ))
    } catch (err) {
      console.error('Error removing bookmark:', err)
    }
  }, [])

  // Update user status
  const updateUserStatus = useCallback(async (status: 'online' | 'offline' | 'away' | 'busy', statusMessage?: string) => {
    try {
      await apiService.updateUserStatus(status, statusMessage)
      if (currentUser) {
        setCurrentUser(prev => prev ? { ...prev, status, status_message: statusMessage } : null)
      }
    } catch (err) {
      console.error('Error updating user status:', err)
    }
  }, [currentUser])

  // Load unread counts
  const loadUnreadCounts = useCallback(async () => {
    try {
      const unreadCounts: any = await unreadService.getUnreadCounts()
      // Update conversations with unread counts
      setConversations(prev => prev.map(conv => {
        const unreadData = unreadCounts.find((uc: any) => uc.conversation_id === conv.id)
        return {
          ...conv,
          unread_count: unreadData?.unread_count || 0
        }
      }))
    } catch (error) {
      console.error('Failed to load unread counts:', error)
    }
  }, [])

  // Wrapper for setCurrentConversation that also resets unread count
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    // Load full conversation details with members
    try {
      const res: any = await apiService.getConversation(conversation.id.toString())
      const fullConversation = res?.data?.data ?? res?.data ?? res
      setCurrentConversation(fullConversation)
    } catch (error) {
      console.error('Failed to load conversation details:', error)
      setCurrentConversation(conversation)
    }
    
    // Mark conversation as read on server (new route with fallback handled in service)
    try {
      await unreadService.markConversationAsRead(conversation.id)
      // After marking as read, refresh conversations to persist correct unread on next reload
      try { await loadConversations() } catch {}
    } catch {}
    
    // Reset unread count in local state
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unread_count: 0 }
        : conv
    ))
    
    // Setup WebSocket subscription for real-time messages
    setupWebSocketSubscription(conversation.id)
    
    // Note: User online status is handled in subscribeToAllConversations
    
    // Load messages for the conversation
    loadMessages(conversation.id)
  }, [setupWebSocketSubscription, loadMessages])

  // Subscribe to all conversations when user is loaded
  const subscribeToAllConversations = useCallback(() => {
    if (currentUser?.id && conversations.length > 0) {
      const wsClient = getWebSocketClient()
      const conversationIds = conversations.map(conv => conv.id)
      
      // Wait for WebSocket to be connected
      const checkConnection = () => {
        if (wsClient.isConnected()) {
          wsClient.subscribeAllConversations(currentUser.id, conversationIds)
          
          // Set user online only once, with a small delay
          if (!userOnlineSet) {
            setTimeout(() => {
              wsClient.setUserOnline(currentUser.id)
              setUserOnlineSet(true)
            }, 1000) // 1 second delay
          }
        } else {
          // Retry after 1 second
          setTimeout(checkConnection, 1000)
        }
      }
      
      checkConnection()
    }
  }, [currentUser?.id, conversations, userOnlineSet])

  // Initialize chat data
  useEffect(() => {
    // Prime websocket connection early
    try {
      const ws = getWebSocketClient()
      setWsStatus(ws.getConnectionState() as any)
      ws.onConnectionChange((status) => {
        setWsStatus((status as any) === 'error' ? 'error' : (status as any))
      })
      if (!ws.isConnected()) {
        ws.connect()
      }
    } catch (e) {
      console.error('WS init failed', e)
      setWsStatus('error')
    }

    loadCurrentUser()
    loadTeams()
    loadConversations()
    loadOnlineUsers()
  }, [loadCurrentUser, loadTeams, loadConversations, loadOnlineUsers])

  // Load user statuses when conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      loadUserStatuses()
    }
  }, [loadUserStatuses])

  // Periodic refresh of user statuses every 30 seconds
  useEffect(() => {
    if (conversations.length > 0) {
      const interval = setInterval(() => {
        loadUserStatuses()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [loadUserStatuses, conversations.length])

  // Subscribe to all conversations when conversations are loaded
  useEffect(() => {
    subscribeToAllConversations()
  }, [subscribeToAllConversations])

  // Do not auto-select conversation; wait for explicit user action

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Set user offline when component unmounts
      if (currentUser?.id) {
        const wsClient = getWebSocketClient()
        wsClient.setUserOffline(currentUser.id)
      }
    }
  }, [currentUser?.id])

  // Removed extra unread refresh here to prevent flicker; use explicit triggers instead

  const isAppReady = !!currentUser && isConversationsLoaded && (!!currentConversation ? isMessagesLoaded : true) && (wsStatus === 'connected' || wsStatus === 'connecting')

  return {
    // State
    currentUser,
    teams,
    channels,
    conversations,
    currentConversation,
    messages,
    onlineUsers,
    conversationUsers,
    onlineUserIds,
    isLoading,
    isConversationsLoaded,
    isMessagesLoaded,
    wsStatus,
    isAppReady,
    error,
    typingByConversation,
    readPointers,
    
    // Actions
    setCurrentConversation,
    handleSelectConversation,
    loadTeams,
    loadChannels,
    loadConversations,
    loadMessages,
    sendMessage,
    loadOnlineUsers,
    searchMessages,
    addReaction,
    removeReaction,
    bookmarkMessage,
    removeBookmark,
    editMessage,
    deleteMessage,
    updateUserStatus,
    loadUnreadCounts,
    
    // Utils
    setError,
  }
}
