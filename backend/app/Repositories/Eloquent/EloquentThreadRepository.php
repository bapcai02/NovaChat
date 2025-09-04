<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\ThreadRepositoryInterface;
use App\Models\Message;

class EloquentThreadRepository implements ThreadRepositoryInterface
{
    public function getRepliesByMessageId(int $messageId): array
    {
        return Message::where('parent_id', $messageId)->orderBy('id')->get()->toArray();
    }

    public function createReply(int $parentMessageId, int $userId, string $content, ?string $type = 'text', array $metadata = []): array
    {
        $msg = Message::create([
            'parent_id' => $parentMessageId,
            'user_id' => $userId,
            'content' => $content,
            'type' => $type ?? 'text',
            'metadata' => $metadata ? json_encode($metadata) : null,
        ]);
        return $msg->toArray();
    }
}


