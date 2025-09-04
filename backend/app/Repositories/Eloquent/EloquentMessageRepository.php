<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\MessageRepositoryInterface;
use App\Models\Message;
use App\Models\MessageReaction;
use Illuminate\Support\Facades\Schema;

class EloquentMessageRepository implements MessageRepositoryInterface
{
    public function findById(int $id): ?array
    {
        $row = Message::find($id);
        return $row ? $row->toArray() : null;
    }

    public function getForRoom(string $roomId, string $type = 'channel', int $limit = 50, ?int $beforeId = null, ?int $userId = null): array
    {
        $query = Message::query();
        if ($type === 'direct') {
            if (Schema::hasColumn('messages', 'conversation_id')) {
                $query->where('conversation_id', $roomId);
            } else {
                $query->where('channel_id', $roomId);
            }
        } else {
            $query->where('channel_id', $roomId);
        }
        if ($beforeId) {
            $query->where('id', '<', (int) $beforeId);
        }
        $rows = $query->orderByDesc('id')->limit($limit)->get();
        return $rows->map(function ($row) use ($userId) {
            return [
                'id' => $row->id,
                'room_id' => $row->channel_id ?? $row->conversation_id ?? null,
                'sender' => [ 'id' => $row->user_id ],
                'content' => $row->content,
                'type' => $row->type ?? 'text',
                'created_at' => $row->created_at,
                'is_edited' => (bool) $row->is_edited,
                'is_pinned' => (bool) $row->is_pinned,
                'attachments' => [],
                'reactions' => $this->getMessageReactions($row->id),
                'read_by' => [],
                'is_bookmarked' => $userId ? \App\Models\Bookmark::where('user_id', $userId)->where('message_id', $row->id)->exists() : false,
            ];
        })->reverse()->values()->toArray();
    }

    public function create(array $data): object
    {
        $message = Message::create($data);
        return (object) $message->fresh()->toArray();
    }

    public function addReaction(int $messageId, int $userId, string $emoji): array
    {
        $reaction = MessageReaction::create([
            'message_id' => $messageId,
            'user_id' => $userId,
            'emoji' => $emoji,
        ]);
        return $reaction->toArray();
    }

    public function removeReaction(int $messageId, int $userId, string $emoji): bool
    {
        return MessageReaction::where('message_id', $messageId)
            ->where('user_id', $userId)
            ->where('emoji', $emoji)
            ->delete() > 0;
    }

    private function getMessageReactions(int $messageId): array
    {
        return MessageReaction::select('emoji', \DB::raw('COUNT(*) as count'))
            ->where('message_id', $messageId)
            ->groupBy('emoji')
            ->get()
            ->map(function ($reaction) {
                return [
                    'emoji' => $reaction->emoji,
                    'count' => (int) $reaction->count,
                    'users' => []
                ];
            })
            ->toArray();
    }
}


