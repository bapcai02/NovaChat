<?php

namespace App\Services;

use App\Repositories\Contracts\ThreadRepositoryInterface;

class ThreadService
{
    public function __construct(private ThreadRepositoryInterface $threads)
    {
    }

    public function getReplies(int $messageId): array
    {
        return $this->threads->getRepliesByMessageId($messageId);
    }

    public function addReply(int $parentMessageId, int $userId, string $content, ?string $type = 'text', array $metadata = []): array
    {
        return $this->threads->createReply($parentMessageId, $userId, $content, $type, $metadata);
    }
}


