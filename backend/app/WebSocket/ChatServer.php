<?php

declare(strict_types=1);

namespace App\WebSocket;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;
use SplObjectStorage;

class ChatServer implements MessageComponentInterface
{
    /** @var SplObjectStorage<ConnectionInterface, array<string,bool>> */
    private SplObjectStorage $connectionToChannels;

    /** @var array<string, SplObjectStorage<ConnectionInterface, bool>> */
    private array $channelToConnections;

    /** @var SplObjectStorage<ConnectionInterface, array{client_id:string|null,user_id:int|null,conversation_id:int|null,subs:array<int,bool>}> */
    private SplObjectStorage $connectionState;

    /** @var array<int, SplObjectStorage<ConnectionInterface, bool>> */
    private array $clientsByUser;

    /** @var array<int, SplObjectStorage<ConnectionInterface, bool>> */
    private array $clientsByConversation;

    /**
     * Simple per-connection token bucket for rate limiting.
     * @var SplObjectStorage<ConnectionInterface, array{tokens:float,last:float,violations:int}>
     */
    private SplObjectStorage $rateState;

    /** tokens added per second */
    private float $ratePerSecond = 20.0;
    /** maximum burst tokens */
    private float $rateBurst = 40.0;

    public function __construct()
    {
        $this->connectionToChannels = new SplObjectStorage();
        $this->channelToConnections = [];
        $this->connectionState = new SplObjectStorage();
        $this->clientsByUser = [];
        $this->clientsByConversation = [];
        $this->rateState = new SplObjectStorage();
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        Log::info('[WS] onOpen', ['resourceId' => $conn->resourceId ?? null]);
        $this->connectionToChannels[$conn] = [];
        $this->connectionState[$conn] = [
            'client_id' => bin2hex(random_bytes(8)),
            'user_id' => null,
            'conversation_id' => null,
            'subs' => [],
        ];
        $now = microtime(true);
        $this->rateState[$conn] = [
            'tokens' => $this->rateBurst,
            'last' => $now,
            'violations' => 0,
        ];

        // Send initial connected event with online users list
        $onlineUsers = [];
        try {
            $ids = Redis::smembers('online_users');
            $onlineUsers = array_map('intval', is_array($ids) ? $ids : []);
        } catch (\Throwable $e) {
            $onlineUsers = [];
        }
        $conn->send(json_encode([
            'type' => 'connected',
            'client_id' => $this->connectionState[$conn]['client_id'],
            'online_users' => $onlineUsers,
        ], JSON_UNESCAPED_UNICODE));
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {
        if (!$this->consumeToken($from)) {
            $state = $this->rateState[$from] ?? ['violations' => 0, 'tokens' => 0.0, 'last' => microtime(true)];
            $state['violations'] = (int)$state['violations'] + 1;
            $this->rateState[$from] = $state;
            if ($state['violations'] >= 5) {
                Log::warning('[WS] rate_limit_disconnect', ['rid' => $from->resourceId ?? null]);
                $from->send(json_encode(['type' => 'error', 'code' => 'rate_limited', 'message' => 'Too many messages'], JSON_UNESCAPED_UNICODE));
                $from->close();
                return;
            }
            $from->send(json_encode(['type' => 'error', 'code' => 'rate_limited', 'message' => 'Slow down'], JSON_UNESCAPED_UNICODE));
            return;
        }
        Log::info('[WS] onMessage:raw', ['from' => $from->resourceId ?? null, 'msg' => (string)$msg]);
        $payload = json_decode((string) $msg, true);
        Log::error('[WS] onMessage:payload', ['payload' => $payload]);
        if (!is_array($payload) || !isset($payload['action'])) {
            // Support Node-like protocol by `type`
            if (!isset($payload['type'])) {
                Log::warning('[WS] invalid_message', ['from' => $from->resourceId ?? null, 'raw' => (string)$msg]);
                return;
            }
            $payload['action'] = $payload['type'];
        }

        switch ($payload['action']) {
            case 'auth':
                $token = (string)($payload['token'] ?? '');
                if ($token === '') { break; }
                try {
                    $userId = null;
                    // Prefer validating JWT from Passport public key
                    try {
                        $pubPath = base_path('storage/oauth-public.key');
                        if (is_readable($pubPath)) {
                            $publicKey = file_get_contents($pubPath) ?: '';
                            if ($publicKey !== '') {
                                $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($publicKey, 'RS256'));
                                if (isset($decoded->sub)) {
                                    $userId = (int)$decoded->sub;
                                }
                            }
                        }
                    } catch (\Throwable $e) {
                        // fallthrough to remember_token check
                    }

                    if (!$userId) {
                        // Fallback: legacy remember_token (dev/testing)
                        $userId = \App\Models\User::where('remember_token', $token)->value('id');
                        $userId = $userId ? (int)$userId : null;
                    }

                    if (!$userId) {
                        // Last resort: decode JWT payload without verifying signature (DEV ONLY)
                        try {
                            $parts = explode('.', $token);
                            if (count($parts) >= 2) {
                                $payloadJson = base64_decode(strtr($parts[1], '-_', '+/'));
                                $obj = json_decode($payloadJson, true);
                                if (is_array($obj) && isset($obj['sub'])) {
                                    $userId = (int)$obj['sub'];
                                }
                            }
                        } catch (\Throwable $e) {}
                    }

                    if ($userId) {
                        Log::info('[WS] auth_ok', ['user_id' => (int)$userId]);
                        $state = $this->getState($from);
                        $state['user_id'] = (int)$userId;
                        $this->setState($from, $state);
                        $this->attachToUser($from, (int)$userId);
                        $this->setOnline((int)$userId);
                        $from->send(json_encode(['type' => 'auth_ok', 'user_id' => (int)$userId]));
                    } else {
                        Log::warning('[WS] auth_error_invalid_token');
                        $from->send(json_encode(['type' => 'auth_error']));
                        $from->close();
                    }
                } catch (\Throwable $e) {
                    Log::error('[WS] auth_exception', ['error' => $e->getMessage()]);
                    $from->send(json_encode(['type' => 'auth_error']));
                    $from->close();
                }
                break;
            case 'subscribe':
                Log::info('[WS] action:subscribe', ['from' => $from->resourceId ?? null, 'channel' => $payload['channel'] ?? null]);
                $channel = (string)($payload['channel'] ?? '');
                if ($channel === '') {
                    return;
                }
                $this->subscribe($from, $channel);
                $from->send(json_encode(['type' => 'subscribed', 'channel' => $channel], JSON_UNESCAPED_UNICODE));
                break;
            case 'unsubscribe':
                Log::info('[WS] action:unsubscribe', ['from' => $from->resourceId ?? null, 'channel' => $payload['channel'] ?? null]);
                $channel = (string)($payload['channel'] ?? '');
                if ($channel === '') {
                    return;
                }
                $this->unsubscribe($from, $channel);
                $from->send(json_encode(['type' => 'unsubscribed', 'channel' => $channel], JSON_UNESCAPED_UNICODE));
                break;

            // === PING/PONG ===
            case 'ping':
                Log::info('[WS] action:ping', ['from' => $from->resourceId ?? null, 'user_id' => $payload['user_id'] ?? null]);
                $userId = isset($payload['user_id']) ? (int)$payload['user_id'] : null;
                if ($userId) {
                    $state = $this->getState($from);
                    if (!$state['user_id']) {
                        $state['user_id'] = $userId;
                        $this->setState($from, $state);
                    }
                    $this->touchOnline($userId);
                }
                $from->send(json_encode(['type' => 'pong'], JSON_UNESCAPED_UNICODE));
                break;

            // === LOGIN (user_online) ===
            case 'user_online':
                Log::info('[WS] action:user_online', ['from' => $from->resourceId ?? null, 'user_id' => $payload['user_id'] ?? null]);
                $userId = (int)($payload['user_id'] ?? 0);
                if ($userId <= 0) { break; }
                $state = $this->getState($from);
                $state['user_id'] = $userId;
                $this->setState($from, $state);
                $this->attachToUser($from, $userId);
                $this->setOnline($userId);
                $this->publishUserPresenceEvent('user_connected', $userId);
                $this->broadcastAll(['type' => 'user_online', 'user_id' => $userId]);
                break;

            // === LOGOUT ===
            case 'logout':
                Log::info('[WS] action:logout', ['from' => $from->resourceId ?? null, 'user_id' => $payload['user_id'] ?? null]);
                $userId = (int)($payload['user_id'] ?? 0);
                if ($userId > 0) {
                    $this->setOffline($userId);
                    $this->publishUserPresenceEvent('user_disconnected', $userId);
                }
                $from->close();
                break;

            // === explicit user_offline ===
            case 'user_offline':
                Log::info('[WS] action:user_offline', ['from' => $from->resourceId ?? null, 'user_id' => $payload['user_id'] ?? null]);
                $userId = (int)($payload['user_id'] ?? 0);
                if ($userId > 0) {
                    $this->detachFromUser($from, $userId);
                    $this->setOffline($userId);
                    $this->publishUserPresenceEvent('user_disconnected', $userId);
                }
                break;

            // === JOIN CONVERSATION ===
            case 'join_conversation':
                Log::info('[WS] action:join_conversation', ['from' => $from->resourceId ?? null, 'conversation_id' => $payload['conversation_id'] ?? null]);
                $cid = (int)($payload['conversation_id'] ?? 0);
                if ($cid <= 0) { break; }
                // Require authenticated user
                $authState = $this->getState($from);
                if (empty($authState['user_id'])) {
                    Log::warning('[WS] join_without_auth', ['cid' => $cid]);
                    $from->send(json_encode(['type' => 'auth_required']));
                    break;
                }
                $state = $this->getState($from);
                $state['conversation_id'] = $cid;
                $this->setState($from, $state);
                $this->attachToConversation($from, $cid);
                $from->send(json_encode([
                    'type' => 'joined_conversation',
                    'conversation_id' => $cid,
                    'client_id' => $state['client_id'],
                ], JSON_UNESCAPED_UNICODE));
                break;

            // === SUBSCRIBE ALL CONVERSATIONS ===
            case 'subscribe_all_conversations':
                Log::info('[WS] action:subscribe_all_conversations', ['from' => $from->resourceId ?? null, 'user_id' => $payload['user_id'] ?? null, 'count' => isset($payload['conversation_ids']) && is_array($payload['conversation_ids']) ? count($payload['conversation_ids']) : 0]);
                $userId = (int)($payload['user_id'] ?? 0);
                $cids = isset($payload['conversation_ids']) && is_array($payload['conversation_ids']) ? array_map('intval', $payload['conversation_ids']) : [];
                $state = $this->getState($from);
                $state['user_id'] = $userId;
                $this->attachToUser($from, $userId);
                foreach ($cids as $cid) {
                    $this->attachToConversation($from, $cid);
                    $state['subs'][$cid] = true;
                }
                $this->setState($from, $state);
                $this->setOnline($userId);
                $this->publishUserPresenceEvent('user_connected', $userId);
                $this->broadcastAll(['type' => 'user_online', 'user_id' => $userId]);

                $onlineUsers = [];
                try {
                    $ids = Redis::smembers('online_users');
                    $onlineUsers = array_map('intval', is_array($ids) ? $ids : []);
                } catch (\Throwable $e) {
                    $onlineUsers = [];
                }
                $from->send(json_encode([
                    'type' => 'subscribed_all_conversations',
                    'conversation_ids' => $cids,
                    'client_id' => $state['client_id'],
                    'online_users' => $onlineUsers,
                ], JSON_UNESCAPED_UNICODE));
                break;

            // === CHAT MESSAGE ===
            case 'chat_message':
                Log::info('[WS] action:chat_message', ['from' => $from->resourceId ?? null, 'conversation_id' => $payload['conversation_id'] ?? null, 'sender_id' => $payload['sender_id'] ?? null]);
                $targetCid = (int)($payload['conversation_id'] ?? 0);
                if ($targetCid <= 0) {
                    Log::warning('[WS] chat_message_missing_conversation_id', ['from' => $from->resourceId ?? null]);
                    $from->send(json_encode(['type' => 'error', 'message' => 'Missing conversation_id'], JSON_UNESCAPED_UNICODE));
                    break;
                }
                // Basic anti-spam/content guard
                $content = (string)($payload['content'] ?? '');
                $content = trim($content);
                $attachments = isset($payload['attachments']) && is_array($payload['attachments']) ? $payload['attachments'] : [];
                Log::info('[WS] chat_message_attachments', ['attachments' => $attachments, 'count' => count($attachments)]);
                if ($content === '' && empty($attachments)) {
                    $from->send(json_encode(['type' => 'error', 'message' => 'Invalid content'], JSON_UNESCAPED_UNICODE));
                    break;
                }
                $chat = [
                    'conversation_id' => $targetCid,
                    'sender_id' => isset($payload['sender_id']) ? (int)$payload['sender_id'] : null,
                    'content' => $content,
                    'timestamp' => gmdate('c'),
                    'client_id' => $this->connectionState[$from]['client_id'],
                    'attachments' => $attachments, // Include attachments
                ];
                // Push to Redis Stream
                try {
                    Redis::command('XADD', [
                        'chat_messages', 'MAXLEN', '~', 100000, '*',
                        'conversation_id', (string)$chat['conversation_id'],
                        'sender_id', (string)$chat['sender_id'],
                        'content', $chat['content'],
                        'timestamp', $chat['timestamp'],
                        'client_id', (string)$chat['client_id'],
                    ]);
                } catch (\Throwable $e) {}

                // Also LPUSH to Redis List for Laravel consumer
                try {
                    $listKey = env('REDIS_CHAT_LIST_KEY', 'chat_messages_list');
                    $listPayload = [
                        'conversation_id' => $chat['conversation_id'],
                        'sender_id' => $chat['sender_id'],
                        'content' => $chat['content'],
                        'timestamp' => $chat['timestamp'],
                        'parent_id' => $payload['parent_id'] ?? null,
                        'attachments' => $attachments, // Include attachments in Redis list
                    ];
                    Redis::lpush($listKey, json_encode($listPayload, JSON_UNESCAPED_UNICODE));
                    Redis::ltrim($listKey, 0, 99999);
                } catch (\Throwable $e) {}

                // Broadcast to clients in conversation (include attachments passthrough for preview)
                $clients = $this->clientsByConversation[$targetCid] ?? null;
                if ($clients instanceof SplObjectStorage) {
                    foreach ($clients as $c) {
                        $c->send(json_encode([
                            'type' => 'chat_message',
                            'conversation_id' => $targetCid,
                            'sender_id' => $chat['sender_id'],
                            'content' => $chat['content'],
                            'timestamp' => $chat['timestamp'],
                            'attachments' => $attachments,
                            'parent_id' => $payload['parent_id'] ?? null,
                        ], JSON_UNESCAPED_UNICODE));
                    }
                }
                if (!empty($payload['parent_id'])) {
                    if ($clients instanceof SplObjectStorage) {
                        foreach ($clients as $c) {
                            $c->send(json_encode([
                                'type' => 'thread_reply',
                                'conversation_id' => $targetCid,
                                'parent_id' => (int)$payload['parent_id'],
                                'sender_id' => $chat['sender_id'],
                                'content' => $chat['content'],
                                'timestamp' => $chat['timestamp'],
                            ], JSON_UNESCAPED_UNICODE));
                        }
                    }
                }
                $from->send(json_encode(['type' => 'message_sent', 'conversation_id' => $targetCid], JSON_UNESCAPED_UNICODE));
                break;

            // === READ RECEIPT ===
            case 'message_read':
                $cid = (int)($payload['conversation_id'] ?? 0);
                $messageId = isset($payload['message_id']) ? (int)$payload['message_id'] : 0;
                $readerId = isset($payload['user_id']) ? (int)$payload['user_id'] : null;
                Log::error('[WS] message_read received: ' . json_encode($payload));
                if ($cid <= 0 || $messageId <= 0 || $readerId === null) { 
                    Log::error('[WS] message_read invalid params: cid=' . $cid . ', msgId=' . $messageId . ', readerId=' . $readerId);
                    break; 
                }
                Log::info('[WS] action:message_read', ['conversation_id' => $cid, 'message_id' => $messageId, 'user_id' => $readerId]);
                try {
                    \App\Models\MessageRead::markConversationAsRead($cid, $readerId);
                } catch (\Throwable $e) {
                    Log::error('[WS] message_read_update_failed', [
                        'message_id' => $messageId,
                        'user_id' => $readerId,
                        'error' => $e->getMessage()
                    ]);
                }
                
                $event = [
                    'type' => 'message_read',
                    'conversation_id' => $cid,
                    'message_id' => $messageId,
                    'user_id' => $readerId,
                    'timestamp' => gmdate('c'),
                ];
                $clients = $this->clientsByConversation[$cid] ?? null;
                if ($clients instanceof SplObjectStorage) {
                    foreach ($clients as $c) {
                        $c->send(json_encode($event, JSON_UNESCAPED_UNICODE));
                    }
                }
                break;

            // === TYPING ===
            case 'typing_start':
            case 'typing_stop':
                Log::info('[WS] action:typing', ['from' => $from->resourceId ?? null, 'action' => $payload['action'] ?? null]);
                $cidState = $this->getState($from);
                $cid = $cidState['conversation_id'];
                if (!$cid) { break; }
                $typing = [
                    'type' => $payload['action'],
                    'conversation_id' => $cid,
                    'user_id' => isset($payload['user_id']) ? (int)$payload['user_id'] : null,
                    'timestamp' => gmdate('c'),
                ];
                $clients = $this->clientsByConversation[$cid] ?? null;
                if ($clients instanceof SplObjectStorage) {
                    foreach ($clients as $c) {
                        if ($c !== $from) {
                            $c->send(json_encode($typing, JSON_UNESCAPED_UNICODE));
                        }
                    }
                }
                break;

            // === WebRTC signaling (audio/video) ===
            case 'rtc_offer':
            case 'rtc_answer':
            case 'rtc_candidate':
            case 'rtc_end':
                $cidState = $this->getState($from);
                $cid = isset($payload['conversation_id']) ? (int)$payload['conversation_id'] : ($cidState['conversation_id'] ?? null);
                if (!$cid) { break; }
                $signal = $payload;
                $signal['type'] = $payload['action'];
                unset($signal['action']);
                $clients = $this->clientsByConversation[$cid] ?? null;
                if ($clients instanceof SplObjectStorage) {
                    foreach ($clients as $c) {
                        if ($c !== $from) {
                            $c->send(json_encode($signal, JSON_UNESCAPED_UNICODE));
                        }
                    }
                }
                break;
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
        Log::info('[WS] onClose', ['resourceId' => $conn->resourceId ?? null]);
        if (!isset($this->connectionToChannels[$conn])) {
            return;
        }
        $channels = array_keys($this->connectionToChannels[$conn]);
        foreach ($channels as $channel) {
            $this->unsubscribe($conn, $channel);
        }
        $this->connectionToChannels->detach($conn);

        // Detach presence/bookkeeping
        if (isset($this->connectionState[$conn])) {
            $state = $this->getState($conn);
            if (!empty($state['user_id'])) {
                $this->detachFromUser($conn, (int)$state['user_id']);
                // Rely on TTL for offline to avoid flapping
                try {
                    $key = 'user_last_seen:' . (int)$state['user_id'];
                    Redis::set($key, gmdate('c'));
                } catch (\Throwable $e) {}
            }
            if (!empty($state['subs'])) {
                foreach (array_keys($state['subs']) as $cid) {
                    $this->detachFromConversation($conn, (int)$cid);
                }
            }
            $this->connectionState->detach($conn);
        }
        if (isset($this->rateState[$conn])) {
            $this->rateState->detach($conn);
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        Log::error('[WS] onError', ['resourceId' => $conn->resourceId ?? null, 'error' => $e->getMessage()]);
        $conn->close();
    }

    public function publish(string $channel, array $data): void
    {
        $frame = json_encode(['type' => 'message', 'channel' => $channel, 'data' => $data], JSON_UNESCAPED_UNICODE);
        $connections = $this->channelToConnections[$channel] ?? null;
        if (!$connections instanceof SplObjectStorage) {
            return;
        }
        foreach ($connections as $conn) {
            $conn->send($frame);
        }
    }

    private function subscribe(ConnectionInterface $conn, string $channel): void
    {
        $channels = $this->connectionToChannels[$conn] ?? [];
        $channels[$channel] = true;
        $this->connectionToChannels[$conn] = $channels;

        if (!isset($this->channelToConnections[$channel])) {
            $this->channelToConnections[$channel] = new SplObjectStorage();
        }
        $this->channelToConnections[$channel]->attach($conn, true);
    }

    private function unsubscribe(ConnectionInterface $conn, string $channel): void
    {
        if (isset($this->connectionToChannels[$conn][$channel])) {
            $channels = $this->connectionToChannels[$conn];
            unset($channels[$channel]);
            $this->connectionToChannels[$conn] = $channels;
        }

        if (isset($this->channelToConnections[$channel])) {
            $this->channelToConnections[$channel]->detach($conn);
            if (count($this->channelToConnections[$channel]) === 0) {
                unset($this->channelToConnections[$channel]);
            }
        }
    }

    private function attachToUser(ConnectionInterface $conn, int $userId): void
    {
        if (!isset($this->clientsByUser[$userId])) {
            $this->clientsByUser[$userId] = new SplObjectStorage();
        }
        $this->clientsByUser[$userId]->attach($conn, true);
    }

    private function detachFromUser(ConnectionInterface $conn, int $userId): void
    {
        if (isset($this->clientsByUser[$userId])) {
            $this->clientsByUser[$userId]->detach($conn);
            if (count($this->clientsByUser[$userId]) === 0) {
                unset($this->clientsByUser[$userId]);
            }
        }
    }

    private function attachToConversation(ConnectionInterface $conn, int $conversationId): void
    {
        if (!isset($this->clientsByConversation[$conversationId])) {
            $this->clientsByConversation[$conversationId] = new SplObjectStorage();
        }
        $this->clientsByConversation[$conversationId]->attach($conn, true);
    }

    private function detachFromConversation(ConnectionInterface $conn, int $conversationId): void
    {
        if (isset($this->clientsByConversation[$conversationId])) {
            $this->clientsByConversation[$conversationId]->detach($conn);
            if (count($this->clientsByConversation[$conversationId]) === 0) {
                unset($this->clientsByConversation[$conversationId]);
            }
        }
    }

    private function setOnline(int $userId): void
    {
        try {
            Redis::setex('user_status:' . $userId, 10, 'online');
            Redis::sadd('online_users', (string)$userId);
        } catch (\Throwable $e) {}
    }

    private function touchOnline(int $userId): void
    {
        try {
            Redis::expire('user_status:' . $userId, 10);
            Redis::sadd('online_users', (string)$userId);
        } catch (\Throwable $e) {}
    }

    private function setOffline(int $userId): void
    {
        try {
            Redis::del('user_status:' . $userId);
            Redis::srem('online_users', (string)$userId);
            Redis::set('user_last_seen:' . $userId, gmdate('c'));
        } catch (\Throwable $e) {}
    }

    private function publishUserPresenceEvent(string $event, int $userId): void
    {
        try {
            Redis::command('XADD', [
                'user_presence', 'MAXLEN', '~', 100000, '*',
                'event', $event,
                'user_id', (string)$userId,
                'timestamp', gmdate('c'),
            ]);
        } catch (\Throwable $e) {}
    }

    private function broadcastAll(array $message): void
    {
        $encoded = json_encode($message, JSON_UNESCAPED_UNICODE);
        foreach ($this->connectionState as $conn) {
            $conn->send($encoded);
        }
    }

    /**
     * Safely get connection state stored in SplObjectStorage.
     *
     * @return array{client_id:string|null,user_id:int|null,conversation_id:int|null,subs:array<int,bool>}
     */
    private function getState(ConnectionInterface $conn): array
    {
        return $this->connectionState[$conn] ?? [
            'client_id' => null,
            'user_id' => null,
            'conversation_id' => null,
            'subs' => [],
        ];
    }

    /**
     * Safely set connection state back into SplObjectStorage.
     *
     * @param array{client_id:string|null,user_id:int|null,conversation_id:int|null,subs:array<int,bool>} $state
     */
    private function setState(ConnectionInterface $conn, array $state): void
    {
        $this->connectionState[$conn] = $state;
    }

    /**
     * Token bucket: refill by elapsed * rate, cap at burst; consume 1 per message
     */
    private function consumeToken(ConnectionInterface $conn): bool
    {
        $now = microtime(true);
        $state = $this->rateState[$conn] ?? ['tokens' => $this->rateBurst, 'last' => $now, 'violations' => 0];
        $elapsed = max(0.0, $now - (float)$state['last']);
        $refilled = (float)$state['tokens'] + $elapsed * $this->ratePerSecond;
        $state['tokens'] = min($this->rateBurst, $refilled);
        $state['last'] = $now;
        if ($state['tokens'] < 1.0) {
            $this->rateState[$conn] = $state;
            return false;
        }
        $state['tokens'] -= 1.0;
        $this->rateState[$conn] = $state;
        return true;
    }
}


