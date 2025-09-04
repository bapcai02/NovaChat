<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Message\Repositories\MessageRepositoryInterface;
use App\Domain\Message\Entities\Message;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MessageRepository implements MessageRepositoryInterface
{
    public function findById(int $id): ?Message
    {
        $data = DB::table('messages')->find($id);
        return $data ? $this->mapToEntity($data) : null;
    }

    public function getMessagesForRoom(string $roomId, string $type = 'channel', int $limit = 50, ?int $beforeId = null, ?int $userId = null): array
    {
        $query = DB::table('messages');

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

        // Join with bookmarks table to get bookmark status
        if ($userId) {
            $query->leftJoin('bookmarks', function ($join) use ($userId) {
                $join->on('messages.id', '=', 'bookmarks.message_id')
                     ->where('bookmarks.user_id', '=', $userId);
            })
            ->select('messages.*', 'bookmarks.id as bookmark_id');
        }

        $rows = $query
            ->orderBy('messages.id', 'desc')
            ->limit($limit)
            ->get();

        return $rows->map(function ($message) {
            return [
                'id' => $message->id,
                'room_id' => $message->channel_id ?? $message->conversation_id ?? null,
                'sender' => [
                    'id' => $message->user_id,
                    'name' => 'User ' . $message->user_id,
                    'username' => 'user' . $message->user_id,
                ],
                'content' => $message->content,
                'type' => $message->type ?? 'text',
                'created_at' => $message->created_at,
                'is_edited' => (bool) $message->is_edited,
                'is_pinned' => (bool) $message->is_pinned,
                'attachments' => [],
                'reactions' => $this->getMessageReactions($message->id),
                'read_by' => [],
                'is_bookmarked' => !empty($message->bookmark_id),
            ];
        })->reverse()->values()->toArray();
    }

    public function store(array $data): Message
    {
        $messageId = DB::table('messages')->insertGetId($data);
        return $this->findById($messageId);
    }

    public function getMessageReactions(int $messageId): array
    {
        return DB::table('message_reactions')
            ->where('message_id', $messageId)
            ->select('emoji', DB::raw('COUNT(*) as count'))
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

    public function addReaction(int $messageId, int $userId, string $emoji): array
    {
        $reactionId = DB::table('message_reactions')->insertGetId([
            'message_id' => $messageId,
            'user_id' => $userId,
            'emoji' => $emoji,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DB::table('message_reactions')->find($reactionId);
    }

    public function removeReaction(int $messageId, int $userId, string $emoji): bool
    {
        return DB::table('message_reactions')
            ->where('message_id', $messageId)
            ->where('user_id', $userId)
            ->where('emoji', $emoji)
            ->delete() > 0;
    }

    private function mapToEntity($data): Message
    {
        return new Message(
            $data->id,
            $data->user_id,
            $data->content,
            $data->type ?? 'text',
            $data->channel_id ?? null,
            $data->conversation_id ?? null,
            $data->parent_id ?? null,
            $data->metadata ?? null,
            $data->is_edited ?? false,
            $data->edited_at ?? null,
            $data->is_pinned ?? false,
            $data->is_deleted ?? false,
            $data->created_at,
            $data->updated_at
        );
    }
}
