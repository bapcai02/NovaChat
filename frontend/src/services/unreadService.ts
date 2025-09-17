import { apiService } from "./api";

export interface UnreadCount {
  conversation_id: number;
  unread_count: number;
  conversation?: any;
}

export interface UnreadResponse {
  success: boolean;
  data: UnreadCount[];
}

export interface ConversationUnreadResponse {
  success: boolean;
  data: {
    conversation_id: number;
    unread_count: number;
  };
}

export const unreadService = {
  /**
   * Get unread counts for all conversations
   */
  async getUnreadCounts(): Promise<UnreadCount[]> {
    try {
      const response = await apiService.get("/conversations/unread");
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch unread counts:", error);
      return [];
    }
  },

  /**
   * Mark a conversation as read
   */
  async markConversationAsRead(conversationId: number): Promise<boolean> {
    try {
      // Prefer legacy/likely-available route first
      const response = await apiService.post(
        `/conversations/${conversationId}/read`,
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
      // Fallback to alternative route if primary is unavailable
      try {
        const fallback = await apiService.post(
          `/conversations/${conversationId}/mark-as-read`,
        );
        return fallback.status >= 200 && fallback.status < 300;
      } catch (err) {
        console.error("Failed to mark conversation as read:", err);
        return false;
      }
    }
  },

  /**
   * Get unread count for a specific conversation
   */
  async getConversationUnreadCount(conversationId: number): Promise<number> {
    try {
      const response = await apiService.get(
        `/conversations/${conversationId}/unread`,
      );
      return response.data.data?.unread_count || 0;
    } catch (error) {
      console.error("Failed to fetch conversation unread count:", error);
      return 0;
    }
  },
};
