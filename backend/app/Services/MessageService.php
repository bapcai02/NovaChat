<?php

namespace App\Services;

use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

class MessageService
{
    public function __construct(private MessageRepositoryInterface $messages)
    {
    }

    public function getMessages(string $roomId, string $type = 'channel', int $limit = 50, ?int $beforeId = null, ?int $userId = null): array
    {
        try {
            $data = $this->messages->getForRoom($roomId, $type, $limit, $beforeId, $userId);
            $hasMore = count($data) === $limit;
            return ['success' => true, 'data' => $data, 'meta' => [
                'hasMore' => $hasMore,
                'nextBeforeId' => count($data) > 0 ? $data[count($data) - 1]['id'] : null,
                'count' => count($data),
            ]];
        } catch (\Throwable $e) {
            Log::error('MessageService@getMessages failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to load messages'];
        }
    }

    public function storeMessage(array $data): array
    {
        try {
            $createdAt = Carbon::now()->format('Y-m-d H:i:s');
            $type = $data['type'] ?? 'channel';
            $insert = [
                'user_id' => $data['senderId'],
                'content' => $data['content'],
                'type' => 'text',
                'metadata' => '[]',
                'is_edited' => false,
                'is_pinned' => false,
                'is_deleted' => false,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
            if ($type === 'direct') {
                if (Schema::hasColumn('messages', 'conversation_id')) {
                    $insert['conversation_id'] = $data['roomId'];
                } else {
                    $insert['channel_id'] = $data['roomId'];
                }
            } else {
                $insert['channel_id'] = $data['roomId'];
            }
            $message = $this->messages->create($insert);
            $payload = [
                'roomType' => $type,
                'roomId' => (string) $data['roomId'],
                'messageId' => (string) $message->id,
                'senderId' => (string) $data['senderId'],
                'content' => (string) $data['content'],
                'createdAt' => (string) $createdAt,
            ];
            if (class_exists(\App\Events\MessageSent::class)) {
                broadcast(new \App\Events\MessageSent($payload))->toOthers();
            }
            return ['success' => true, 'data' => $payload];
        } catch (\Throwable $e) {
            Log::error('MessageService@storeMessage failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to send message'];
        }
    }

    public function addReaction(string $messageId, int $userId, string $emoji): array
    {
        try {
            $message = $this->messages->findById((int) $messageId);
            if (!$message) {
                return ['success' => false, 'message' => 'Message not found'];
            }
            $reaction = $this->messages->addReaction((int) $messageId, $userId, $emoji);
            $payload = [
                'roomType' => !empty($message['conversation_id']) ? 'direct' : 'channel',
                'roomId' => (string) ($message['conversation_id'] ?? $message['channel_id']),
                'messageId' => (string) $messageId,
                'userId' => (string) $userId,
                'emoji' => $emoji,
                'reactionId' => (string) $reaction['id'],
                'createdAt' => now()->toISOString(),
            ];
            if (class_exists(\App\Events\MessageReactionAdded::class)) {
                broadcast(new \App\Events\MessageReactionAdded($payload))->toOthers();
            }
            return ['success' => true, 'message' => 'Reaction added successfully', 'data' => $reaction];
        } catch (\Throwable $e) {
            Log::error('MessageService@addReaction failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to add reaction'];
        }
    }

    public function removeReaction(string $messageId, int $userId, string $emoji): array
    {
        try {
            $message = $this->messages->findById((int) $messageId);
            if (!$message) {
                return ['success' => false, 'message' => 'Message not found'];
            }
            $deleted = $this->messages->removeReaction((int) $messageId, $userId, $emoji);
            if ($deleted) {
                $payload = [
                    'roomType' => !empty($message['conversation_id']) ? 'direct' : 'channel',
                    'roomId' => (string) ($message['conversation_id'] ?? $message['channel_id']),
                    'messageId' => (string) $messageId,
                    'userId' => (string) $userId,
                    'emoji' => $emoji,
                    'removedAt' => now()->toISOString(),
                ];
                if (class_exists(\App\Events\MessageReactionRemoved::class)) {
                    broadcast(new \App\Events\MessageReactionRemoved($payload))->toOthers();
                }
                return ['success' => true, 'message' => 'Reaction removed successfully'];
            }
            return ['success' => false, 'message' => 'Reaction not found'];
        } catch (\Throwable $e) {
            Log::error('MessageService@removeReaction failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to remove reaction'];
        }
    }

    public function editMessage(string $messageId, int $userId, string $newContent): array
    {
        try {
            $message = $this->messages->findById((int) $messageId);
            if (!$message) {
                return ['success' => false, 'message' => 'Message not found'];
            }
            if ((int)($message['user_id'] ?? 0) !== $userId) {
                return ['success' => false, 'message' => 'You can only edit your own messages'];
            }
            // Update DB directly (keep repo interface minimal)
            \Illuminate\Support\Facades\DB::table('messages')
                ->where('id', (int)$messageId)
                ->update([
                    'content' => $newContent,
                    'is_edited' => true,
                    'edited_at' => now(),
                    'updated_at' => now(),
                ]);

            $payload = [
                'roomType' => !empty($message['conversation_id']) ? 'direct' : 'channel',
                'roomId' => (string) ($message['conversation_id'] ?? $message['channel_id']),
                'messageId' => (string) $messageId,
                'userId' => (string) $userId,
                'content' => $newContent,
                'editedAt' => now()->toISOString(),
            ];
            if (class_exists(\App\Events\MessageEdited::class)) {
                broadcast(new \App\Events\MessageEdited($payload))->toOthers();
            }
            return ['success' => true, 'message' => 'Message updated successfully', 'data' => $payload];
        } catch (\Throwable $e) {
            Log::error('MessageService@editMessage failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to edit message'];
        }
    }

    public function bookmarkMessage(string $messageId, int $userId, ?string $note = null, ?array $tags = null): array
    {
        try {
            $exists = \Illuminate\Support\Facades\DB::table('bookmarks')
                ->where('user_id', $userId)
                ->where('message_id', (int)$messageId)
                ->exists();
            if ($exists) {
                return ['success' => false, 'message' => 'Message already bookmarked'];
            }
            $bookmarkId = \Illuminate\Support\Facades\DB::table('bookmarks')->insertGetId([
                'user_id' => $userId,
                'message_id' => (int)$messageId,
                'note' => $note,
                'tags' => $tags ? json_encode($tags) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return ['success' => true, 'data' => [
                'bookmarkId' => $bookmarkId,
                'messageId' => (int)$messageId,
                'userId' => $userId,
                'note' => $note,
                'tags' => $tags,
            ]];
        } catch (\Throwable $e) {
            Log::error('MessageService@bookmarkMessage failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to bookmark message'];
        }
    }

    public function removeBookmark(string $messageId, int $userId): array
    {
        try {
            $deleted = \Illuminate\Support\Facades\DB::table('bookmarks')
                ->where('user_id', $userId)
                ->where('message_id', (int)$messageId)
                ->delete();
            if (!$deleted) {
                return ['success' => false, 'message' => 'Bookmark not found'];
            }
            return ['success' => true, 'message' => 'Bookmark removed successfully'];
        } catch (\Throwable $e) {
            Log::error('MessageService@removeBookmark failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to remove bookmark'];
        }
    }

    public function getUserBookmarks(int $userId, int $page = 1, int $limit = 20): array
    {
        try {
            $offset = ($page - 1) * $limit;
            $bookmarks = \Illuminate\Support\Facades\DB::table('bookmarks')
                ->join('messages', 'bookmarks.message_id', '=', 'messages.id')
                ->join('users', 'messages.user_id', '=', 'users.id')
                ->leftJoin('channels', 'messages.channel_id', '=', 'channels.id')
                ->leftJoin('conversations', 'messages.conversation_id', '=', 'conversations.id')
                ->where('bookmarks.user_id', $userId)
                ->select([
                    'bookmarks.id as bookmark_id',
                    'bookmarks.note',
                    'bookmarks.tags',
                    'bookmarks.created_at as bookmarked_at',
                    'messages.id as message_id',
                    'messages.content',
                    'messages.type',
                    'messages.created_at as message_created_at',
                    'users.name as sender_name',
                    'users.username as sender_username',
                    'users.avatar as sender_avatar',
                    'channels.name as channel_name',
                    'conversations.id as conversation_id',
                ])
                ->orderBy('bookmarks.created_at', 'desc')
                ->offset($offset)
                ->limit($limit)
                ->get();

            $total = \Illuminate\Support\Facades\DB::table('bookmarks')
                ->where('user_id', $userId)
                ->count();

            return [
                'success' => true,
                'data' => $bookmarks->map(function ($b) {
                    return [
                        'id' => $b->bookmark_id,
                        'messageId' => $b->message_id,
                        'content' => $b->content,
                        'type' => $b->type,
                        'note' => $b->note,
                        'tags' => $b->tags ? json_decode($b->tags, true) : null,
                        'bookmarkedAt' => $b->bookmarked_at,
                        'messageCreatedAt' => $b->message_created_at,
                        'sender' => [
                            'name' => $b->sender_name,
                            'username' => $b->sender_username,
                            'avatar' => $b->sender_avatar,
                        ],
                        'channel' => $b->channel_name,
                        'conversationId' => $b->conversation_id,
                    ];
                }),
                'meta' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'hasMore' => $total > ($page * $limit),
                ]
            ];
        } catch (\Throwable $e) {
            Log::error('MessageService@getUserBookmarks failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to get bookmarks'];
        }
    }

    public function isMessageBookmarked(string $messageId, int $userId): bool
    {
        try {
            return \Illuminate\Support\Facades\DB::table('bookmarks')
                ->where('user_id', $userId)
                ->where('message_id', (int)$messageId)
                ->exists();
        } catch (\Throwable $e) {
            Log::error('MessageService@isMessageBookmarked failed: '.$e->getMessage());
            return false;
        }
    }
}


