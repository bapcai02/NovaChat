import { apiService } from './api';

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  status: string;
  role: string;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface RefreshTokenResponse {
  token: string;
  token_type: string;
}

// Auth service
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiService.login(
      credentials.email,
      credentials.password
    );
    return response.data;
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiService.register(data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      // Even if logout fails, clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiService.getCurrentUser();
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    // Note: refresh token endpoint not implemented in apiService yet
    throw new Error('Refresh token not implemented');
  },

  // Verify token
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiService.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Failed to verify token:', error);
      return false;
    }
  },
};

export default authService;
