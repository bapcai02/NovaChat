// User types
export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  is_online?: boolean;
  last_seen_at?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'banned';
  role?: 'super_admin' | 'admin' | 'moderator' | 'user' | 'guest';
}

// Team types
export interface Team {
  id: number;
  name: string;
  description?: string;
  slug: string;
  owner_id: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Channel types
export interface Channel {
  id: number;
  name: string;
  description?: string;
  team_id: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Conversation types
export interface Conversation {
  id: number;
  name?: string;
  type: 'direct' | 'group' | 'channel';
  team_id?: number;
  channel_id?: number;
  last_message?: Message;
  unread_count: number;
  is_pinned: boolean;
  is_muted: boolean;
  members?: User[];
  created_at: string;
  updated_at: string;
}

// Message types
export interface Message {
  id: number;
  conversation_id: number;
  parent_id?: number;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: any;
  attachments?: Attachment[];
  reactions?: Reaction[];
  is_edited: boolean;
  edited_at?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// Attachment types
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  mime_type: string;
}

// Reaction types
export interface Reaction {
  id: number;
  emoji: string;
  user_id: number;
  user: User;
  created_at: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Chat types
export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: { [conversationId: number]: Message[] };
  onlineUsers: Set<number>;
  typingUsers: { [conversationId: number]: User[] };
  unreadCounts: { [conversationId: number]: number };
  isLoading: boolean;
  isConnected: boolean;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: { conversationId: number };
  Settings: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Conversations: undefined;
  Teams: undefined;
  Settings: undefined;
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { [key: string]: string[] };
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data?: any;
  conversation_id?: number;
  user_id?: number;
  message?: Message;
  typing?: boolean;
  online?: boolean;
}

// Call types
export interface CallState {
  isInCall: boolean;
  isRinging: boolean;
  callType: 'audio' | 'video' | null;
  participants: User[];
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'message' | 'call' | 'system';
  created_at: string;
}
