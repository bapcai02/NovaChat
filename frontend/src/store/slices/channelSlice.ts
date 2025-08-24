import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { channelService, Channel, CreateChannelData, UpdateChannelData, ChannelMember } from '../../services/channelService'

// Channel state interface
interface ChannelState {
  channels: Channel[]
  currentChannel: Channel | null
  channelMembers: ChannelMember[]
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: ChannelState = {
  channels: [],
  currentChannel: null,
  channelMembers: [],
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchChannels = createAsyncThunk(
  'channels/fetchChannels',
  async (_, { rejectWithValue }) => {
    try {
      const channels = await channelService.getChannels()
      return channels
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch channels')
    }
  }
)

export const fetchChannel = createAsyncThunk(
  'channels/fetchChannel',
  async (id: number, { rejectWithValue }) => {
    try {
      const channel = await channelService.getChannel(id)
      return channel
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch channel')
    }
  }
)

export const createChannel = createAsyncThunk(
  'channels/createChannel',
  async (data: CreateChannelData, { rejectWithValue }) => {
    try {
      const channel = await channelService.createChannel(data)
      return channel
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create channel')
    }
  }
)

export const updateChannel = createAsyncThunk(
  'channels/updateChannel',
  async ({ id, data }: { id: number; data: UpdateChannelData }, { rejectWithValue }) => {
    try {
      const channel = await channelService.updateChannel(id, data)
      return channel
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update channel')
    }
  }
)

export const deleteChannel = createAsyncThunk(
  'channels/deleteChannel',
  async (id: number, { rejectWithValue }) => {
    try {
      await channelService.deleteChannel(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete channel')
    }
  }
)

export const fetchChannelMembers = createAsyncThunk(
  'channels/fetchChannelMembers',
  async (channelId: number, { rejectWithValue }) => {
    try {
      const members = await channelService.getChannelMembers(channelId)
      return { channelId, members }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch channel members')
    }
  }
)

export const joinChannel = createAsyncThunk(
  'channels/joinChannel',
  async (id: number, { rejectWithValue }) => {
    try {
      await channelService.joinChannel(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join channel')
    }
  }
)

export const leaveChannel = createAsyncThunk(
  'channels/leaveChannel',
  async (id: number, { rejectWithValue }) => {
    try {
      await channelService.leaveChannel(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave channel')
    }
  }
)

// Channel slice
const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentChannel: (state, action: PayloadAction<Channel | null>) => {
      state.currentChannel = action.payload
    },
    addChannel: (state, action: PayloadAction<Channel>) => {
      state.channels.push(action.payload)
    },
    updateChannelInList: (state, action: PayloadAction<Channel>) => {
      const index = state.channels.findIndex(channel => channel.id === action.payload.id)
      if (index !== -1) {
        state.channels[index] = action.payload
      }
      if (state.currentChannel?.id === action.payload.id) {
        state.currentChannel = action.payload
      }
    },
    removeChannel: (state, action: PayloadAction<number>) => {
      state.channels = state.channels.filter(channel => channel.id !== action.payload)
      if (state.currentChannel?.id === action.payload) {
        state.currentChannel = null
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch channels
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChannels.fulfilled, (state, action: PayloadAction<Channel[]>) => {
        state.isLoading = false
        state.channels = action.payload
        state.error = null
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch channel
    builder
      .addCase(fetchChannel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChannel.fulfilled, (state, action: PayloadAction<Channel>) => {
        state.isLoading = false
        state.currentChannel = action.payload
        state.error = null
      })
      .addCase(fetchChannel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create channel
    builder
      .addCase(createChannel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createChannel.fulfilled, (state, action: PayloadAction<Channel>) => {
        state.isLoading = false
        state.channels.push(action.payload)
        state.error = null
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update channel
    builder
      .addCase(updateChannel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateChannel.fulfilled, (state, action: PayloadAction<Channel>) => {
        state.isLoading = false
        const index = state.channels.findIndex(channel => channel.id === action.payload.id)
        if (index !== -1) {
          state.channels[index] = action.payload
        }
        if (state.currentChannel?.id === action.payload.id) {
          state.currentChannel = action.payload
        }
        state.error = null
      })
      .addCase(updateChannel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete channel
    builder
      .addCase(deleteChannel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteChannel.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false
        state.channels = state.channels.filter(channel => channel.id !== action.payload)
        if (state.currentChannel?.id === action.payload) {
          state.currentChannel = null
        }
        state.error = null
      })
      .addCase(deleteChannel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch channel members
    builder
      .addCase(fetchChannelMembers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChannelMembers.fulfilled, (state, action: PayloadAction<{ channelId: number; members: ChannelMember[] }>) => {
        state.isLoading = false
        if (state.currentChannel?.id === action.payload.channelId) {
          state.channelMembers = action.payload.members
        }
        state.error = null
      })
      .addCase(fetchChannelMembers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Join channel
    builder
      .addCase(joinChannel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(joinChannel.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false
        // Optionally refresh channels list
        state.error = null
      })
      .addCase(joinChannel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Leave channel
    builder
      .addCase(leaveChannel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(leaveChannel.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false
        state.channels = state.channels.filter(channel => channel.id !== action.payload)
        if (state.currentChannel?.id === action.payload) {
          state.currentChannel = null
        }
        state.error = null
      })
      .addCase(leaveChannel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentChannel, addChannel, updateChannelInList, removeChannel } = channelSlice.actions
export default channelSlice.reducer
