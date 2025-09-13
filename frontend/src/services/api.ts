const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    this.updateToken()
  }

  updateToken() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    // Validate token format (should have 2 dots for JWT)
    if (this.token && this.token.split('.').length !== 3) {
      console.warn('Invalid JWT token format, clearing token')
      this.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    }

    // Always get the latest token
    this.updateToken()
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const baseHeaders = this.getHeaders()

    // Build headers dynamically. If body is a string (JSON), set Content-Type accordingly.
    const isJsonBody = typeof options.body === 'string'
    const headers: HeadersInit = {
      ...baseHeaders,
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(data: {
    name: string
    email: string
    username: string
    password: string
    password_confirmation: string
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  // Teams endpoints
  async getTeams() {
    return this.request('/teams')
  }

  async createTeam(data: { name: string; description?: string; is_private?: boolean }) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTeam(teamId: string) {
    return this.request(`/teams/${teamId}`)
  }

  async updateTeam(teamId: string, data: { name?: string; description?: string; is_private?: boolean }) {
    return this.request(`/teams/${teamId}/channels`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTeam(teamId: string) {
    return this.request(`/teams/${teamId}`, {
      method: 'DELETE',
    })
  }

  // Channels endpoints
  async getChannels(teamId: string) {
    return this.request(`/teams/${teamId}/channels`)
  }

  async createChannel(teamId: string, data: { name: string; description?: string; is_private?: boolean }) {
    return this.request(`/teams/${teamId}/channels`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getChannel(teamId: string, channelId: string) {
    return this.request(`/teams/${teamId}/channels/${channelId}`)
  }

  async updateChannel(teamId: string, channelId: string, data: { name?: string; description?: string; is_private?: boolean }) {
    return this.request(`/teams/${teamId}/channels/${channelId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteChannel(teamId: string, channelId: string) {
    return this.request(`/teams/${teamId}/channels/${channelId}`, {
      method: 'DELETE',
    })
  }

  // Conversations endpoints
  async getConversations() {
    return this.request('/conversations')
  }

  async getConversation(conversationId: string) {
    return this.request(`/conversations/${conversationId}`)
  }

  async getConversationMembers(conversationId: string) {
    return this.request(`/conversations/${conversationId}/members`)
  }

  async createDirectConversation(userId: string) {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        type: 'direct',
        participant_id: userId,
      }),
    })
  }

  async addMemberToConversation(conversationId: string, userId: string) {
    return this.request(`/conversations/${conversationId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
  }

  async removeMemberFromConversation(conversationId: string, userId: string) {
    return this.request(`/conversations/${conversationId}/members/${userId}`, {
      method: 'DELETE',
    })
  }

  async pinConversation(conversationId: string) {
    return this.request(`/conversations/${conversationId}/pin`, {
      method: 'POST',
    })
  }

  async unpinConversation(conversationId: string) {
    return this.request(`/conversations/${conversationId}/unpin`, {
      method: 'POST',
    })
  }

  // Messages endpoints
  async getMessages(conversationId: string, page: number = 1, perPage: number = 50) {
    return this.request(`/conversations/${conversationId}/messages?page=${page}&per_page=${perPage}`)
  }

  async sendMessage(conversationId: string, content: string, type: string = 'text', metadata?: any) {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        type,
        metadata,
      }),
    })
  }

  async editMessage(messageId: string, content: string) {
    return this.request(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  }

  async deleteMessage(messageId: string) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    })
  }

  async addReaction(messageId: string, emoji: string) {
    return this.request(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    })
  }

  async removeReaction(messageId: string, emoji: string) {
    return this.request(`/messages/${messageId}/reactions`, {
      method: 'DELETE',
      body: JSON.stringify({ emoji }),
    })
  }

  async bookmarkMessage(messageId: string, note?: string) {
    return this.request(`/messages/${messageId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    })
  }

  async removeBookmark(messageId: string) {
    return this.request(`/messages/${messageId}/bookmark`, {
      method: 'DELETE',
    })
  }

  async getBookmarks() {
    return this.request('/messages/bookmarks')
  }

  // Search endpoints
  async searchMessages(query: string, conversationId?: string) {
    const params = new URLSearchParams({ q: query })
    if (conversationId) {
      params.append('conversation_id', conversationId)
    }
    return this.request(`/search/messages?${params}`)
  }

  async searchUsers(query: string) {
    return this.request(`/search/users?q=${encodeURIComponent(query)}`)
  }

  async searchConversations(query: string) {
    return this.request(`/search/conversations?q=${encodeURIComponent(query)}`)
  }

  // User status endpoints
  async updateUserStatus(status: 'online' | 'offline' | 'away' | 'busy', statusMessage?: string) {
    return this.request('/user/status', {
      method: 'PUT',
      body: JSON.stringify({ status, status_message: statusMessage }),
    })
  }

  async getOnlineUsers() {
    return this.request('/users/online')
  }

  async getUsersStatus(userIds: number[]) {
    return this.request('/users/status', {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    })
  }

  async getUserStatus(userId: number) {
    return this.request(`/users/${userId}/status`)
  }

  async getCurrentUserStatus() {
    return this.request('/users/me/status')
  }

  // Thread endpoints
  async getThreadMessages(messageId: string, page: number = 1, perPage: number = 20) {
    return this.request(`/messages/${messageId}/thread?page=${page}&per_page=${perPage}`)
  }

  async sendThreadMessage(messageId: string, content: string) {
    return this.request(`/messages/${messageId}/thread`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  // Generic GET method
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' })
  }

  // Generic POST method
  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Generic PUT method
  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Generic DELETE method
  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const apiService = new ApiService()
export default apiService