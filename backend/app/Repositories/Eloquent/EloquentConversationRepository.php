<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\ConversationRepositoryInterface;
use App\Models\Conversation;
use App\Models\Message;

class EloquentConversationRepository implements ConversationRepositoryInterface
{
    public function getUserConversations(int $userId): array
    {
        $conversations = Conversation::whereHas('members', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        })->get();
        return $conversations->toArray();
    }

    public function getConversationMessages(int $userId, int $conversationId): array
    {
        return Message::where('conversation_id', $conversationId)
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->toArray();
    }
}


