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
            'user_id' => $data['user_id'],
            'content' => $data['content'],
            'type' => $data['type'] ?? 'text',
            'metadata' => $data['metadata'] ?? [],
            'conversation_id' => $data['conversation_id'] ?? null,
            'channel_id' => $data['channel_id'] ?? null,
        ];

        $message = $this->messages->create($messageData);
        
        // Get conversation type for channel selection
        $conversationType = 'direct'; // Default for direct messages
        if ($message->channel_id) {
            $conversationType = 'channel';
        }
        
        $payload = [
            'conversation_id' => (string) $data['conversation_id'],
            'type' => $conversationType,
            'message_id' => (string) $message->id,
            'sender_id' => (string) $data['user_id'],
            'content' => (string) $data['content'],
            'created_at' => is_string($message->created_at) ? $message->created_at : $message->created_at->toISOString(),
        ];

        // Broadcast the event
        broadcast(new \App\Events\MessageSent($payload))->toOthers();

        return ['success' => true, 'data' => $message->toArray()];
    }

    public function addReaction(string $messageId, int $userId, string $emoji): array
    {
        $message = $this->messages->findById((int) $messageId);
        if (!$message) {
            return ['success' => false, 'message' => 'Message not found'];
        }

        $reaction = $this->messages->addReaction((int) $messageId, $userId, $emoji);
        
        // Get conversation type for channel selection
        $conversationType = 'direct';
        if (!empty($message['channel_id'])) {
            $conversationType = 'channel';
        }
        
        $payload = [
            'conversation_id' => (string) $message['conversation_id'],
            'type' => $conversationType,
            'message_id' => (string) $messageId,
            'user_id' => (string) $userId,
            'emoji' => $emoji,
            'reaction_id' => (string) $reaction['id'],
            'created_at' => now()->toISOString(),
        ];

        // Broadcast the event
        broadcast(new \App\Events\ReactionAdded($payload))->toOthers();

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

        // Get conversation type for channel selection
        $conversationType = 'direct';
        if (!empty($message['channel_id'])) {
            $conversationType = 'channel';
        }
        
        $payload = [
            'conversation_id' => (string) $message['conversation_id'],
            'type' => $conversationType,
            'message_id' => (string) $messageId,
            'user_id' => (string) $userId,
            'emoji' => $emoji,
            'removed_at' => now()->toISOString(),
        ];

        // Broadcast the event
        broadcast(new \App\Events\ReactionRemoved($payload))->toOthers();

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

        $this->messages->edit((int)$messageId, $newContent);

        // Get conversation type for channel selection
        $conversationType = 'direct';
        if (!empty($message['channel_id'])) {
            $conversationType = 'channel';
        }
        
        $payload = [
            'conversation_id' => (string) $message['conversation_id'],
            'type' => $conversationType,
            'message_id' => (string) $messageId,
            'user_id' => (string) $userId,
            'content' => $newContent,
            'edited_at' => now()->toISOString(),
        ];

        // Broadcast the event
        broadcast(new \App\Events\MessageEdited($payload))->toOthers();

        return ['success' => true, 'message' => 'Message updated successfully', 'data' => $payload];
    }

    public function bookmarkMessage(string $messageId, int $userId, ?string $note = null, ?array $tags = null): array
    {
        $exists = $this->messages->isBookmarked((int)$messageId, $userId);
        if ($exists) {
            return ['success' => false, 'message' => 'Message already bookmarked'];
        }

        $bookmark = $this->messages->createBookmark((int)$messageId, $userId, $note);

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


