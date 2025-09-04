<?php

namespace App\Services;

use App\Repositories\Contracts\ConversationRepositoryInterface;

class ConversationService
{
    public function __construct(private ConversationRepositoryInterface $conversations)
    {
    }

    public function getUserConversations(int $userId): array
    {
        return $this->conversations->getUserConversations($userId);
    }

    public function getConversationMessages(int $userId, int $conversationId): array
    {
        return $this->conversations->getConversationMessages($userId, $conversationId);
    }

    public function createDirectConversation(int $userId1, int $userId2, ?string $name = null): array
    {
        return $this->conversations->createDirectConversation($userId1, $userId2, $name);
    }

    public function createTeamConversation(int $teamId, array $userIds, ?string $name = null): array
    {
        return $this->conversations->createTeamConversation($teamId, $userIds, $name);
    }

    public function addMemberToConversation(int $conversationId, int $userId): bool
    {
        return $this->conversations->addMemberToConversation($conversationId, $userId);
    }

    public function removeMemberFromConversation(int $conversationId, int $userId): bool
    {
        return $this->conversations->removeMemberFromConversation($conversationId, $userId);
    }
}


