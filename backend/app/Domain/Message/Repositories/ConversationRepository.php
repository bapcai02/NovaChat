<?php

namespace App\Domain\Message\Repositories;

use Illuminate\Support\Facades\DB;

class ConversationRepository implements ConversationRepositoryInterface
{
    public function getUserConversations(int $userId): array
    {
        $dmPairs = DB::table('messages')
            ->select('user_id', 'metadata', 'content', 'created_at')
            ->where('channel_id', 0)
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get()
            ->map(function ($m) {
                $meta = json_decode($m->metadata ?? '{}', true) ?: [];
                return ['user_id' => $m->user_id, 'peer_id' => $meta['receiver_id'] ?? null, 'last' => $m];
            })
            ->filter(fn($r) => $r['peer_id'])
            ->groupBy('peer_id')
            ->map(function ($group) {
                return $group->first();
            })
            ->values();

        $conversations = [];
        foreach ($dmPairs as $pair) {
            $otherUserId = $pair['peer_id'];
            $otherUser = DB::table('users')->where('id', $otherUserId)->first();
            
            if ($otherUser) {
                $unreadCount = DB::table('messages')
                    ->where('channel_id', 0)
                    ->where('user_id', $otherUserId)
                    ->whereJsonContains('metadata->receiver_id', $userId)
                    ->whereJsonLength('metadata->read_by', 0)
                    ->count();

                $conversations[] = [
                    'id' => $otherUserId,
                    'type' => 'dm',
                    'title' => $otherUser->name,
                    'avatar' => $otherUser->avatar,
                    'unread_count' => $unreadCount,
                    'last_message_preview' => substr($pair['last']->content, 0, 80),
                    'updated_at' => $pair['last']->created_at,
                ];
            }
        }

        return $conversations;
    }

    public function getConversationMessages(int $userId, int $conversationId): array
    {
        return DB::table('messages')
            ->where('channel_id', 0)
            ->where(function ($query) use ($userId, $conversationId) {
                $query->where(function ($q) use ($userId, $conversationId) {
                    $q->where('user_id', $userId)
                      ->whereJsonContains('metadata->receiver_id', $conversationId);
                })->orWhere(function ($q) use ($userId, $conversationId) {
                    $q->where('user_id', $conversationId)
                      ->whereJsonContains('metadata->receiver_id', $userId);
                });
            })
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) use ($userId) {
                $metadata = json_decode($message->metadata ?? '{}', true) ?: [];
                $author = DB::table('users')->where('id', $message->user_id)->first();
                
                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'author' => [
                        'name' => $author->name,
                        'username' => $author->username,
                        'avatar' => $author->avatar,
                    ],
                    'timestamp' => $message->created_at,
                    'type' => $message->type,
                    'attachments' => $metadata['attachments'] ?? [],
                    'reactions' => $metadata['reactions'] ?? [],
                    'readBy' => $metadata['read_by'] ?? [],
                    'isEdited' => $message->is_edited ?? false,
                    'isPinned' => $message->is_pinned ?? false,
                    'thread' => $metadata['thread'] ?? null,
                ];
            })
            ->toArray();
    }
}
