// Common types used across the application

// User types
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
  user?: User
  reactions?: MessageReaction[]
  replies?: Message[]
}

export interface MessageReaction {
  id: number
  message_id: number
  user_id: number
  emoji: string
  created_at: string
  user?: User
}

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

export interface AuthResponse {
  user: User
  token: string
  token_type: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

// UI types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
}

// Theme types
export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    accent: string
  }
  isCustom?: boolean
}

// Voice message types
export interface VoiceMessage {
  id: string
  audioUrl: string
  duration: number
  author: string
  timestamp: string
}

// Search types
export interface SearchResult {
  type: 'message' | 'channel' | 'user'
  id: number
  title: string
  content: string
  metadata?: Record<string, any>
}
