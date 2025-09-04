<?php

namespace App\Repositories\Contracts;

interface ConversationRepositoryInterface
{
    public function getUserConversations(int $userId): array;
    public function getConversationMessages(int $userId, int $conversationId): array;
    public function createDirectConversation(int $userId1, int $userId2, ?string $name = null): array;
    public function createTeamConversation(int $teamId, array $userIds, ?string $name = null): array;
    public function addMemberToConversation(int $conversationId, int $userId): bool;
    public function removeMemberFromConversation(int $conversationId, int $userId): bool;
}


