import { api, PaginatedResponse } from './api'

// Message types
export interface Message {
  id: number
  channel_id: number
  user_id: number
  parent_id?: number
  content: string
  type: 'text' | 'image' | 'file' | 'system' | 'reaction'
  metadata?: Record<string, any>
  is_edited: boolean
  edited_at?: string
  is_pinned: boolean
  is_deleted: boolean
  deleted_at?: string
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    username: string
    avatar?: string
  }
  reactions?: MessageReaction[]
  replies?: Message[]
}

export interface CreateMessageData {
  content: string
  type?: 'text' | 'image' | 'file' | 'system' | 'reaction'
  parent_id?: number
  metadata?: Record<string, any>
}

export interface UpdateMessageData {
  content: string
}

export interface MessageReaction {
  id: number
  message_id: number
  user_id: number
  emoji: string
  created_at: string
  user?: {
    id: number
    name: string
    username: string
    avatar?: string
  }
}

export interface AddReactionData {
  emoji: string
}

// Message service
export const messageService = {
  // Get messages for a channel
  getMessages: async (
    channelId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Message>> => {
    const response = await api.get<PaginatedResponse<Message>>(
      `/channels/${channelId}/messages`,
      {
        params: { page, limit }
      }
    )
    return response.data.data
  },

  // Get message by ID
  getMessage: async (id: number): Promise<Message> => {
    const response = await api.get<Message>(`/messages/${id}`)
    return response.data.data
  },

  // Send message
  sendMessage: async (channelId: number, data: CreateMessageData): Promise<Message> => {
    const response = await api.post<Message>(`/channels/${channelId}/messages`, data)
    return response.data.data
  },

  // Update message
  updateMessage: async (id: number, data: UpdateMessageData): Promise<Message> => {
    const response = await api.put<Message>(`/messages/${id}`, data)
    return response.data.data
  },

  // Delete message
  deleteMessage: async (id: number): Promise<void> => {
    await api.delete(`/messages/${id}`)
  },

  // Pin message
  pinMessage: async (id: number): Promise<void> => {
    await api.post(`/messages/${id}/pin`)
  },

  // Unpin message
  unpinMessage: async (id: number): Promise<void> => {
    await api.delete(`/messages/${id}/pin`)
  },

  // Get message reactions
  getMessageReactions: async (messageId: number): Promise<MessageReaction[]> => {
    const response = await api.get<MessageReaction[]>(`/messages/${messageId}/reactions`)
    return response.data.data
  },

  // Add reaction to message
  addReaction: async (messageId: number, data: AddReactionData): Promise<MessageReaction> => {
    const response = await api.post<MessageReaction>(`/messages/${messageId}/reactions`, data)
    return response.data.data
  },

  // Remove reaction from message
  removeReaction: async (messageId: number, emoji: string): Promise<void> => {
    await api.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`)
  },

  // Get message replies
  getMessageReplies: async (messageId: number): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/messages/${messageId}/replies`)
    return response.data.data
  },

  // Search messages
  searchMessages: async (
    query: string,
    channelId?: number,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Message>> => {
    const params: any = { q: query, page, limit }
    if (channelId) params.channel_id = channelId

    const response = await api.get<PaginatedResponse<Message>>('/messages/search', {
      params
    })
    return response.data.data
  },
}

export default messageService
