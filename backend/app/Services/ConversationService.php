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
}


