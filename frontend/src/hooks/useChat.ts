import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'

export interface User {
  id: number
  name: string
  email: string
  username: string
  avatar?: string
  is_online: boolean
  last_seen_at?: string
  status?: string
  status_message?: string
}

export interface Team {
  id: number
  name: string
  description?: string
  slug: string
  owner_id: number
  is_private: boolean
  created_at: string
  updated_at: string
  owner?: User
  members_count?: number
}

export interface Channel {
  id: number
  name: string
  description?: string
  slug: string
  team_id: number
  is_private: boolean
  created_at: string
  updated_at: string
  team?: Team
  members_count?: number
}

export interface Conversation {
  id: number
  type: 'direct' | 'channel' | 'group'
  name?: string
  title?: string
  team_id?: number
  channel_id?: number
  metadata?: any
  created_at: string
  updated_at: string
  team?: Team
  channel?: Channel
  members?: User[]
  other_member?: User
  last_message?: Message
  unread_count?: number
  messages_count?: number
}

export interface Message {
  id: number
  user_id: number
  conversation_id: number
  channel_id?: number
  parent_id?: number
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  metadata?: any
  created_at: string
  updated_at: string
  edited_at?: string
  is_edited?: boolean
  is_pinned?: boolean
  is_deleted?: boolean
  user?: User
  sender?: User
  reactions?: MessageReaction[]
  is_bookmarked?: boolean
  thread_messages_count?: number
  replies_count?: number
}

export interface MessageReaction {
  id?: number
  message_id?: number
  user_id?: number
  emoji: string
  count?: number
  users?: number[]
  created_at?: string
  user?: User
}

export interface Bookmark {
  id: number
  user_id: number
  message_id: number
  note?: string
  created_at: string
  message?: Message
}

export function useChat() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load current user
  const loadCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCurrentUser()
      // API returns nested data: response.data.data
      const userData = response.data?.data || response.data
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
      const response = await apiService.getTeams()
      // API returns nested data: response.data.data
      const teamsData = response.data?.data || response.data
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
      const response = await apiService.getChannels(teamId.toString())
      // API returns nested data: response.data.data
      const channelsData = response.data?.data || response.data
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
      const response = await apiService.getConversations()
      // API returns nested data: response.data.data
      const conversationsData = response.data?.data || response.data
      setConversations(Array.isArray(conversationsData) ? conversationsData : [])
    } catch (err) {
      setError('Failed to load conversations')
      console.error('Error loading conversations:', err)
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number, page: number = 1) => {
    try {
      setIsLoading(true)
      const response = await apiService.getMessages(conversationId.toString(), page)
      // API returns nested data: response.data.data
      const messagesData = response.data?.data || response.data
      const messagesArray = Array.isArray(messagesData) ? messagesData : []
      if (page === 1) {
        setMessages(messagesArray)
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

  // Send message
  const sendMessage = useCallback(async (conversationId: number, content: string, type: string = 'text') => {
    try {
      const response = await apiService.sendMessage(conversationId.toString(), content, type)
      setMessages(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      setError('Failed to send message')
      console.error('Error sending message:', err)
      throw err
    }
  }, [])

  // Load online users
  const loadOnlineUsers = useCallback(async () => {
    try {
      const response = await apiService.getOnlineUsers()
      // API returns nested data: response.data.data
      const usersData = response.data?.data || response.data
      setOnlineUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err) {
      console.error('Error loading online users:', err)
      setOnlineUsers([])
    }
  }, [])

  // Search messages
  const searchMessages = useCallback(async (query: string, conversationId?: number) => {
    try {
      const response = await apiService.searchMessages(query, conversationId?.toString())
      return response.data
    } catch (err) {
      setError('Failed to search messages')
      console.error('Error searching messages:', err)
      return []
    }
  }, [])

  // Add reaction
  const addReaction = useCallback(async (messageId: number, emoji: string) => {
    try {
      await apiService.addReaction(messageId.toString(), emoji)
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, reactions: [...(msg.reactions || []), { emoji, user_id: currentUser?.id || 0 }] }
          : msg
      ))
    } catch (err) {
      console.error('Error adding reaction:', err)
    }
  }, [currentUser])

  // Remove reaction
  const removeReaction = useCallback(async (messageId: number, emoji: string) => {
    try {
      await apiService.removeReaction(messageId.toString(), emoji)
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              reactions: (msg.reactions || []).filter(r => 
                !(r.emoji === emoji && r.user_id === currentUser?.id)
              )
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

  // Initialize chat data
  useEffect(() => {
    loadCurrentUser()
    loadTeams()
    loadConversations()
    loadOnlineUsers()
  }, [loadCurrentUser, loadTeams, loadConversations, loadOnlineUsers])

  return {
    // State
    currentUser,
    teams,
    channels,
    conversations,
    currentConversation,
    messages,
    onlineUsers,
    isLoading,
    error,
    
    // Actions
    setCurrentConversation,
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
    
    // Utils
    setError,
  }
}
