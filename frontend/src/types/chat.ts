// Chat domain types

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

export interface Bookmark {
  id: number
  user_id: number
  message_id: number
  note?: string
  created_at: string
  message?: Message
}


