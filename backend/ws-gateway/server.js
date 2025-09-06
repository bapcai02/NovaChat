const WebSocket = require('ws');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// WebSocket server
const wss = new WebSocket.Server({ port: 7000 });

// Store connected clients by conversation
const clientsByConversation = new Map();

console.log('WebSocket Gateway started on port 7000');

wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  console.log(`New client connected: ${clientId}`);

  ws.clientId = clientId;
  ws.conversationId = null;

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message);

      if (message.type === 'join_conversation') {
        // Client joins a conversation room
        ws.conversationId = message.conversation_id;
        
        if (!clientsByConversation.has(ws.conversationId)) {
          clientsByConversation.set(ws.conversationId, new Set());
        }
        clientsByConversation.get(ws.conversationId).add(ws);
        
        console.log(`Client ${clientId} joined conversation ${ws.conversationId}`);
        
        // Send confirmation
        ws.send(JSON.stringify({
          type: 'joined_conversation',
          conversation_id: ws.conversationId,
          client_id: clientId
        }));
        
      } else if (message.type === 'chat_message') {
        // Handle chat message
        if (!ws.conversationId) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Must join a conversation first'
          }));
          return;
        }

        const chatMessage = {
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          content: message.content,
          timestamp: new Date().toISOString(),
          client_id: clientId
        };

        // Push to Redis queue for Laravel to process
        await redis.lpush('chatbackend_database_chat_messages', JSON.stringify(chatMessage));
        console.log('Message pushed to Redis queue:', chatMessage);

        // Broadcast to all clients in the same conversation
        const conversationClients = clientsByConversation.get(ws.conversationId);
        if (conversationClients) {
          const broadcastMessage = {
            type: 'message_received',
            conversation_id: ws.conversationId,
            sender_id: message.sender_id,
            content: message.content,
            timestamp: chatMessage.timestamp
          };

          conversationClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(broadcastMessage));
            }
          });
        }

        // Send confirmation to sender
        ws.send(JSON.stringify({
          type: 'message_sent',
          conversation_id: ws.conversationId,
          message_id: clientId // Temporary ID for frontend
        }));

      } else if (message.type === 'ping') {
        // Handle ping for connection health
        ws.send(JSON.stringify({ type: 'pong' }));
      }

    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    
    // Remove client from conversation
    if (ws.conversationId && clientsByConversation.has(ws.conversationId)) {
      const conversationClients = clientsByConversation.get(ws.conversationId);
      conversationClients.delete(ws);
      
      // Clean up empty conversation
      if (conversationClients.size === 0) {
        clientsByConversation.delete(ws.conversationId);
      }
    }
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    client_id: clientId,
    message: 'Connected to WebSocket Gateway'
  }));
});

// Handle Redis connection errors
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket Gateway...');
  wss.close(() => {
    redis.disconnect();
    process.exit(0);
  });
});
