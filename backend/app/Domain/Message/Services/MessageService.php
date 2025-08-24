<?php

namespace App\Domain\Message\Services;

use App\Domain\Message\Entities\Message;
use App\Domain\Message\Entities\MessageReaction;
use App\Domain\Message\Repositories\MessageRepository;
use App\Domain\Channel\Repositories\ChannelRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MessageService
{
    protected MessageRepository $messageRepository;
    protected ChannelRepository $channelRepository;

    public function __construct(MessageRepository $messageRepository, ChannelRepository $channelRepository)
    {
        $this->messageRepository = $messageRepository;
        $this->channelRepository = $channelRepository;
    }

    /**
     * Get messages for a channel
     */
    public function getMessagesForChannel(
        string $channelId, 
        int $userId, 
        int $page = 1, 
        int $limit = 50, 
        ?string $before = null, 
        ?string $after = null
    ): Collection {
        return $this->messageRepository->getMessagesForChannel($channelId, $userId, $page, $limit, $before, $after);
    }

    /**
     * Create a new message
     */
    public function createMessage(array $messageData): ?Message
    {
        try {
            DB::beginTransaction();

            // Check if user has access to the channel
            $hasAccess = $this->channelRepository->isUserMember($messageData['channel_id'], $messageData['user_id']);
            
            if (!$hasAccess) {
                return null;
            }

            $message = $this->messageRepository->create([
                'content' => $messageData['content'],
                'type' => $messageData['type'] ?? 'text',
                'channel_id' => $messageData['channel_id'],
                'user_id' => $messageData['user_id'],
                'reply_to' => $messageData['reply_to'] ?? null,
                'attachments' => json_encode($messageData['attachments'] ?? [])
            ]);

            DB::commit();
            return $message;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create message: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get a specific message
     */
    public function getMessage(string $messageId, string $channelId, int $userId): ?Message
    {
        // Check if user has access to the channel
        $hasAccess = $this->channelRepository->isUserMember($channelId, $userId);
        
        if (!$hasAccess) {
            return null;
        }

        return $this->messageRepository->findById($messageId);
    }

    /**
     * Update a message
     */
    public function updateMessage(string $messageId, string $channelId, int $userId, string $content): ?Message
    {
        $message = $this->messageRepository->findById($messageId);
        
        if (!$message) {
            return null;
        }

        // Check if user has access to the channel
        $hasAccess = $this->channelRepository->isUserMember($channelId, $userId);
        
        if (!$hasAccess) {
            return null;
        }

        // Check if user is the message author
        if ($message->user_id !== $userId) {
            return null;
        }

        try {
            $updatedMessage = $this->messageRepository->update($messageId, [
                'content' => $content,
                'edited_at' => now()
            ]);
            
            return $updatedMessage;
        } catch (\Exception $e) {
            Log::error('Failed to update message: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete a message
     */
    public function deleteMessage(string $messageId, string $channelId, int $userId): bool
    {
        $message = $this->messageRepository->findById($messageId);
        
        if (!$message) {
            return false;
        }

        // Check if user has access to the channel
        $hasAccess = $this->channelRepository->isUserMember($channelId, $userId);
        
        if (!$hasAccess) {
            return false;
        }

        // Check if user is the message author or has admin permissions
        $isAuthor = $message->user_id === $userId;
        $isAdmin = $this->channelRepository->isUserAdmin($channelId, $userId);
        
        if (!$isAuthor && !$isAdmin) {
            return false;
        }

        try {
            return $this->messageRepository->delete($messageId);
        } catch (\Exception $e) {
            Log::error('Failed to delete message: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Add reaction to message
     */
    public function addReaction(string $messageId, string $channelId, int $userId, string $emoji): ?MessageReaction
    {
        $message = $this->messageRepository->findById($messageId);
        
        if (!$message) {
            return null;
        }

        // Check if user has access to the channel
        $hasAccess = $this->channelRepository->isUserMember($channelId, $userId);
        
        if (!$hasAccess) {
            return null;
        }

        // Check if reaction already exists
        $existingReaction = $this->messageRepository->findReaction($messageId, $userId, $emoji);
        
        if ($existingReaction) {
            return $existingReaction;
        }

        try {
            $reaction = $this->messageRepository->addReaction($messageId, $userId, $emoji);
            return $reaction;
        } catch (\Exception $e) {
            Log::error('Failed to add reaction: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Remove reaction from message
     */
    public function removeReaction(string $messageId, string $channelId, int $userId, string $emoji): bool
    {
        $message = $this->messageRepository->findById($messageId);
        
        if (!$message) {
            return false;
        }

        // Check if user has access to the channel
        $hasAccess = $this->channelRepository->isUserMember($channelId, $userId);
        
        if (!$hasAccess) {
            return false;
        }

        try {
            return $this->messageRepository->removeReaction($messageId, $userId, $emoji);
        } catch (\Exception $e) {
            Log::error('Failed to remove reaction: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Mark message as read
     */
    public function markAsRead(string $messageId, string $channelId, int $userId): bool
    {
        $message = $this->messageRepository->findById($messageId);
        
        if (!$message) {
            return false;
        }

        // Check if user has access to the channel
        $hasAccess = $this->channelRepository->isUserMember($channelId, $userId);
        
        if (!$hasAccess) {
            return false;
        }

        try {
            return $this->messageRepository->markAsRead($messageId, $userId);
        } catch (\Exception $e) {
            Log::error('Failed to mark message as read: ' . $e->getMessage());
            return false;
        }
    }
}
