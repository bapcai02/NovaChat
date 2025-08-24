import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// UI state interface
interface UIState {
  // Theme
  theme: 'light' | 'dark'
  
  // Sidebar states
  isLeftSidebarOpen: boolean
  isRightSidebarOpen: boolean
  
  // Modal states
  isCreateChannelModalOpen: boolean
  isCreateDirectMessageModalOpen: boolean
  isSearchModalOpen: boolean
  isKeyboardShortcutsModalOpen: boolean
  isMessageAnalyticsModalOpen: boolean
  isVoiceRecorderModalOpen: boolean
  isThemeManagerModalOpen: boolean
  isThemeCustomizerModalOpen: boolean
  
  // Chat states
  selectedThread: number | null
  isTyping: boolean
  typingUsers: string[]
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  
  // Loading states
  isLoading: boolean
  loadingMessage: string
  
  // Error states
  error: string | null
  showError: boolean
}

// Notification interface
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
}

// Initial state
const initialState: UIState = {
  // Theme
  theme: typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light' | 'dark') || 'dark' : 'dark',
  
  // Sidebar states
  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,
  
  // Modal states
  isCreateChannelModalOpen: false,
  isCreateDirectMessageModalOpen: false,
  isSearchModalOpen: false,
  isKeyboardShortcutsModalOpen: false,
  isMessageAnalyticsModalOpen: false,
  isVoiceRecorderModalOpen: false,
  isThemeManagerModalOpen: false,
  isThemeCustomizerModalOpen: false,
  
  // Chat states
  selectedThread: null,
  isTyping: false,
  typingUsers: [],
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // Loading states
  isLoading: false,
  loadingMessage: '',
  
  // Error states
  error: null,
  showError: false,
}

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload)
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.theme)
      }
    },
    
    // Sidebar actions
    toggleLeftSidebar: (state) => {
      state.isLeftSidebarOpen = !state.isLeftSidebarOpen
    },
    toggleRightSidebar: (state) => {
      state.isRightSidebarOpen = !state.isRightSidebarOpen
    },
    setLeftSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isLeftSidebarOpen = action.payload
    },
    setRightSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isRightSidebarOpen = action.payload
    },
    
    // Modal actions
    openCreateChannelModal: (state) => {
      state.isCreateChannelModalOpen = true
    },
    closeCreateChannelModal: (state) => {
      state.isCreateChannelModalOpen = false
    },
    openCreateDirectMessageModal: (state) => {
      state.isCreateDirectMessageModalOpen = true
    },
    closeCreateDirectMessageModal: (state) => {
      state.isCreateDirectMessageModalOpen = false
    },
    openSearchModal: (state) => {
      state.isSearchModalOpen = true
    },
    closeSearchModal: (state) => {
      state.isSearchModalOpen = false
    },
    openKeyboardShortcutsModal: (state) => {
      state.isKeyboardShortcutsModalOpen = true
    },
    closeKeyboardShortcutsModal: (state) => {
      state.isKeyboardShortcutsModalOpen = false
    },
    openMessageAnalyticsModal: (state) => {
      state.isMessageAnalyticsModalOpen = true
    },
    closeMessageAnalyticsModal: (state) => {
      state.isMessageAnalyticsModalOpen = false
    },
    openVoiceRecorderModal: (state) => {
      state.isVoiceRecorderModalOpen = true
    },
    closeVoiceRecorderModal: (state) => {
      state.isVoiceRecorderModalOpen = false
    },
    openThemeManagerModal: (state) => {
      state.isThemeManagerModalOpen = true
    },
    closeThemeManagerModal: (state) => {
      state.isThemeManagerModalOpen = false
    },
    openThemeCustomizerModal: (state) => {
      state.isThemeCustomizerModalOpen = true
    },
    closeThemeCustomizerModal: (state) => {
      state.isThemeCustomizerModalOpen = false
    },
    
    // Chat actions
    setSelectedThread: (state, action: PayloadAction<number | null>) => {
      state.selectedThread = action.payload
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    addTypingUser: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload)
      }
    },
    removeTypingUser: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(user => user !== action.payload)
    },
    clearTypingUsers: (state) => {
      state.typingUsers = []
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      }
      state.notifications.unshift(notification)
      if (!notification.read) {
        state.unreadCount += 1
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount -= 1
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        state.unreadCount -= 1
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    
    // Loading actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setLoadingMessage: (state, action: PayloadAction<string>) => {
      state.loadingMessage = action.payload
    },
    
    // Error actions
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.showError = !!action.payload
    },
    clearError: (state) => {
      state.error = null
      state.showError = false
    },
    setShowError: (state, action: PayloadAction<boolean>) => {
      state.showError = action.payload
    },
  },
})

export const {
  // Theme
  setTheme,
  toggleTheme,
  
  // Sidebar
  toggleLeftSidebar,
  toggleRightSidebar,
  setLeftSidebarOpen,
  setRightSidebarOpen,
  
  // Modals
  openCreateChannelModal,
  closeCreateChannelModal,
  openCreateDirectMessageModal,
  closeCreateDirectMessageModal,
  openSearchModal,
  closeSearchModal,
  openKeyboardShortcutsModal,
  closeKeyboardShortcutsModal,
  openMessageAnalyticsModal,
  closeMessageAnalyticsModal,
  openVoiceRecorderModal,
  closeVoiceRecorderModal,
  openThemeManagerModal,
  closeThemeManagerModal,
  openThemeCustomizerModal,
  closeThemeCustomizerModal,
  
  // Chat
  setSelectedThread,
  setTyping,
  addTypingUser,
  removeTypingUser,
  clearTypingUsers,
  
  // Notifications
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  
  // Loading
  setLoading,
  setLoadingMessage,
  
  // Error
  setError,
  clearError,
  setShowError,
} = uiSlice.actions

export default uiSlice.reducer
