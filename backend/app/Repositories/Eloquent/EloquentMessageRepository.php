<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\MessageRepositoryInterface;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\Bookmark;
use Illuminate\Support\Facades\DB;

class EloquentMessageRepository implements MessageRepositoryInterface
{
    public function findById(int $id): ?array
    {
        $row = Message::find($id);
        return $row ? $row->toArray() : null;
    }

    public function getForRoom(string $roomId, string $type = 'channel', int $limit = 50, ?int $beforeId = null, ?int $userId = null): array
    {
        // For direct messages, use Message model with conversation
        if ($type === 'direct') {
            $query = Message::query()->with('user');
            $query->where('conversation_id', $roomId);
            
            if ($beforeId) {
                $query->where('id', '<', (int) $beforeId);
            }
            
            $rows = $query->orderByDesc('id')->limit($limit)->get();
            
            return $rows->map(function ($row) use ($userId) {
                return [
                    'id' => $row->id,
                    'room_id' => $row->conversation_id,
                    'sender' => [
                        'id' => $row->user->id,
                        'name' => $row->user->name,
                        'username' => $row->user->username,
                        'avatar' => $row->user->avatar,
                    ],
                    'content' => $row->content,
                    'type' => $row->type ?? 'text',
                    'created_at' => $row->created_at,
                    'is_edited' => (bool) $row->is_edited,
                    'is_pinned' => (bool) $row->is_pinned,
                    'attachments' => [],
                    'reactions' => $this->getMessageReactions($row->id),
                    'read_by' => [],
                    'is_bookmarked' => $userId ? Bookmark::where('user_id', $userId)->where('message_id', $row->id)->exists() : false,
                ];
            })->reverse()->values()->toArray();
        }
        
        // For channel/team messages, use Message model
        $query = Message::query()->with('user');
        $query->where('channel_id', $roomId);
        
        if ($beforeId) {
            $query->where('id', '<', (int) $beforeId);
        }
        
        $rows = $query->orderByDesc('id')->limit($limit)->get();
        
        return $rows->map(function ($row) use ($userId) {
            return [
                'id' => $row->id,
                'room_id' => $row->channel_id,
                'sender' => [
                    'id' => $row->user->id,
                    'name' => $row->user->name,
                    'username' => $row->user->username,
                    'avatar' => $row->user->avatar,
                ],
                'content' => $row->content,
                'type' => $row->type ?? 'text',
                'created_at' => $row->created_at,
                'is_edited' => (bool) $row->is_edited,
                'is_pinned' => (bool) $row->is_pinned,
                'attachments' => [],
                'reactions' => $this->getMessageReactions($row->id),
                'read_by' => [],
                'is_bookmarked' => $userId ? Bookmark::where('user_id', $userId)->where('message_id', $row->id)->exists() : false,
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

    public function isBookmarked(int $messageId, int $userId): bool
    {
        return Bookmark::where('message_id', $messageId)
            ->where('user_id', $userId)
            ->exists();
    }

    public function createBookmark(int $messageId, int $userId, ?string $note = null): array
    {
        $bookmark = Bookmark::create([
            'message_id' => $messageId,
            'user_id' => $userId,
            'note' => $note,
        ]);
        return $bookmark->toArray();
    }

    public function removeBookmark(int $messageId, int $userId): bool
    {
        return Bookmark::where('message_id', $messageId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function getUserBookmarks(int $userId): array
    {
        return Bookmark::with('message.user')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->toArray();
    }

    public function edit(int $messageId, string $content): array
    {
        $message = Message::findOrFail($messageId);
        $message->update([
            'content' => $content,
            'is_edited' => true,
            'edited_at' => now(),
        ]);
        return $message->fresh()->toArray();
    }

    private function getMessageReactions(int $messageId): array
    {
        return MessageReaction::select('emoji', DB::raw('COUNT(*) as count'))
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


