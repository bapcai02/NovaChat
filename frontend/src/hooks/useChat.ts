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
  const [error, setError] = useState<string | null>(null)
  const [userOnlineSet, setUserOnlineSet] = useState(false)

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
      const conversations = Array.isArray(conversationsData) ? conversationsData : []
      setConversations(conversations)
      
      // Store conversations (auto-select will be handled in useEffect)
    } catch (err) {
      setError('Failed to load conversations')
      console.error('Error loading conversations:', err)
      setConversations([])
    } finally {
      setIsLoading(false)
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
            replies_count: 0
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
        is_optimistic: true // Flag for optimistic update
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
    
    // Mark conversation as read on server
    await unreadService.markConversationAsRead(conversation.id)
    
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

  // Auto-select first conversation if none is selected
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation) {
      handleSelectConversation(conversations[0])
    }
  }, [conversations, currentConversation, handleSelectConversation])

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

  // Load unread counts after conversations are loaded
  useEffect(() => {
    if (conversations.length > 0) {
      loadUnreadCounts()
    }
  }, [conversations.length, loadUnreadCounts])

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
    error,
    
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
    updateUserStatus,
    loadUnreadCounts,
    
    // Utils
    setError,
  }
}
