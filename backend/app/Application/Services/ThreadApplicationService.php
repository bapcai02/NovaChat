<?php

namespace App\Application\Services;

use App\Domain\Message\Repositories\ThreadRepositoryInterface;

class ThreadApplicationService
{
    private ThreadRepositoryInterface $threadRepository;

    public function __construct(ThreadRepositoryInterface $threadRepository)
    {
        $this->threadRepository = $threadRepository;
    }

    public function getReplies(int $messageId): array
    {
        return $this->threadRepository->getRepliesByMessageId($messageId);
    }

    public function addReply(int $parentMessageId, int $userId, string $content, ?string $type = 'text', array $metadata = []): array
    {
        return $this->threadRepository->createReply($parentMessageId, $userId, $content, $type, $metadata);
    }
}


