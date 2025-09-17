import { apiService } from "./api";

export interface Bookmark {
  id: number;
  user_id: number;
  message_id: number;
  note?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  message: {
    id: number;
    content: string;
    type: string;
    created_at: string;
    user: {
      id: number;
      name: string;
      username?: string;
      avatar?: string;
    };
  };
}

export interface BookmarkResponse {
  data: Bookmark[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface BookmarkRequest {
  note?: string;
  tags?: string[];
}

class BookmarkService {
  async getBookmarks(
    page: number = 1,
    limit: number = 20,
  ): Promise<BookmarkResponse> {
    return apiService.get(`/messages/bookmarks?page=${page}&limit=${limit}`);
  }

  async bookmarkMessage(
    messageId: number,
    data: BookmarkRequest = {},
  ): Promise<Bookmark> {
    return apiService.post(`/messages/${messageId}/bookmark`, data);
  }

  async removeBookmark(messageId: number): Promise<void> {
    return apiService.delete(`/messages/${messageId}/bookmark`);
  }

  async isBookmarked(messageId: number): Promise<{ isBookmarked: boolean }> {
    return apiService.get(`/messages/${messageId}/bookmark`);
  }
}

export const bookmarkService = new BookmarkService();
