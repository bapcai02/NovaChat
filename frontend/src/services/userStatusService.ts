import { api } from './api'

export interface UserStatus {
  userId: string
  roomId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  statusMessage?: string
  userName: string
  userName: string
  timestamp: string
}

export interface TypingEvent {
  roomId: string
  userId: string
  userName: string
  userName: string
  timestamp: string
}

export interface OnlineUser {
  id: string
  name: string
  username: string
  avatar?: string
  status: string
  statusMessage?: string
  lastSeenAt: string
}

export const userStatusService = {
  // Update user status
  updateStatus: async (status: string, statusMessage?: string, roomId: string = '1'): Promise<UserStatus> => {
    const response = await api.post<UserStatus>('/user/status', {
      status,
      statusMessage,
      roomId
    })
    return response.data.data
  },

  // Start typing
  startTyping: async (roomId: string = '1'): Promise<TypingEvent> => {
    const response = await api.post<TypingEvent>('/user/typing/start', {
      roomId
    })
    return response.data.data
  },

  // Stop typing
  stopTyping: async (roomId: string = '1'): Promise<TypingEvent> => {
    const response = await api.post<TypingEvent>('/user/typing/stop', {
      roomId
    })
    return response.data.data
  },

  // Get online users
  getOnlineUsers: async (roomId: string = '1'): Promise<OnlineUser[]> => {
    const response = await api.get<OnlineUser[]>('/user/online', {
      params: { roomId }
    })
    return response.data.data
  }
}
