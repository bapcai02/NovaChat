<?php

namespace App\Domain\Message\Repositories;

use App\Domain\Message\Entities\Message;

interface MessageRepositoryInterface
{
    /**
     * Find message by ID
     */
    public function findById(int $id): ?Message;

    /**
     * Get messages for a room with pagination
     */
    public function getMessagesForRoom(string $roomId, string $type = 'channel', int $limit = 50, ?int $beforeId = null): array;

    /**
     * Store a new message
     */
    public function store(array $data): Message;

    /**
     * Get message reactions
     */
    public function getMessageReactions(int $messageId): array;

    /**
     * Add reaction to message
     */
    public function addReaction(int $messageId, int $userId, string $emoji): array;

    /**
     * Remove reaction from message
     */
    public function removeReaction(int $messageId, int $userId, string $emoji): bool;
}
