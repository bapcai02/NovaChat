// ws-gateway.js
const WebSocket = require('ws');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Logging function (console only)
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

// WebSocket server
const wss = new WebSocket.Server({ port: 7000 });

// Store connected clients by conversation
const clientsByConversation = new Map();

log('WebSocket Gateway started on port 7000');

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  log(`New client connected: ${clientId}`);

  ws.clientId = clientId;
  ws.conversationId = null;

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      log('Received message:', message);

      if (message.type === 'join_conversation') {
        ws.conversationId = message.conversation_id;

        if (!clientsByConversation.has(ws.conversationId)) {
          clientsByConversation.set(ws.conversationId, new Set());
          log(`Created new conversation room: ${ws.conversationId}`);
        }
        clientsByConversation.get(ws.conversationId).add(ws);

        log(
          `Client ${clientId} joined conversation ${ws.conversationId}. Room size: ${clientsByConversation.get(ws.conversationId).size}`
        );

        ws.send(
          JSON.stringify({
            type: 'joined_conversation',
            conversation_id: ws.conversationId,
            client_id: clientId,
          })
        );
      } else if (message.type === 'chat_message') {
        if (!ws.conversationId) {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Must join a conversation first',
            })
          );
          return;
        }

        const chatMessage = {
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          content: message.content,
          timestamp: new Date().toISOString(),
          client_id: clientId,
        };

        // Push vào Redis để Laravel xử lý
        redis
          .lpush('chat_messages', JSON.stringify(chatMessage))
          .then(() => log('Message pushed to Redis queue:', chatMessage))
          .catch((err) => log('Error pushing to Redis:', err));

        // Broadcast cho tất cả client trong cùng conversation
        log('=== Starting broadcast process ===');
        const conversationClients =
          clientsByConversation.get(ws.conversationId);
        log(`Broadcasting to ${conversationClients ? conversationClients.size : 0} clients in conversation ${ws.conversationId}`);
        
        if (conversationClients) {
          let sentCount = 0;
          conversationClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'chat_message',
                  conversation_id: ws.conversationId,
                  sender_id: message.sender_id,
                  sender_name: message.sender_name || `User ${message.sender_id}`,
                  sender_avatar: message.sender_avatar,
                  content: message.content,
                  timestamp: chatMessage.timestamp,
                })
              );
              sentCount++;
              log(`Message sent to client (${sentCount})`);
            } else if (client === ws) {
              log('Skipping sender');
            } else {
              log('Client not ready, skipping');
            }
          });
          log(
            `Broadcasted message to ${sentCount} clients in conversation ${ws.conversationId}`
          );
        } else {
          log('No clients found for conversation', ws.conversationId);
        }

        ws.send(
          JSON.stringify({
            type: 'message_sent',
            conversation_id: ws.conversationId,
            message_id: clientId,
          })
        );
      } else if (
        message.type === 'typing_start' ||
        message.type === 'typing_stop'
      ) {
        if (!ws.conversationId) return;

        const typingMessage = {
          type: message.type,
          conversation_id: ws.conversationId,
          user_id: message.user_id,
          timestamp: new Date().toISOString(),
        };

        const conversationClients =
          clientsByConversation.get(ws.conversationId);
        if (conversationClients) {
          conversationClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(typingMessage));
            }
          });
        }
      } else if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (error) {
      log('Error processing message:', error);
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        })
      );
    }
  });

  ws.on('close', () => {
    log(`Client ${clientId} disconnected`);
    if (ws.conversationId && clientsByConversation.has(ws.conversationId)) {
      const conversationClients = clientsByConversation.get(ws.conversationId);
      conversationClients.delete(ws);
      if (conversationClients.size === 0) {
        clientsByConversation.delete(ws.conversationId);
      }
    }
  });

  ws.on('error', (error) => {
    log(`WebSocket error for client ${clientId}:`, error);
  });

  ws.send(
    JSON.stringify({
      type: 'connected',
      client_id: clientId,
      message: 'Connected to WebSocket Gateway',
    })
  );
});

// Redis events
redis.on('error', (error) => {
  log('Redis connection error:', error);
});

redis.on('connect', () => {
  log('Connected to Redis');
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down WebSocket Gateway...');
  wss.close(() => {
    redis.disconnect();
    process.exit(0);
  });
});
