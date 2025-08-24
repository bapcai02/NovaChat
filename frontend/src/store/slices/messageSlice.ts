import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { messageService, Message, CreateMessageData, UpdateMessageData, MessageReaction, AddReactionData } from '../../services/messageService'

// Message state interface
interface MessageState {
  messages: Message[]
  currentMessage: Message | null
  isLoading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
}

// Initial state
const initialState: MessageState = {
  messages: [],
  currentMessage: null,
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
}

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ channelId, page = 1, limit = 50 }: { channelId: number; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(channelId, page, limit)
      return { messages: response.data, hasMore: response.current_page < response.last_page, currentPage: response.current_page }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ channelId, data }: { channelId: number; data: CreateMessageData }, { rejectWithValue }) => {
    try {
      const message = await messageService.sendMessage(channelId, data)
      return message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

export const updateMessage = createAsyncThunk(
  'messages/updateMessage',
  async ({ id, data }: { id: number; data: UpdateMessageData }, { rejectWithValue }) => {
    try {
      const message = await messageService.updateMessage(id, data)
      return message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update message')
    }
  }
)

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (id: number, { rejectWithValue }) => {
    try {
      await messageService.deleteMessage(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message')
    }
  }
)

export const addReaction = createAsyncThunk(
  'messages/addReaction',
  async ({ messageId, data }: { messageId: number; data: AddReactionData }, { rejectWithValue }) => {
    try {
      const reaction = await messageService.addReaction(messageId, data)
      return { messageId, reaction }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add reaction')
    }
  }
)

export const removeReaction = createAsyncThunk(
  'messages/removeReaction',
  async ({ messageId, emoji }: { messageId: number; emoji: string }, { rejectWithValue }) => {
    try {
      await messageService.removeReaction(messageId, emoji)
      return { messageId, emoji }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove reaction')
    }
  }
)

export const searchMessages = createAsyncThunk(
  'messages/searchMessages',
  async ({ query, channelId, page = 1, limit = 20 }: { query: string; channelId?: number; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await messageService.searchMessages(query, channelId, page, limit)
      return { messages: response.data, hasMore: response.current_page < response.last_page, currentPage: response.current_page }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search messages')
    }
  }
)

// Message slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMessages: (state) => {
      state.messages = []
      state.currentPage = 1
      state.hasMore = true
    },
    setCurrentMessage: (state, action: PayloadAction<Message | null>) => {
      state.currentMessage = action.payload
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload)
    },
    updateMessageInList: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex(message => message.id === action.payload.id)
      if (index !== -1) {
        state.messages[index] = action.payload
      }
    },
    removeMessage: (state, action: PayloadAction<number>) => {
      state.messages = state.messages.filter(message => message.id !== action.payload)
    },
    addReactionToMessage: (state, action: PayloadAction<{ messageId: number; reaction: MessageReaction }>) => {
      const message = state.messages.find(m => m.id === action.payload.messageId)
      if (message) {
        if (!message.reactions) {
          message.reactions = []
        }
        message.reactions.push(action.payload.reaction)
      }
    },
    removeReactionFromMessage: (state, action: PayloadAction<{ messageId: number; emoji: string }>) => {
      const message = state.messages.find(m => m.id === action.payload.messageId)
      if (message && message.reactions) {
        message.reactions = message.reactions.filter(r => r.emoji !== action.payload.emoji)
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<{ messages: Message[]; hasMore: boolean; currentPage: number }>) => {
        state.isLoading = false
        if (action.payload.currentPage === 1) {
          state.messages = action.payload.messages
        } else {
          state.messages.push(...action.payload.messages)
        }
        state.hasMore = action.payload.hasMore
        state.currentPage = action.payload.currentPage
        state.error = null
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.isLoading = false
        state.messages.unshift(action.payload)
        state.error = null
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update message
    builder
      .addCase(updateMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.isLoading = false
        const index = state.messages.findIndex(message => message.id === action.payload.id)
        if (index !== -1) {
          state.messages[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete message
    builder
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMessage.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false
        state.messages = state.messages.filter(message => message.id !== action.payload)
        state.error = null
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Add reaction
    builder
      .addCase(addReaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addReaction.fulfilled, (state, action: PayloadAction<{ messageId: number; reaction: MessageReaction }>) => {
        state.isLoading = false
        const message = state.messages.find(m => m.id === action.payload.messageId)
        if (message) {
          if (!message.reactions) {
            message.reactions = []
          }
          message.reactions.push(action.payload.reaction)
        }
        state.error = null
      })
      .addCase(addReaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Remove reaction
    builder
      .addCase(removeReaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeReaction.fulfilled, (state, action: PayloadAction<{ messageId: number; emoji: string }>) => {
        state.isLoading = false
        const message = state.messages.find(m => m.id === action.payload.messageId)
        if (message && message.reactions) {
          message.reactions = message.reactions.filter(r => r.emoji !== action.payload.emoji)
        }
        state.error = null
      })
      .addCase(removeReaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Search messages
    builder
      .addCase(searchMessages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchMessages.fulfilled, (state, action: PayloadAction<{ messages: Message[]; hasMore: boolean; currentPage: number }>) => {
        state.isLoading = false
        if (action.payload.currentPage === 1) {
          state.messages = action.payload.messages
        } else {
          state.messages.push(...action.payload.messages)
        }
        state.hasMore = action.payload.hasMore
        state.currentPage = action.payload.currentPage
        state.error = null
      })
      .addCase(searchMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  clearMessages,
  setCurrentMessage,
  addMessage,
  updateMessageInList,
  removeMessage,
  addReactionToMessage,
  removeReactionFromMessage,
} = messageSlice.actions
export default messageSlice.reducer
