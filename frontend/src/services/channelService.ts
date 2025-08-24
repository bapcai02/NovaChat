import { api, PaginatedResponse } from './api'

// Channel types
export interface Channel {
  id: number
  name: string
  display_name: string
  description?: string
  type: 'public' | 'private' | 'direct' | 'announcement' | 'support'
  topic?: string
  purpose?: string
  avatar?: string
  banner?: string
  member_count: number
  message_count: number
  last_message_at?: string
  last_message_by?: number
  created_by: number
  owner_id?: number
  permissions?: Record<string, any>
  settings?: Record<string, any>
  is_archived: boolean
  is_read_only: boolean
  is_pinned: boolean
  is_featured: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface CreateChannelData {
  name: string
  display_name: string
  description?: string
  type: 'public' | 'private'
  topic?: string
  purpose?: string
  permissions?: Record<string, any>
}

export interface UpdateChannelData {
  display_name?: string
  description?: string
  topic?: string
  purpose?: string
  permissions?: Record<string, any>
  settings?: Record<string, any>
}

export interface ChannelMember {
  id: number
  channel_id: number
  user_id: number
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  user?: {
    id: number
    name: string
    username: string
    avatar?: string
    status: string
  }
}

// Channel service
export const channelService = {
  // Get all channels for current user
  getChannels: async (): Promise<Channel[]> => {
    const response = await api.get<Channel[]>('/channels')
    return response.data.data
  },

  // Get channel by ID
  getChannel: async (id: number): Promise<Channel> => {
    const response = await api.get<Channel>(`/channels/${id}`)
    return response.data.data
  },

  // Create new channel
  createChannel: async (data: CreateChannelData): Promise<Channel> => {
    const response = await api.post<Channel>('/channels', data)
    return response.data.data
  },

  // Update channel
  updateChannel: async (id: number, data: UpdateChannelData): Promise<Channel> => {
    const response = await api.put<Channel>(`/channels/${id}`, data)
    return response.data.data
  },

  // Delete channel
  deleteChannel: async (id: number): Promise<void> => {
    await api.delete(`/channels/${id}`)
  },

  // Get channel members
  getChannelMembers: async (id: number): Promise<ChannelMember[]> => {
    const response = await api.get<ChannelMember[]>(`/channels/${id}/members`)
    return response.data.data
  },

  // Add member to channel
  addMember: async (channelId: number, userId: number, role: string = 'member'): Promise<void> => {
    await api.post(`/channels/${channelId}/members`, { user_id: userId, role })
  },

  // Remove member from channel
  removeMember: async (channelId: number, userId: number): Promise<void> => {
    await api.delete(`/channels/${channelId}/members/${userId}`)
  },

  // Update member role
  updateMemberRole: async (channelId: number, userId: number, role: string): Promise<void> => {
    await api.put(`/channels/${channelId}/members/${userId}`, { role })
  },

  // Join channel
  joinChannel: async (id: number): Promise<void> => {
    await api.post(`/channels/${id}/join`)
  },

  // Leave channel
  leaveChannel: async (id: number): Promise<void> => {
    await api.post(`/channels/${id}/leave`)
  },
}

export default channelService
