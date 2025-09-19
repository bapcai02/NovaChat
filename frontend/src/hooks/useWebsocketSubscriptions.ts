import { getWebSocketClient, WebSocketMessage } from "@/lib/websocket";

export function ensureSubscribeAll(
  userId: number,
  conversationIds: number[],
  onMessage: (m: WebSocketMessage) => void,
) {
  const wsClient = getWebSocketClient();
  const checkConnection = () => {
    if (wsClient.isConnected()) {
      wsClient.subscribeAllConversations(userId, conversationIds);
      wsClient.onMessage(onMessage);
    } else {
      setTimeout(checkConnection, 1000);
    }
  };
  checkConnection();
}

export function joinConversation(conversationId: number) {
  const wsClient = getWebSocketClient();
  wsClient.joinConversation(conversationId);
}
