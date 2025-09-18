<?php

namespace App\Repositories\Contracts;

interface ConversationRepositoryInterface
{
    public function getUserConversations(int $userId): array;
    public function getMessages(int $conversationId, int $limit = 50, ?int $beforeId = null, ?int $userId = null): array;
    public function create(array $data): array;
    public function findById(int $id): ?array;
    public function getMembers(int $conversationId): array;
    public function addMember(int $conversationId, int $userId): bool;
    public function removeMember(int $conversationId, int $userId): bool;
    public function isMember(int $conversationId, int $userId): bool;
    public function canManageMembers(int $conversationId, int $userId): bool;
    public function pinConversation(int $conversationId): bool;
    public function unpinConversation(int $conversationId): bool;
    public function getMentions(int $userId, int $page = 1, int $limit = 20): array;
}


