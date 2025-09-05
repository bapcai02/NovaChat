<?php

namespace App\Services;

use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

class MessageService
{
    private MessageRepositoryInterface $messages;

    public function __construct(MessageRepositoryInterface $messages)
    {
        $this->messages = $messages;
    }

    public function getMessages(string $roomId, string $type = 'channel', int $limit = 50, ?int $beforeId = null, ?int $userId = null): array
    {
        $data = $this->messages->getForRoom($roomId, $type, $limit, $beforeId, $userId);
        $hasMore = count($data) === $limit;
        return ['success' => true, 'data' => $data, 'meta' => [
            'hasMore' => $hasMore,
            'nextBeforeId' => count($data) > 0 ? $data[count($data) - 1]['id'] : null,
            'count' => count($data),
        ]];
    }

    public function storeMessage(array $data): array
    {
        $messageData = [
            'user_id' => $data['senderId'],
            'content' => $data['content'],
            'type' => $data['type'] ?? 'text',
            'metadata' => $data['metadata'] ?? [],
            'conversation_id' => $data['conversation_id'] ?? null,
            'channel_id' => $data['channel_id'] ?? null,
        ];

        $message = $this->messages->create($messageData);
        
        $payload = [
            'roomType' => $data['type'] ?? 'channel',
            'roomId' => (string) $data['roomId'],
            'messageId' => (string) $message->id,
            'senderId' => (string) $data['senderId'],
            'content' => (string) $data['content'],
            'createdAt' => $message->created_at->toISOString(),
        ];

        if (class_exists(\App\Events\MessageSent::class)) {
            broadcast(new \App\Events\MessageSent($payload))->toOthers();
        }

        return ['success' => true, 'data' => $payload];
    }

    public function addReaction(string $messageId, int $userId, string $emoji): array
    {
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
    }

    public function removeReaction(string $messageId, int $userId, string $emoji): array
    {
        $message = $this->messages->findById((int) $messageId);
        if (!$message) {
            return ['success' => false, 'message' => 'Message not found'];
        }

        $deleted = $this->messages->removeReaction((int) $messageId, $userId, $emoji);
        if (!$deleted) {
            return ['success' => false, 'message' => 'Reaction not found'];
        }

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

    public function editMessage(string $messageId, int $userId, string $newContent): array
    {
        $message = $this->messages->findById((int) $messageId);
        if (!$message) {
            return ['success' => false, 'message' => 'Message not found'];
        }

        if ((int)($message['user_id'] ?? 0) !== $userId) {
            return ['success' => false, 'message' => 'You can only edit your own messages'];
        }

        $this->messages->update((int)$messageId, [
            'content' => $newContent,
            'is_edited' => true,
            'edited_at' => now(),
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
    }

    public function bookmarkMessage(string $messageId, int $userId, ?string $note = null, ?array $tags = null): array
    {
        $exists = $this->messages->isBookmarked((int)$messageId, $userId);
        if ($exists) {
            return ['success' => false, 'message' => 'Message already bookmarked'];
        }

        $bookmark = $this->messages->createBookmark([
            'user_id' => $userId,
            'message_id' => (int)$messageId,
            'note' => $note,
            'tags' => $tags,
        ]);

        return ['success' => true, 'data' => $bookmark];
    }

    public function removeBookmark(string $messageId, int $userId): array
    {
        $deleted = $this->messages->removeBookmark((int)$messageId, $userId);
        if (!$deleted) {
            return ['success' => false, 'message' => 'Bookmark not found'];
        }

        return ['success' => true, 'message' => 'Bookmark removed successfully'];
    }

    public function getUserBookmarks(int $userId, int $page = 1, int $limit = 20): array
    {
        $bookmarks = $this->messages->getUserBookmarks($userId, $page, $limit);
        return ['success' => true, 'data' => $bookmarks['data'], 'meta' => $bookmarks['meta']];
    }

    public function isMessageBookmarked(string $messageId, int $userId): bool
    {
        return $this->messages->isBookmarked((int)$messageId, $userId);
    }
}


