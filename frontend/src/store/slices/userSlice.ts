import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { userService, UpdateUserData, UserSearchParams, UserStatus } from '../../services/userService'
import { User } from '../../services/authService'

// User state interface
interface UserState {
  users: User[]
  currentUser: User | null
  onlineUsers: User[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
}

// Initial state
const initialState: UserState = {
  users: [],
  currentUser: null,
  onlineUsers: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: UserSearchParams = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers(params)
      return {
        users: response.data,
        hasMore: response.current_page < response.last_page,
        currentPage: response.current_page,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id: number, { rejectWithValue }) => {
    try {
      const user = await userService.getUser(id)
      return user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (data: UpdateUserData, { rejectWithValue }) => {
    try {
      const user = await userService.updateProfile(data)
      return user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const updateStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ status, statusMessage }: { status: string; statusMessage?: string }, { rejectWithValue }) => {
    try {
      const userStatus = await userService.updateStatus(status, statusMessage)
      return userStatus
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status')
    }
  }
)

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async ({ query, page = 1, limit = 20 }: { query: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(query, page, limit)
      return {
        users: response.data,
        hasMore: response.current_page < response.last_page,
        currentPage: response.current_page,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users')
    }
  }
)

export const fetchOnlineUsers = createAsyncThunk(
  'users/fetchOnlineUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await userService.getOnlineUsers()
      return users
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch online users')
    }
  }
)

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearUsers: (state) => {
      state.users = []
      state.currentPage = 1
      state.hasMore = true
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload)
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = action.payload
      }
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(user => user.id !== action.payload)
      if (state.currentUser?.id === action.payload) {
        state.currentUser = null
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ users: User[]; hasMore: boolean; currentPage: number }>) => {
        state.isLoading = false
        if (action.payload.currentPage === 1) {
          state.users = action.payload.users
        } else {
          state.users.push(...action.payload.users)
        }
        state.hasMore = action.payload.hasMore
        state.currentPage = action.payload.currentPage
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch user
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.currentUser = action.payload
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload
        }
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update status
    builder
      .addCase(updateStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateStatus.fulfilled, (state, action: PayloadAction<UserStatus>) => {
        state.isLoading = false
        // Update user status in the list
        const user = state.users.find(u => u.id === action.payload.user_id)
        if (user) {
          // Update user status (you might need to add status field to User type)
        }
        state.error = null
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Search users
    builder
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchUsers.fulfilled, (state, action: PayloadAction<{ users: User[]; hasMore: boolean; currentPage: number }>) => {
        state.isLoading = false
        if (action.payload.currentPage === 1) {
          state.users = action.payload.users
        } else {
          state.users.push(...action.payload.users)
        }
        state.hasMore = action.payload.hasMore
        state.currentPage = action.payload.currentPage
        state.error = null
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch online users
    builder
      .addCase(fetchOnlineUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOnlineUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false
        state.onlineUsers = action.payload
        state.error = null
      })
      .addCase(fetchOnlineUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  clearUsers,
  setCurrentUser,
  addUser,
  updateUserInList,
  removeUser,
} = userSlice.actions
export default userSlice.reducer
