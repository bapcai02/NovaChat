import apiService from './api';

export interface UserSearchResult {
  id: number;
  name: string;
  avatar: string | null;
  status: 'online' | 'offline';
}

export const userSearchService = {
  async searchUsers(keyword: string): Promise<UserSearchResult[]> {
    try {
      const response = await apiService.request(
        `/users/search?keyword=${encodeURIComponent(keyword)}`
      );
      return response.data || [];
    } catch (error) {
      console.error('User search failed:', error);
      return [];
    }
  },
};
