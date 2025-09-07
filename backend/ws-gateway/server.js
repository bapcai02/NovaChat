// ws-gateway.js
const WebSocket = require('ws');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Logging function (console only)
const log = (message, data = null) => {};

// WebSocket server
const wss = new WebSocket.Server({ port: 7000 });

// Store connected clients by conversation
const clientsByConversation = new Map();

// Store connected clients by user (for cleanup only)
const clientsByUser = new Map();

// Function to publish user presence events to Redis Stream
const publishUserPresenceEvent = async (event, userId) => {
  try {
    const eventData = {
      event: event,
      user_id: userId,
      timestamp: new Date().toISOString()
    };
    
    // Publish to Redis Stream with MAXLEN ~ 100000
    const streamId = await redis.xadd(
      'user_presence',
      'MAXLEN', '~', 100000,
      '*',
      'event', eventData.event,
      'user_id', eventData.user_id,
      'timestamp', eventData.timestamp
    );
    
    log(`Published ${event} event for user ${userId} to Redis Stream:`, streamId);
    return streamId;
  } catch (error) {
    log(`Error publishing ${event} event for user ${userId}:`, error.message);
    throw error;
  }
};

log('WebSocket Gateway started on port 7000');

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  log(`New client connected: ${clientId}`);

  ws.clientId = clientId;
  ws.conversationId = null;
  ws.userId = null;
  ws.subscribedConversations = new Set();

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
      } else if (message.type === 'user_online') {
        try {
          const userId = message.user_id;
          log(`Processing user_online for user ${userId}`);
          
          ws.userId = userId;
          
          // Store client by user (for cleanup only)
          if (!clientsByUser.has(userId)) {
            clientsByUser.set(userId, new Set());
          }
          clientsByUser.get(userId).add(ws);
          
          // Publish user_connected event to Redis Stream
          await publishUserPresenceEvent('user_connected', userId);
          
          log(`User ${userId} connected - event published to Redis Stream`);
        } catch (error) {
          log(`Error handling user_online: ${error.message}`);
          log(`Error stack: ${error.stack}`);
        }
        
      } else if (message.type === 'user_offline') {
        try {
          const userId = message.user_id;
          
          // Remove client from user mapping
          if (clientsByUser.has(userId)) {
            clientsByUser.get(userId).delete(ws);
            if (clientsByUser.get(userId).size === 0) {
              clientsByUser.delete(userId);
            }
          }
          
          // Check if user has any other connections
          const hasOtherConnections = clientsByUser.has(userId) && clientsByUser.get(userId).size > 0;
          
          if (!hasOtherConnections) {
            // Publish user_disconnected event to Redis Stream
            await publishUserPresenceEvent('user_disconnected', userId);
            
            log(`User ${userId} disconnected - event published to Redis Stream`);
          }
        } catch (error) {
          log(`Error handling user_offline: ${error.message}`);
          log(`Error stack: ${error.stack}`);
        }
      } else if (message.type === 'subscribe_all_conversations') {
        const userId = message.user_id;
        const conversationIds = message.conversation_ids || [];
        
        ws.userId = userId;
        
        // Subscribe to all conversations
        conversationIds.forEach(conversationId => {
          if (!clientsByConversation.has(conversationId)) {
            clientsByConversation.set(conversationId, new Set());
            log(`Created new conversation room: ${conversationId}`);
          }
          clientsByConversation.get(conversationId).add(ws);
          ws.subscribedConversations.add(conversationId);
        });
        
        log(`User ${userId} subscribed to ${conversationIds.length} conversations: [${conversationIds.join(', ')}]`);
        
        ws.send(JSON.stringify({
          type: 'subscribed_all_conversations',
          conversation_ids: conversationIds,
          client_id: clientId,
        }));
        
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

        // Push vào Redis Stream để Laravel xử lý (Redis Streams)
        try {
          const streamId = await redis.xadd(
            'chat_messages',
            'MAXLEN', '~', 100000,
            '*',
            'conversation_id', String(chatMessage.conversation_id),
            'sender_id', String(chatMessage.sender_id),
            'content', chatMessage.content,
            'timestamp', chatMessage.timestamp,
            'client_id', chatMessage.client_id
          );
          log('Message pushed to Redis Stream chat_messages:', streamId);
        } catch (err) {
          log('Error pushing to Redis Stream chat_messages:', err.message || err);
        }

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

  ws.on('close', async () => {
    log(`Client ${clientId} disconnected`);
    
    // Handle user offline if user was connected
    if (ws.userId) {
      // Remove client from user mapping
      if (clientsByUser.has(ws.userId)) {
        clientsByUser.get(ws.userId).delete(ws);
        if (clientsByUser.get(ws.userId).size === 0) {
          clientsByUser.delete(ws.userId);
          
          // Publish user_disconnected event to Redis Stream
          try {
            await publishUserPresenceEvent('user_disconnected', ws.userId);
            log(`User ${ws.userId} disconnected (client closed) - event published to Redis Stream`);
          } catch (error) {
            log(`Error publishing user_disconnected event for user ${ws.userId}:`, error.message);
          }
        }
      }
    }
    
    // Handle conversation cleanup - remove from all subscribed conversations
    ws.subscribedConversations.forEach(conversationId => {
      if (clientsByConversation.has(conversationId)) {
        const conversationClients = clientsByConversation.get(conversationId);
        conversationClients.delete(ws);
        if (conversationClients.size === 0) {
          clientsByConversation.delete(conversationId);
          log(`Conversation room ${conversationId} is now empty`);
        }
      }
    });
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
