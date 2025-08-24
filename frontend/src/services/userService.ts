import { api, PaginatedResponse } from './api'
import { User } from './authService'

// User types
export interface UpdateUserData {
  name?: string
  username?: string
  bio?: string
  avatar?: string
  status?: string
  settings?: Record<string, any>
}

export interface UserSearchParams {
  q?: string
  status?: string
  role?: string
  page?: number
  limit?: number
}

export interface UserStatus {
  id: number
  user_id: number
  status: 'online' | 'offline' | 'away' | 'busy'
  status_message?: string
  last_seen_at: string
  created_at: string
  updated_at: string
}

// User service
export const userService = {
  // Get all users (with pagination and search)
  getUsers: async (params: UserSearchParams = {}): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params })
    return response.data.data
  },

  // Get user by ID
  getUser: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`)
    return response.data.data
  },

  // Update current user
  updateProfile: async (data: UpdateUserData): Promise<User> => {
    const response = await api.put<User>('/users/profile', data)
    return response.data.data
  },

  // Update user status
  updateStatus: async (status: string, statusMessage?: string): Promise<UserStatus> => {
    const response = await api.put<UserStatus>('/users/status', {
      status,
      status_message: statusMessage
    })
    return response.data.data
  },

  // Get user status
  getUserStatus: async (userId: number): Promise<UserStatus> => {
    const response = await api.get<UserStatus>(`/users/${userId}/status`)
    return response.data.data
  },

  // Search users
  searchUsers: async (query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users/search', {
      params: { q: query, page, limit }
    })
    return response.data.data
  },

  // Get online users
  getOnlineUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/online')
    return response.data.data
  },

  // Get user preferences
  getUserPreferences: async (): Promise<Record<string, any>> => {
    const response = await api.get<Record<string, any>>('/users/preferences')
    return response.data.data
  },

  // Update user preferences
  updateUserPreferences: async (preferences: Record<string, any>): Promise<Record<string, any>> => {
    const response = await api.put<Record<string, any>>('/users/preferences', preferences)
    return response.data.data
  },
}

export default userService
