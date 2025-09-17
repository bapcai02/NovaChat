import { getWebSocketClient, WebSocketMessage } from '@/lib/websocket'

export type ChatWsHandlers = {
  onConnectedOnlineUsers?: (ids: number[]) => void
  onSubscribeAllOnlineUsers?: (ids: number[]) => void
  onPresenceChange?: (userId: number, type: 'user_online' | 'user_offline') => void
  onMessageAck?: (convId: number, clientId: string | undefined, content: string, senderId: number, messageId: number) => void
  onMessageRead?: (convId: number, userId: number, messageId: number) => void
  onTyping?: (convId: number, userId: number, type: 'typing_start' | 'typing_stop') => void
  onIncomingChat?: (msg: { conversation_id: number, sender_id: number, content: string, timestamp?: string }) => void
}

export function normalizeIds(input: any): number[] {
  if (!Array.isArray(input)) return []
  return input.map((id: any) => parseInt(id?.toString?.() || '0')).filter((n: number) => !!n)
}

export function attachChatWsHandlers(handlers: ChatWsHandlers) {
  const wsClient = getWebSocketClient()
  wsClient.onMessage((message: WebSocketMessage) => {
    if (message.type === 'connected' && (message as any).online_users) {
      handlers.onConnectedOnlineUsers?.(normalizeIds((message as any).online_users))
      return
    }
    if (message.type === 'subscribed_all_conversations' && (message as any).online_users) {
      handlers.onSubscribeAllOnlineUsers?.(normalizeIds((message as any).online_users))
      return
    }
    if (message.type === 'user_online' || message.type === 'user_offline') {
      const userId = parseInt((message as any).user_id?.toString() || '0')
      if (userId) handlers.onPresenceChange?.(userId, message.type)
      return
    }
    if (message.type === 'message_ack') {
      const convId = parseInt(message.conversation_id?.toString() || '0')
      const clientId = (message as any).client_id as string | undefined
      const content = (message as any).content || ''
      const senderId = parseInt((message as any).sender_id?.toString() || '0')
      const messageId = parseInt((message as any).message_id?.toString() || '0')
      handlers.onMessageAck?.(convId, clientId, content, senderId, messageId)
      return
    }
    if (message.type === 'message_read') {
      const convId = parseInt(message.conversation_id?.toString() || '0')
      const userId = parseInt((message as any).user_id?.toString() || '0')
      const messageId = parseInt((message as any).message_id?.toString() || '0')
      if (convId && userId && messageId) handlers.onMessageRead?.(convId, userId, messageId)
      return
    }
    if (message.type === 'typing_start' || message.type === 'typing_stop') {
      const convId = parseInt(message.conversation_id?.toString() || '0')
      const userId = parseInt(message.user_id?.toString() || '0')
      if (convId && userId) handlers.onTyping?.(convId, userId, message.type)
      return
    }
    if (message.type === 'chat_message' || message.type === 'message_received') {
      const convId = parseInt(message.conversation_id?.toString() || '0')
      const senderId = parseInt(message.sender_id?.toString() || '0')
      const content = (message as any).content || ''
      handlers.onIncomingChat?.({ conversation_id: convId, sender_id: senderId, content, timestamp: (message as any).timestamp })
      return
    }
  })
}


