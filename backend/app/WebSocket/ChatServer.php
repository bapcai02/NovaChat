<?php

declare(strict_types=1);

namespace App\WebSocket;

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

    public function __construct()
    {
        $this->connectionToChannels = new SplObjectStorage();
        $this->channelToConnections = [];
        $this->connectionState = new SplObjectStorage();
        $this->clientsByUser = [];
        $this->clientsByConversation = [];
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        $this->connectionToChannels[$conn] = [];
        $this->connectionState[$conn] = [
            'client_id' => bin2hex(random_bytes(8)),
            'user_id' => null,
            'conversation_id' => null,
            'subs' => [],
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
        $payload = json_decode((string) $msg, true);
        if (!is_array($payload) || !isset($payload['action'])) {
            // Support Node-like protocol by `type`
            if (!isset($payload['type'])) {
                return;
            }
            $payload['action'] = $payload['type'];
        }

        switch ($payload['action']) {
            case 'subscribe':
                $channel = (string)($payload['channel'] ?? '');
                if ($channel === '') {
                    return;
                }
                $this->subscribe($from, $channel);
                $from->send(json_encode(['type' => 'subscribed', 'channel' => $channel], JSON_UNESCAPED_UNICODE));
                break;
            case 'unsubscribe':
                $channel = (string)($payload['channel'] ?? '');
                if ($channel === '') {
                    return;
                }
                $this->unsubscribe($from, $channel);
                $from->send(json_encode(['type' => 'unsubscribed', 'channel' => $channel], JSON_UNESCAPED_UNICODE));
                break;

            // === PING/PONG ===
            case 'ping':
                $userId = isset($payload['user_id']) ? (int)$payload['user_id'] : null;
                if ($userId) {
                    $this->connectionState[$from]['user_id'] = $this->connectionState[$from]['user_id'] ?? $userId;
                    $this->touchOnline($userId);
                }
                $from->send(json_encode(['type' => 'pong'], JSON_UNESCAPED_UNICODE));
                break;

            // === LOGIN (user_online) ===
            case 'user_online':
                $userId = (int)($payload['user_id'] ?? 0);
                if ($userId <= 0) { break; }
                $this->connectionState[$from]['user_id'] = $userId;
                $this->attachToUser($from, $userId);
                $this->setOnline($userId);
                $this->publishUserPresenceEvent('user_connected', $userId);
                $this->broadcastAll(['type' => 'user_online', 'user_id' => $userId]);
                break;

            // === LOGOUT ===
            case 'logout':
                $userId = (int)($payload['user_id'] ?? 0);
                if ($userId > 0) {
                    $this->setOffline($userId);
                    $this->publishUserPresenceEvent('user_disconnected', $userId);
                }
                $from->close();
                break;

            // === explicit user_offline ===
            case 'user_offline':
                $userId = (int)($payload['user_id'] ?? 0);
                if ($userId > 0) {
                    $this->detachFromUser($from, $userId);
                    $this->setOffline($userId);
                    $this->publishUserPresenceEvent('user_disconnected', $userId);
                }
                break;

            // === JOIN CONVERSATION ===
            case 'join_conversation':
                $cid = (int)($payload['conversation_id'] ?? 0);
                if ($cid <= 0) { break; }
                $this->connectionState[$from]['conversation_id'] = $cid;
                $this->attachToConversation($from, $cid);
                $from->send(json_encode([
                    'type' => 'joined_conversation',
                    'conversation_id' => $cid,
                    'client_id' => $this->connectionState[$from]['client_id'],
                ], JSON_UNESCAPED_UNICODE));
                break;

            // === SUBSCRIBE ALL CONVERSATIONS ===
            case 'subscribe_all_conversations':
                $userId = (int)($payload['user_id'] ?? 0);
                $cids = isset($payload['conversation_ids']) && is_array($payload['conversation_ids']) ? array_map('intval', $payload['conversation_ids']) : [];
                $this->connectionState[$from]['user_id'] = $userId;
                $this->attachToUser($from, $userId);
                foreach ($cids as $cid) {
                    $this->attachToConversation($from, $cid);
                    $this->connectionState[$from]['subs'][$cid] = true;
                }
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
                    'client_id' => $this->connectionState[$from]['client_id'],
                    'online_users' => $onlineUsers,
                ], JSON_UNESCAPED_UNICODE));
                break;

            // === CHAT MESSAGE ===
            case 'chat_message':
                $targetCid = (int)($payload['conversation_id'] ?? 0);
                if ($targetCid <= 0) {
                    $from->send(json_encode(['type' => 'error', 'message' => 'Missing conversation_id'], JSON_UNESCAPED_UNICODE));
                    break;
                }
                $chat = [
                    'conversation_id' => $targetCid,
                    'sender_id' => isset($payload['sender_id']) ? (int)$payload['sender_id'] : null,
                    'content' => (string)($payload['content'] ?? ''),
                    'timestamp' => gmdate('c'),
                    'client_id' => $this->connectionState[$from]['client_id'],
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
                    ];
                    Redis::lpush($listKey, json_encode($listPayload, JSON_UNESCAPED_UNICODE));
                    Redis::ltrim($listKey, 0, 99999);
                } catch (\Throwable $e) {}

                // Broadcast to clients in conversation
                $clients = $this->clientsByConversation[$targetCid] ?? null;
                if ($clients instanceof SplObjectStorage) {
                    foreach ($clients as $c) {
                        if ($c !== $from) {
                            $c->send(json_encode([
                                'type' => 'chat_message',
                                'conversation_id' => $targetCid,
                                'sender_id' => $chat['sender_id'],
                                'content' => $chat['content'],
                                'timestamp' => $chat['timestamp'],
                                'parent_id' => $payload['parent_id'] ?? null,
                            ], JSON_UNESCAPED_UNICODE));
                        }
                    }
                }
                if (!empty($payload['parent_id'])) {
                    if ($clients instanceof SplObjectStorage) {
                        foreach ($clients as $c) {
                            if ($c !== $from) {
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
                }
                $from->send(json_encode(['type' => 'message_sent', 'conversation_id' => $targetCid], JSON_UNESCAPED_UNICODE));
                break;

            // === TYPING ===
            case 'typing_start':
            case 'typing_stop':
                $cid = $this->connectionState[$from]['conversation_id'];
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
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
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
            $state = $this->connectionState[$conn];
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
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
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
}


