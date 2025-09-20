import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, User, Conversation, Message, Team, Channel } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async setToken(token: string | null): Promise<void> {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders();

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      await this.setToken(response.data.token);
      return response.data;
    }

    throw new Error('Login failed');
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data) {
      await this.setToken(response.data.token);
      return response.data;
    }

    throw new Error('Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      await this.setToken(null);
    }
  }

  async getMe(): Promise<User> {
    const response = await this.request<{ data: User }>('/auth/me');
    return response.data!;
  }

  // User methods
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await this.request<{ data: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data!;
  }

  async searchUsers(keyword: string): Promise<User[]> {
    const response = await this.request<{ data: User[] }>(`/users/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data || [];
  }

  // Conversation methods
  async getConversations(): Promise<Conversation[]> {
    const response = await this.request<{ data: Conversation[] }>('/conversations');
    return response.data || [];
  }

  async getConversation(conversationId: number): Promise<Conversation> {
    const response = await this.request<{ data: Conversation }>(`/conversations/${conversationId}`);
    return response.data!;
  }

  async getMessages(conversationId: number, limit: number = 50, beforeId?: number): Promise<Message[]> {
    let url = `/conversations/${conversationId}/messages?limit=${limit}`;
    if (beforeId) {
      url += `&before_id=${beforeId}`;
    }
    const response = await this.request<{ data: Message[] }>(url);
    return response.data || [];
  }

  async sendMessage(conversationId: number, content: string, type: string = 'text'): Promise<Message> {
    const response = await this.request<{ data: Message }>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
    return response.data!;
  }

  async editMessage(messageId: number, content: string): Promise<Message> {
    const response = await this.request<{ data: Message }>(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return response.data!;
  }

  async deleteMessage(messageId: number): Promise<void> {
    await this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async addReaction(messageId: number, emoji: string): Promise<void> {
    await this.request(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async removeReaction(messageId: number, emoji: string): Promise<void> {
    await this.request(`/messages/${messageId}/reactions/${emoji}`, {
      method: 'DELETE',
    });
  }

  async bookmarkMessage(messageId: number): Promise<void> {
    await this.request(`/messages/${messageId}/bookmark`, {
      method: 'POST',
    });
  }

  async removeBookmark(messageId: number): Promise<void> {
    await this.request(`/messages/${messageId}/bookmark`, {
      method: 'DELETE',
    });
  }

  // Team methods
  async getTeams(): Promise<Team[]> {
    const response = await this.request<{ data: Team[] }>('/teams');
    return response.data || [];
  }

  async createTeam(teamData: { name: string; description?: string; is_private?: boolean }): Promise<Team> {
    const response = await this.request<{ data: Team }>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
    return response.data!;
  }

  // Channel methods
  async getChannels(teamId: number): Promise<Channel[]> {
    const response = await this.request<{ data: Channel[] }>(`/teams/${teamId}/channels`);
    return response.data || [];
  }

  async createChannel(channelData: {
    name: string;
    description?: string;
    team_id: number;
    is_private?: boolean;
  }): Promise<Channel> {
    const response = await this.request<{ data: Channel }>('/channels', {
      method: 'POST',
      body: JSON.stringify(channelData),
    });
    return response.data!;
  }

  // Search methods
  async searchMessages(keyword: string, conversationId?: number): Promise<Message[]> {
    let url = `/search/messages?keyword=${encodeURIComponent(keyword)}`;
    if (conversationId) {
      url += `&conversation_id=${conversationId}`;
    }
    const response = await this.request<{ data: Message[] }>(url);
    return response.data || [];
  }

  async searchConversations(keyword: string): Promise<Conversation[]> {
    const response = await this.request<{ data: Conversation[] }>(`/search/conversations?keyword=${encodeURIComponent(keyword)}`);
    return response.data || [];
  }
}

export const apiService = new ApiService();
export default apiService;
