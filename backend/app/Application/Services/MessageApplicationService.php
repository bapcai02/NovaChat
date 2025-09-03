<?php

namespace App\Application\Services;

use App\Domain\Message\Repositories\MessageRepositoryInterface;
use App\Domain\Message\Events\ChatMessageSent;
use App\Domain\Message\Events\MessageReactionAdded;
use App\Domain\Message\Events\MessageReactionRemoved;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

class MessageApplicationService
{
    private MessageRepositoryInterface $messageRepository;

    public function __construct(MessageRepositoryInterface $messageRepository)
    {
        $this->messageRepository = $messageRepository;
    }

    /**
     * Get messages for a room with pagination
     */
    public function getMessages(string $roomId, string $type = 'channel', int $limit = 50, ?int $beforeId = null): array
    {
        try {
            $messages = $this->messageRepository->getMessagesForRoom($roomId, $type, $limit, $beforeId);
            
            // Get total count for hasMore calculation
            $query = DB::table('messages');
            if ($type === 'direct') {
                if (Schema::hasColumn('messages', 'conversation_id')) {
                    $query->where('conversation_id', $roomId);
                } else {
                    $query->where('channel_id', $roomId);
                }
            } else {
                $query->where('channel_id', $roomId);
            }
            if ($beforeId) {
                $query->where('id', '<', (int) $beforeId);
            }
            $totalCount = $query->count();
            $hasMore = count($messages) === $limit;

            return [
                'success' => true,
                'data' => $messages,
                'meta' => [
                    'hasMore' => $hasMore,
                    'nextBeforeId' => count($messages) > 0 ? $messages[count($messages) - 1]['id'] : null,
                    'count' => count($messages),
                ],
            ];
        } catch (\Throwable $e) {
            Log::error('MessageApplicationService@getMessages failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to load messages',
            ];
        }
    }

    /**
     * Store a new message
     */
    public function storeMessage(array $data): array
    {
        Log::info('MessageApplicationService@storeMessage called with data:', $data);
        
        try {
            $createdAt = Carbon::now()->format('Y-m-d H:i:s');
            $type = $data['type'] ?? 'channel';
            
            Log::info('MessageApplicationService@storeMessage inserting message to database:', [
                'roomType' => $type,
                'roomId' => $data['roomId'],
                'user_id' => $data['senderId'],
                'content' => $data['content'],
                'created_at' => $createdAt
            ]);
            
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

            $message = $this->messageRepository->store($insert);
            $messageId = (string) $message->getId();

            Log::info('MessageApplicationService@storeMessage message saved successfully with ID:', ['messageId' => $messageId]);

            $payload = [
                'roomType' => $type,
                'roomId' => (string) $data['roomId'],
                'messageId' => (string) $messageId,
                'senderId' => (string) $data['senderId'],
                'content' => (string) $data['content'],
                'createdAt' => (string) $createdAt,
            ];

            Log::info('MessageApplicationService@storeMessage broadcasting event with payload:', $payload);
            broadcast(new ChatMessageSent($payload))->toOthers();
            Log::info('MessageApplicationService@storeMessage broadcast event sent successfully');

            return [
                'success' => true,
                'data' => $payload,
            ];
        } catch (\Throwable $e) {
            Log::error('MessageApplicationService@storeMessage failed: ' . $e->getMessage(), [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to send message',
            ];
        }
    }

    /**
     * Add reaction to message
     */
    public function addReaction(string $messageId, int $userId, string $emoji): array
    {
        try {
            // Get message info to determine room type and ID
            $message = $this->messageRepository->findById((int) $messageId);
            if (!$message) {
                return ['success' => false, 'message' => 'Message not found'];
            }

            // Check if conversation_id exists and is not null
            $hasConversationId = $message->getConversationId() !== null;
            $roomType = $hasConversationId ? 'direct' : 'channel';
            $roomId = $hasConversationId ? $message->getConversationId() : $message->getChannelId();

            // Check if reaction already exists
            $existingReaction = DB::table('message_reactions')
                ->where('message_id', $messageId)
                ->where('user_id', $userId)
                ->where('emoji', $emoji)
                ->first();

            if ($existingReaction) {
                return [
                    'success' => true,
                    'message' => 'Reaction already exists',
                    'data' => $existingReaction
                ];
            }

            // Add new reaction
            $reaction = $this->messageRepository->addReaction((int) $messageId, $userId, $emoji);

            // Broadcast reaction added event
            $payload = [
                'roomType' => $roomType,
                'roomId' => (string) $roomId,
                'messageId' => (string) $messageId,
                'userId' => (string) $userId,
                'emoji' => $emoji,
                'reactionId' => (string) $reaction['id'],
                'createdAt' => now()->toISOString(),
            ];

            broadcast(new MessageReactionAdded($payload))->toOthers();

            return [
                'success' => true,
                'message' => 'Reaction added successfully',
                'data' => $reaction
            ];
        } catch (\Throwable $e) {
            Log::error('MessageApplicationService@addReaction failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to add reaction',
            ];
        }
    }

    /**
     * Remove reaction from message
     */
    public function removeReaction(string $messageId, int $userId, string $emoji): array
    {
        try {
            // Get message info to determine room type and ID
            $message = $this->messageRepository->findById((int) $messageId);
            if (!$message) {
                return ['success' => false, 'message' => 'Message not found'];
            }

            // Check if conversation_id exists and is not null
            $hasConversationId = $message->getConversationId() !== null;
            $roomType = $hasConversationId ? 'direct' : 'channel';
            $roomId = $hasConversationId ? $message->getConversationId() : $message->getChannelId();

            $deleted = $this->messageRepository->removeReaction((int) $messageId, $userId, $emoji);

            if ($deleted) {
                // Broadcast reaction removed event
                $payload = [
                    'roomType' => $roomType,
                    'roomId' => (string) $roomId,
                    'messageId' => (string) $messageId,
                    'userId' => (string) $userId,
                    'emoji' => $emoji,
                    'removedAt' => now()->toISOString(),
                ];

                broadcast(new MessageReactionRemoved($payload))->toOthers();

                return [
                    'success' => true,
                    'message' => 'Reaction removed successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Reaction not found'
                ];
            }
        } catch (\Throwable $e) {
            Log::error('MessageApplicationService@removeReaction failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to remove reaction',
            ];
        }
    }
}
