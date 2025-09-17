interface WebSocketMessage {
  type: string;
  conversation_id?: number;
  sender_id?: number;
  content?: string;
  timestamp?: string;
  client_id?: string;
  message_id?: string;
  user_id?: number;
  status?: "online" | "offline";
  conversation_ids?: number[];
}

interface WebSocketClient {
  connect(): void;
  disconnect(): void;
  isConnected(): boolean;
  joinConversation(conversationId: number): void;
  subscribeAllConversations(userId: number, conversationIds: number[]): void;
  sendMessage(
    conversationId: number,
    senderId: number,
    content: string,
    senderName?: string,
    senderAvatar?: string,
  ): void;
  sendReadReceipt(
    conversationId: number,
    messageId: number,
    userId: number,
  ): void;
  setUserOnline(userId: number): void;
  setUserOffline(userId: number): void;
  onMessage(callback: (message: WebSocketMessage) => void): void;
  onConnectionChange(callback: (status: string) => void): void;
}

class NovaChatWebSocket implements WebSocketClient {
  private ws: WebSocket | null = null;
  private messageCallbacks: ((message: WebSocketMessage) => void)[] = [];
  private connectionCallbacks: ((status: string) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private currentConversationId: number | null = null;
  private joinedConversationIds: Set<number> = new Set();
  private lastSubscribeAll: { userId: number; ids: number[] } | null = null;
  private pingTimer: any = null;
  private sendQueue: WebSocketMessage[] = [];

  constructor(
    private url: string = (process.env.NEXT_PUBLIC_WS_URL as string) ||
      "ws://localhost:7001",
  ) {}

  connect(): void {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnectionChange("connected");
        // Heartbeat
        if (this.pingTimer) clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => {
          this.send({ type: "ping" } as any);
        }, 15000);
        // Flush queued messages
        if (this.sendQueue.length) {
          const queue = [...this.sendQueue];
          this.sendQueue = [];
          queue.forEach((m) => this.send(m));
        }
        // Re-subscribe
        this.joinedConversationIds.forEach((id) => {
          this.send({ type: "join_conversation", conversation_id: id } as any);
        });
        if (this.lastSubscribeAll) {
          this.send({
            type: "subscribe_all_conversations",
            user_id: this.lastSubscribeAll.userId,
            conversation_ids: this.lastSubscribeAll.ids,
          } as any);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifyMessage(message);
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        this.notifyConnectionChange("disconnected");
        if (this.pingTimer) {
          clearInterval(this.pingTimer);
          this.pingTimer = null;
        }

        // Auto-reconnect if not manually closed
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        this.isConnecting = false;
        this.notifyConnectionChange("error");
      };
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
      this.isConnecting = false;
      this.notifyConnectionChange("error");
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
    this.currentConversationId = null;
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  joinConversation(conversationId: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.joinedConversationIds.add(conversationId);
      console.warn("[WebSocket] Not connected, queue join conversation");
      this.sendQueue.push({
        type: "join_conversation",
        conversation_id: conversationId,
      } as any);
      return;
    }

    this.currentConversationId = conversationId;
    const message = {
      type: "join_conversation",
      conversation_id: conversationId,
    };

    this.send(message);
    this.joinedConversationIds.add(conversationId);
  }

  sendMessage(
    conversationId: number,
    senderId: number,
    content: string,
    senderName?: string,
    senderAvatar?: string,
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Not connected, cannot send message");
      return;
    }

    const message = {
      type: "chat_message",
      conversation_id: conversationId,
      sender_id: senderId,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      content: content,
      client_id: `${senderId}-${Date.now()}`,
    };

    this.send(message);
  }

  sendReadReceipt(
    conversationId: number,
    messageId: number,
    userId: number,
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Not connected, cannot send read receipt");
      return;
    }
    const message = {
      type: "message_read",
      conversation_id: conversationId,
      message_id: String(messageId),
      user_id: userId,
    } as unknown as WebSocketMessage;
    this.send(message);
  }

  subscribeAllConversations(userId: number, conversationIds: number[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Not connected, queue subscribe all");
      this.lastSubscribeAll = { userId, ids: conversationIds };
      this.sendQueue.push({
        type: "subscribe_all_conversations",
        user_id: userId,
        conversation_ids: conversationIds,
      } as any);
      return;
    }

    const message = {
      type: "subscribe_all_conversations",
      user_id: userId,
      conversation_ids: conversationIds,
    };

    this.send(message);
    this.lastSubscribeAll = { userId, ids: conversationIds };
  }

  setUserOnline(userId: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Not connected, cannot set user online");
      return;
    }

    const message = {
      type: "user_online",
      user_id: userId,
    };

    this.send(message);
  }

  setUserOffline(userId: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Not connected, cannot set user offline");
      return;
    }

    const message = {
      type: "user_offline",
      user_id: userId,
    };

    this.send(message);
  }

  // Expose send via public method for controlled usage
  public send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue offline to send later
      this.sendQueue.push(message);
      console.warn("[WebSocket] Queued message, not connected");
    }
  }

  onMessage(callback: (message: WebSocketMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  clearMessageHandlers(): void {
    this.messageCallbacks = [];
  }

  onConnectionChange(callback: (status: string) => void): void {
    this.connectionCallbacks.push(callback);
  }

  private notifyMessage(message: WebSocketMessage): void {
    this.messageCallbacks.forEach((callback) => callback(message));
  }

  private notifyConnectionChange(status: string): void {
    this.connectionCallbacks.forEach((callback) => callback(status));
  }

  // Ping to keep connection alive
  ping(): void {
    this.send({ type: "ping" });
  }

  getConnectionState(): string {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "unknown";
    }
  }
}

// Singleton instance
let wsClient: NovaChatWebSocket | null = null;

export const getWebSocketClient = (): NovaChatWebSocket => {
  if (!wsClient) {
    wsClient = new NovaChatWebSocket();
  }
  return wsClient;
};

export type { WebSocketMessage, WebSocketClient };
export { NovaChatWebSocket };
