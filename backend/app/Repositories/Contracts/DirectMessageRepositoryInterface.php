<?php

namespace App\Repositories\Contracts;

interface DirectMessageRepositoryInterface
{
    public function getMessagesBetweenUsers(int $userId1, int $userId2): array;
    public function getUserConversations(int $userId): array;
    public function create(array $data): array;
    public function markAsRead(int $messageId, int $userId): bool;
    public function deleteMessage(int $messageId, int $userId): bool;
    public function findById(int $id): ?array;
}
