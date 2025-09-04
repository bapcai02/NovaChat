<?php

namespace App\Repositories\Contracts;

interface ConversationRepositoryInterface
{
    public function getUserConversations(int $userId): array;
    public function getConversationMessages(int $userId, int $conversationId): array;
}


