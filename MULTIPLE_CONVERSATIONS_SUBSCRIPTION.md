# Multiple Conversations Subscription System

Hệ thống tự động subscribe tất cả conversations mà user tham gia khi login để nhận được mọi message real-time.

## Cách hoạt động

### 1. WebSocket Gateway (Node.js)
- **Message type**: `subscribe_all_conversations`
- **Payload**: 
  ```json
  {
    "type": "subscribe_all_conversations",
    "user_id": 123,
    "conversation_ids": [1, 2, 3, 4]
  }
  ```
- **Response**: 
  ```json
  {
    "type": "subscribed_all_conversations",
    "conversation_ids": [1, 2, 3, 4],
    "client_id": "uuid"
  }
  ```

### 2. Frontend (React/Next.js)
- **Tự động subscribe**: Khi user login và conversations được load
- **WebSocket client**: `subscribeAllConversations(userId, conversationIds)`
- **useChat hook**: Tự động gọi khi `currentUser` và `conversations` có sẵn

### 3. Message Handling
- **Current conversation**: Message hiển thị ngay lập tức
- **Other conversations**: Tăng unread count, không hiển thị message
- **Real-time updates**: Tất cả conversations được cập nhật real-time

## Code Flow

### 1. User Login
```javascript
// useChat.ts
useEffect(() => {
  loadCurrentUser()      // Load user info
  loadConversations()    // Load user's conversations
}, [])

// Khi cả user và conversations đã load
useEffect(() => {
  subscribeToAllConversations()  // Subscribe to all conversations
}, [currentUser, conversations])
```

### 2. Subscribe All Conversations
```javascript
const subscribeToAllConversations = useCallback(() => {
  if (currentUser?.id && conversations.length > 0) {
    const wsClient = getWebSocketClient()
    const conversationIds = conversations.map(conv => conv.id)
    
    // Wait for WebSocket connection
    const checkConnection = () => {
      if (wsClient.isConnected()) {
        wsClient.subscribeAllConversations(currentUser.id, conversationIds)
      } else {
        setTimeout(checkConnection, 1000) // Retry
      }
    }
    
    checkConnection()
  }
}, [currentUser?.id, conversations])
```

### 3. WebSocket Gateway Processing
```javascript
// server.js
if (message.type === 'subscribe_all_conversations') {
  const userId = message.user_id;
  const conversationIds = message.conversation_ids || [];
  
  // Subscribe to all conversations
  conversationIds.forEach(conversationId => {
    if (!clientsByConversation.has(conversationId)) {
      clientsByConversation.set(conversationId, new Set());
    }
    clientsByConversation.get(conversationId).add(ws);
    ws.subscribedConversations.add(conversationId);
  });
  
  // Send confirmation
  ws.send(JSON.stringify({
    type: 'subscribed_all_conversations',
    conversation_ids: conversationIds,
    client_id: clientId,
  }));
}
```

### 4. Message Broadcasting
```javascript
// Khi có message mới
const conversationClients = clientsByConversation.get(conversationId);
if (conversationClients) {
  conversationClients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(chatMessage));
    }
  });
}
```

### 5. Frontend Message Handling
```javascript
// useChat.ts
if (message.type === 'chat_message' || message.type === 'message_received') {
  const messageConversationId = parseInt(message.conversation_id?.toString() || '0')
  
  // Add message if it's for current conversation
  if (messageConversationId === currentConversation?.id) {
    setMessages(prev => [...prev, newMessage])
  }
  
  // Update unread count for other conversations
  if (messageConversationId !== currentConversation?.id) {
    setConversations(prev => prev.map(conv => 
      conv.id === messageConversationId 
        ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
        : conv
    ))
  }
}
```

## Benefits

### 1. **Real-time Updates**
- Nhận message từ tất cả conversations ngay lập tức
- Không cần refresh trang để thấy message mới
- Unread count cập nhật real-time

### 2. **Better UX**
- User không bỏ lỡ message nào
- Sidebar hiển thị unread count chính xác
- Chuyển đổi giữa conversations mượt mà

### 3. **Scalable**
- WebSocket Gateway quản lý multiple subscriptions
- Redis lưu trữ conversation rooms
- Cleanup tự động khi disconnect

## Testing

### 1. **Test Multiple Conversations**
1. Login với user A
2. Mở 2 browser tab với user B và C
3. User B gửi message trong conversation 1
4. User C gửi message trong conversation 2
5. User A sẽ nhận được cả 2 message và unread count cập nhật

### 2. **Test Unread Count**
1. User A đang xem conversation 1
2. User B gửi message trong conversation 2
3. User A sẽ thấy unread count tăng trong sidebar
4. Chuyển sang conversation 2, unread count sẽ reset

### 3. **Test Disconnect/Reconnect**
1. User A disconnect
2. User B gửi message
3. User A reconnect
4. User A sẽ nhận được message khi reconnect

## Logs

### WebSocket Gateway
```bash
docker-compose logs ws-gateway
```

### Frontend Console
```javascript
// Sẽ thấy log khi subscribe
console.log(`Subscribed to ${conversationIds.length} conversations:`, conversationIds)
```

## Troubleshooting

### 1. **Không nhận được message từ conversations khác**
- Kiểm tra WebSocket connection: `wsClient.isConnected()`
- Kiểm tra logs: `docker-compose logs ws-gateway`
- Kiểm tra conversation IDs trong subscribe message

### 2. **Unread count không cập nhật**
- Kiểm tra message conversation_id
- Kiểm tra currentConversation.id
- Kiểm tra setConversations logic

### 3. **Subscribe không thành công**
- Kiểm tra WebSocket connection
- Kiểm tra conversations array
- Kiểm tra retry logic trong checkConnection
