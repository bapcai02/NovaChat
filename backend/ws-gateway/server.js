const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const Redis = require('ioredis')
const { v4: uuidv4 } = require('uuid')

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 7000

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Presence storage keys
const ONLINE_SET_KEY = 'online_users'
const STATUS_KEY_PREFIX = 'user_status:' // user_status:{userId} => 'online' with TTL

// Logging helper
const log = (message, data = null) => {
  console.log(`[WS-Gateway] ${message}`, data || '')
}

// HTTP + Express + WS
const app = express()
app.use(express.json())

// API: /online-users → return list of online users
app.get('/online-users', async (_req, res) => {
  try {
    const ids = await redis.smembers(ONLINE_SET_KEY)
    res.json({ success: true, data: ids.map((id) => Number(id)) })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Map user → connected clients
const clientsByUser = new Map()
// Map conversation → clients
const clientsByConversation = new Map()

// Presence helpers
async function setOnline(userId) {
  try {
    console.log(`[Presence] Setting user ${userId} online...`)
    const key = `${STATUS_KEY_PREFIX}${userId}`
    await redis.setex(key, 10, 'online')
    await redis.sadd(ONLINE_SET_KEY, String(userId))
    console.log(`[Presence] User ${userId} set online successfully`)
  } catch (error) {
    console.log(`[Presence] Error setting user ${userId} online:`, error.message)
    log(`[Presence] Error setting user ${userId} online:`, error.message)
  }
}

async function touchOnline(userId) {
  try {
    const key = `${STATUS_KEY_PREFIX}${userId}`
    await redis.expire(key, 10)
    await redis.sadd(ONLINE_SET_KEY, String(userId))
  } catch (error) {
    log(`[Presence] Error touching user ${userId} online:`, error.message)
  }
}

async function setOffline(userId) {
  try {
    const key = `${STATUS_KEY_PREFIX}${userId}`
    await redis.del(key)
    await redis.srem(ONLINE_SET_KEY, String(userId))
  } catch (error) {
    log(`[Presence] Error setting user ${userId} offline:`, error.message)
  }
}

// Publish to Redis Stream
async function publishUserPresenceEvent(event, userId) {
  const streamId = await redis.xadd(
    'user_presence',
    'MAXLEN', '~', 100000,
    '*',
    'event', event,
    'user_id', userId,
    'timestamp', new Date().toISOString()
  )
}

// WS connection handler
wss.on('connection', (ws) => {
  const clientId = uuidv4()
  ws.clientId = clientId
  ws.userId = null
  ws.conversationId = null
  ws.subscribedConversations = new Set()

  ws.on('message', async (raw) => {
    try {
      const message = JSON.parse(raw.toString())
      console.log(`[WS-Gateway] Received message:`, message)
      // === PING/PONG ===
      if (message.type === 'ping') {
        if (typeof message.user_id === 'number') {
          ws.userId = ws.userId ?? message.user_id
        }
        if (ws.userId) {
          await touchOnline(ws.userId)
        }
        ws.send(JSON.stringify({ type: 'pong' }))
        return
      }

       // === LOGIN (user_online) ===
       if (message.type === 'user_online') {
         const userId = message.user_id
         ws.userId = userId

         if (!clientsByUser.has(userId)) clientsByUser.set(userId, new Set())
         clientsByUser.get(userId).add(ws)

         await setOnline(userId)
         await publishUserPresenceEvent('user_connected', userId)

         const onlineUsers = await redis.smembers(ONLINE_SET_KEY)

         // Broadcast to ALL connected clients (not just current conversation)
         wss.clients.forEach((c) => {
           if (c.readyState === WebSocket.OPEN) {
             c.send(JSON.stringify({ type: 'user_online', user_id: userId }))
           }
         })
         return
       }

      // === LOGOUT ===
      if (message.type === 'logout' && typeof message.user_id === 'number') {
        await setOffline(message.user_id)
        await publishUserPresenceEvent('user_disconnected', message.user_id)
        ws.close(1000, 'logout')
        return
      }

      // === EXPLICIT USER_OFFLINE ===
      if (message.type === 'user_offline') {
        const userId = message.user_id
        if (clientsByUser.has(userId)) {
          clientsByUser.get(userId).delete(ws)
          if (clientsByUser.get(userId).size === 0) {
            clientsByUser.delete(userId)
            await setOffline(userId)
            await publishUserPresenceEvent('user_disconnected', userId)
          }
        }
        return
      }

      // === JOIN CONVERSATION ===
      if (message.type === 'join_conversation') {
        const cid = message.conversation_id
        ws.conversationId = cid
        if (!clientsByConversation.has(cid)) clientsByConversation.set(cid, new Set())
        clientsByConversation.get(cid).add(ws)

        ws.send(JSON.stringify({
          type: 'joined_conversation',
          conversation_id: cid,
          client_id: clientId,
        }))
        return
      }

       // === SUBSCRIBE ALL CONVERSATIONS ===
       if (message.type === 'subscribe_all_conversations') {
         console.log(`[WS-Gateway] Processing subscribe_all_conversations for user ${message.user_id}`)
         const userId = message.user_id
         const cids = message.conversation_ids || []
         
         try {
           ws.userId = userId
           if (!clientsByUser.has(userId)) clientsByUser.set(userId, new Set())
           clientsByUser.get(userId).add(ws)

           cids.forEach(cid => {
             if (!clientsByConversation.has(cid)) clientsByConversation.set(cid, new Set())
             clientsByConversation.get(cid).add(ws)
             ws.subscribedConversations.add(cid)
           })

           // Set user online and broadcast to all clients
           console.log(`[WS-Gateway] Calling setOnline for user ${userId}`)
           await setOnline(userId)
           console.log(`[WS-Gateway] setOnline completed for user ${userId}`)

           await publishUserPresenceEvent('user_connected', userId)
         } catch (error) {
           console.log(`[WS-Gateway] Error in subscribe_all_conversations:`, error.message)
           ws.send(JSON.stringify({ type: 'error', message: 'Failed to subscribe' }))
         }
         
         // Broadcast user_online to all clients
         wss.clients.forEach((c) => {
           if (c.readyState === WebSocket.OPEN) {
             c.send(JSON.stringify({ type: 'user_online', user_id: userId }))
           }
         })

         // Get online users from Redis and send to client
         try {
           const onlineUsers = await redis.smembers(ONLINE_SET_KEY)
           
           ws.send(JSON.stringify({
             type: 'subscribed_all_conversations',
             conversation_ids: cids,
             client_id: clientId,
             online_users: onlineUsers
           }))
         } catch (error) {
           ws.send(JSON.stringify({
             type: 'subscribed_all_conversations',
             conversation_ids: cids,
             client_id: clientId,
             online_users: []
           }))
         }
         return
       }

      // === CHAT MESSAGE ===
      if (message.type === 'chat_message') {
        if (!ws.conversationId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Join a conversation first' }))
          return
        }

        const chat = {
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          content: message.content,
          timestamp: new Date().toISOString(),
          client_id: clientId,
        }

        // Push vào Redis Stream
        await redis.xadd(
          'chat_messages',
          'MAXLEN', '~', 100000,
          '*',
          'conversation_id', String(chat.conversation_id),
          'sender_id', String(chat.sender_id),
          'content', chat.content,
          'timestamp', chat.timestamp,
          'client_id', chat.client_id
        )

        // Broadcast tới cùng conversation
        const clients = clientsByConversation.get(ws.conversationId) || []
        clients.forEach(c => {
          if (c.readyState === WebSocket.OPEN) {
            c.send(JSON.stringify({
              type: 'chat_message',
              conversation_id: ws.conversationId,
              sender_id: message.sender_id,
              content: message.content,
              timestamp: chat.timestamp,
            }))
          }
        })

        ws.send(JSON.stringify({ type: 'message_sent', conversation_id: ws.conversationId }))
        return
      }

      // === TYPING ===
      if (message.type === 'typing_start' || message.type === 'typing_stop') {
        if (!ws.conversationId) return
        const typing = {
          type: message.type,
          conversation_id: ws.conversationId,
          user_id: message.user_id,
          timestamp: new Date().toISOString(),
        }
        const clients = clientsByConversation.get(ws.conversationId) || []
        clients.forEach(c => {
          if (c !== ws && c.readyState === WebSocket.OPEN) {
            c.send(JSON.stringify(typing))
          }
        })
      }
    } catch (err) {
      log('Error parsing message:', err)
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }))
    }
  })

  ws.on('close', () => {
    // ❌ Không setOffline ở đây — rely TTL
    if (ws.userId && clientsByUser.has(ws.userId)) {
      clientsByUser.get(ws.userId).delete(ws)
      if (clientsByUser.get(ws.userId).size === 0) {
        clientsByUser.delete(ws.userId)
      }
    }
    ws.subscribedConversations.forEach(cid => {
      if (clientsByConversation.has(cid)) {
        clientsByConversation.get(cid).delete(ws)
        if (clientsByConversation.get(cid).size === 0) {
          clientsByConversation.delete(cid)
        }
      }
    })
  })

  // Send online users list when user connects
  const sendOnlineUsers = async () => {
    try {
      const onlineUsers = await redis.smembers(ONLINE_SET_KEY)
      
      ws.send(JSON.stringify({
        type: 'connected',
        client_id: clientId,
        online_users: onlineUsers.map(id => parseInt(id))
      }))
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'connected',
        client_id: clientId,
        online_users: []
      }))
    }
  }
  
  // Send online users immediately when client connects
  sendOnlineUsers()
})

// Redis events
redis.on('connect', () => log('Connected to Redis'))
redis.on('error', (e) => log('Redis error:', e.message))

// Start
server.listen(PORT, () => {
  log(`WS Gateway listening on :${PORT}`)
})