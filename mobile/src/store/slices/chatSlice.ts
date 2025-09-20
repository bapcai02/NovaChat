import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message, User, ChatState } from '../../types';

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  onlineUsers: new Set(),
  typingUsers: {},
  unreadCounts: {},
  isLoading: false,
  isConnected: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const existingIndex = state.conversations.findIndex(c => c.id === action.payload.id);
      if (existingIndex >= 0) {
        state.conversations[existingIndex] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ conversationId: number; messages: Message[] }>) => {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { conversation_id } = action.payload;
      if (!state.messages[conversation_id]) {
        state.messages[conversation_id] = [];
      }
      state.messages[conversation_id].push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const { conversation_id, id } = action.payload;
      if (state.messages[conversation_id]) {
        const index = state.messages[conversation_id].findIndex(m => m.id === id);
        if (index >= 0) {
          state.messages[conversation_id][index] = action.payload;
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<{ conversationId: number; messageId: number }>) => {
      const { conversationId, messageId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter(
          m => m.id !== messageId
        );
      }
    },
    setOnlineUsers: (state, action: PayloadAction<number[]>) => {
      state.onlineUsers = new Set(action.payload);
    },
    addOnlineUser: (state, action: PayloadAction<number>) => {
      state.onlineUsers.add(action.payload);
    },
    removeOnlineUser: (state, action: PayloadAction<number>) => {
      state.onlineUsers.delete(action.payload);
    },
    setTypingUsers: (state, action: PayloadAction<{ conversationId: number; users: User[] }>) => {
      state.typingUsers[action.payload.conversationId] = action.payload.users;
    },
    addTypingUser: (state, action: PayloadAction<{ conversationId: number; user: User }>) => {
      const { conversationId, user } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      const existingIndex = state.typingUsers[conversationId].findIndex(u => u.id === user.id);
      if (existingIndex < 0) {
        state.typingUsers[conversationId].push(user);
      }
    },
    removeTypingUser: (state, action: PayloadAction<{ conversationId: number; userId: number }>) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          u => u.id !== userId
        );
      }
    },
    setUnreadCount: (state, action: PayloadAction<{ conversationId: number; count: number }>) => {
      state.unreadCounts[action.payload.conversationId] = action.payload.count;
    },
    clearUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCounts[action.payload] = 0;
    },
  },
});

export const {
  setLoading,
  setConnected,
  setConversations,
  addConversation,
  setCurrentConversation,
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setUnreadCount,
  clearUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
