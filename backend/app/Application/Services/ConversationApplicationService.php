<?php

namespace App\Application\Services;

use App\Domain\Message\Repositories\ConversationRepositoryInterface;

class ConversationApplicationService
{
    private ConversationRepositoryInterface $conversationRepository;

    public function __construct(ConversationRepositoryInterface $conversationRepository)
    {
        $this->conversationRepository = $conversationRepository;
    }

    public function getUserConversations(int $userId): array
    {
        return $this->conversationRepository->getUserConversations($userId);
    }

    public function getConversationMessages(int $userId, int $conversationId): array
    {
        return $this->conversationRepository->getConversationMessages($userId, $conversationId);
    }
}
