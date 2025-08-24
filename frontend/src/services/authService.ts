import { api, ApiResponse } from './api'

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  username: string
  password: string
  password_confirmation: string
}

export interface User {
  id: number
  name: string
  email: string
  username: string
  avatar?: string
  bio?: string
  status: string
  role: string
  last_seen_at?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  token: string
  token_type: string
}

export interface RefreshTokenResponse {
  token: string
  token_type: string
}

// Auth service
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data.data
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data.data
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Even if logout fails, clear local storage
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me')
    return response.data.data
  },

  // Refresh token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh')
    return response.data.data
  },

  // Verify token
  verifyToken: async (): Promise<boolean> => {
    try {
      await api.get('/auth/me')
      return true
    } catch (error) {
      return false
    }
  },
}

export default authService
