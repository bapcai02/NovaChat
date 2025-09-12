<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\ThreadRepositoryInterface;
use App\Models\Message;

class EloquentThreadRepository implements ThreadRepositoryInterface
{
    public function getRepliesByMessageId(int $messageId): array
    {
        return Message::with('user')
            ->where('parent_id', $messageId)
            ->orderBy('id')
            ->get()
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'parent_id' => $row->parent_id,
                    'conversation_id' => $row->conversation_id,
                    'channel_id' => $row->channel_id,
                    'user_id' => $row->user_id,
                    'content' => $row->content,
                    'type' => $row->type ?? 'text',
                    'metadata' => $row->metadata ?? [],
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                    'sender' => $row->user ? [
                        'id' => $row->user->id,
                        'name' => $row->user->name,
                        'username' => $row->user->username,
                        'avatar' => $row->user->avatar,
                    ] : null,
                ];
            })
            ->toArray();
    }

    public function createReply(int $parentMessageId, int $userId, string $content, ?string $type = 'text', array $metadata = []): array
    {
        // Inherit conversation/channel from parent message
        $parent = Message::find($parentMessageId);
        $conversationId = $parent ? $parent->conversation_id : null;
        $channelId = $parent ? $parent->channel_id : null;

        $msg = Message::create([
            'parent_id' => $parentMessageId,
            'user_id' => $userId,
            'content' => $content,
            'type' => $type ?? 'text',
            'metadata' => $metadata ?: [],
            'conversation_id' => $conversationId,
            'channel_id' => $channelId,
        ]);
        $fresh = Message::with('user')->find($msg->id);
        return $fresh ? $fresh->toArray() : $msg->toArray();
    }
}


