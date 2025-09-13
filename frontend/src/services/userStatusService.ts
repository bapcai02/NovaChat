import { apiService } from './api'

export interface UserStatus {
  userId: string
  roomId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  statusMessage?: string
  userName: string
  timestamp: string
}

export interface TypingEvent {
  roomId: string
  userId: string
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
    await apiService.updateUserStatus(status as any, statusMessage)
    return {
      userId: 'current-user',
      roomId,
      status: status as any,
      statusMessage,
      userName: 'Current User',
      timestamp: new Date().toISOString()
    }
  },

  // Start typing
  startTyping: async (roomId: string = '1'): Promise<TypingEvent> => {
    // Note: Typing events not implemented in apiService yet
    return {
      roomId,
      userId: 'current-user',
      userName: 'Current User',
      timestamp: new Date().toISOString()
    }
  },

  // Stop typing
  stopTyping: async (roomId: string = '1'): Promise<TypingEvent> => {
    // Note: Typing events not implemented in apiService yet
    return {
      roomId,
      userId: 'current-user',
      userName: 'Current User',
      timestamp: new Date().toISOString()
    }
  },

  // Get online users
  getOnlineUsers: async (): Promise<OnlineUser[]> => {
    const response: any = await apiService.getOnlineUsers()
    return response?.data?.map((user: any) => ({
      id: user.id.toString(),
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      status: user.status || 'online',
      statusMessage: user.status_message,
      lastSeenAt: user.last_seen_at || new Date().toISOString()
    }))
  }
}
