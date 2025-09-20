import { WebSocketMessage } from '../types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandlers: { [key: string]: ((data: any) => void)[] } = {};

  constructor(url: string = 'ws://localhost:7001') {
    this.url = url;
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?token=${token}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.ws = null;
          this.attemptReconnect(token);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(token).catch(() => {
          // Reconnection failed, will try again
        });
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers[message.type] || [];
    handlers.forEach(handler => {
      try {
        handler(message.data || message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  onMessage(type: string, handler: (data: any) => void): void {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = [];
    }
    this.messageHandlers[type].push(handler);
  }

  offMessage(type: string, handler: (data: any) => void): void {
    if (this.messageHandlers[type]) {
      this.messageHandlers[type] = this.messageHandlers[type].filter(h => h !== handler);
    }
  }

  joinConversation(conversationId: number): void {
    this.send({
      type: 'join_conversation',
      conversation_id: conversationId,
    });
  }

  leaveConversation(conversationId: number): void {
    this.send({
      type: 'leave_conversation',
      conversation_id: conversationId,
    });
  }

  sendChatMessage(conversationId: number, content: string, senderId: number, attachments?: any[]): void {
    this.send({
      type: 'chat_message',
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      attachments: attachments || [],
    });
  }

  startTyping(conversationId: number, userId: number): void {
    this.send({
      type: 'typing_start',
      conversation_id: conversationId,
      user_id: userId,
    });
  }

  stopTyping(conversationId: number, userId: number): void {
    this.send({
      type: 'typing_stop',
      conversation_id: conversationId,
      user_id: userId,
    });
  }

  markMessageAsRead(conversationId: number, messageId: number, userId: number): void {
    this.send({
      type: 'message_read',
      conversation_id: conversationId,
      message_id: messageId,
      user_id: userId,
    });
  }

  sendRtcOffer(conversationId: number, from: number, sdp: any): void {
    this.send({
      type: 'rtc_offer',
      conversation_id: conversationId,
      from,
      sdp,
    });
  }

  sendRtcAnswer(conversationId: number, from: number, sdp: any): void {
    this.send({
      type: 'rtc_answer',
      conversation_id: conversationId,
      from,
      sdp,
    });
  }

  sendRtcCandidate(conversationId: number, from: number, candidate: any): void {
    this.send({
      type: 'rtc_candidate',
      conversation_id: conversationId,
      from,
      candidate,
    });
  }

  sendRtcEnd(conversationId: number, from: number): void {
    this.send({
      type: 'rtc_end',
      conversation_id: conversationId,
      from,
    });
  }

  ping(userId: number): void {
    this.send({
      type: 'ping',
      user_id: userId,
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
