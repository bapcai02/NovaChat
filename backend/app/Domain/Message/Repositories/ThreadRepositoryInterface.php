<?php

namespace App\Domain\Message\Repositories;

interface ThreadRepositoryInterface
{
    public function getRepliesByMessageId(int $messageId): array;
    public function createReply(int $parentMessageId, int $userId, string $content, ?string $type = 'text', array $metadata = []): array;
}


