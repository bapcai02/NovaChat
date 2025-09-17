import { unreadService } from "@/services/unreadService";
import type { Conversation } from "@/types/chat";

export async function loadUnreadCountsAndMerge(
  conversations: Conversation[],
  setConversations: (updater: (prev: Conversation[]) => Conversation[]) => void,
): Promise<void> {
  try {
    const unreadCounts: any[] = await unreadService.getUnreadCounts();
    setConversations((prev) =>
      prev.map((conv) => {
        const unreadData = unreadCounts.find(
          (uc: any) => uc.conversation_id === conv.id,
        );
        return { ...conv, unread_count: unreadData?.unread_count || 0 };
      }),
    );
  } catch (error) {
    console.error("Failed to load unread counts:", error);
  }
}

export async function markConversationAsReadAndRefresh(
  conversationId: number,
  loadConversations: () => Promise<void> | void,
  setConversations: (updater: (prev: Conversation[]) => Conversation[]) => void,
): Promise<void> {
  try {
    await unreadService.markConversationAsRead(conversationId);
    try {
      await loadConversations();
    } catch {}
  } catch {}
  setConversations((prev) =>
    prev.map((conv) =>
      conv.id === conversationId ? { ...conv, unread_count: 0 } : conv,
    ),
  );
}
