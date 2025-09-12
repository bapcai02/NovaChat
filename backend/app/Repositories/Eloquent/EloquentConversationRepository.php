<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\ConversationRepositoryInterface;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EloquentConversationRepository implements ConversationRepositoryInterface
{
    public function getUserConversations(int $userId): array
    {
        return Conversation::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['members', 'team', 'channel'])
        ->withCount('messages')
        ->orderByDesc('updated_at')
        ->get()
        ->map(function ($conversation) use ($userId) {
            $otherMember = $conversation->members()->where('user_id', '!=', $userId)->first();
            $unreadCount = $this->getUnreadCount($conversation->id, $userId);
            
            return [
                'id' => $conversation->id,
                'type' => $conversation->type,
                'title' => $conversation->title,
                'name' => $conversation->name,
                'team_id' => $conversation->team_id,
                'channel_id' => $conversation->channel_id,
                'messages_count' => $conversation->messages_count,
                'unread_count' => $unreadCount,
                'other_member' => $otherMember ? [
                    'id' => $otherMember->id,
                    'name' => $otherMember->name,
                    'username' => $otherMember->username,
                    'avatar' => $otherMember->avatar,
                ] : null,
                'last_message' => $this->getLastMessage($conversation->id),
                'created_at' => $conversation->created_at,
                'updated_at' => $conversation->updated_at,
            ];
        })
        ->toArray();
    }

    public function getMessages(int $conversationId, int $limit = 50, ?int $beforeId = null, ?int $userId = null): array
    {
        $query = Message::where('conversation_id', $conversationId)
            ->whereNull('parent_id')  // Exclude thread replies from main conversation
            ->with(['user', 'reactions', 'replies'])
            ->orderByDesc('id');

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        $messages = $query->limit($limit)->get();

        return $messages->map(function ($message) use ($userId) {
            return [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'parent_id' => $message->parent_id,
                'sender' => [
                    'id' => $message->user->id,
                    'name' => $message->user->name,
                    'username' => $message->user->username,
                    'avatar' => $message->user->avatar,
                ],
                'content' => $message->content,
                'type' => $message->type,
                'metadata' => $message->metadata,
                'is_edited' => $message->is_edited,
                'is_pinned' => $message->is_pinned,
                'is_deleted' => $message->is_deleted,
                'created_at' => $message->created_at,
                'updated_at' => $message->updated_at,
                'edited_at' => $message->edited_at,
                'reactions' => $message->reactions->groupBy('emoji')->map(function ($reactions, $emoji) {
                    return [
                        'emoji' => $emoji,
                        'count' => $reactions->count(),
                        'users' => $reactions->pluck('user_id')->toArray(),
                    ];
                })->values()->toArray(),
                'replies_count' => $message->replies->count(),
                'is_bookmarked' => $userId ? $message->bookmarks()->where('user_id', $userId)->exists() : false,
            ];
        })
        ->reverse()
        ->values()
        ->toArray();
    }

    public function create(array $data): array
    {
        $conversation = Conversation::create([
            'type' => $data['type'],
            'name' => $data['name'] ?? null,
            'team_id' => $data['team_id'] ?? null,
            'channel_id' => $data['channel_id'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);

        // Add creator as member
        ConversationMember::create([
            'conversation_id' => $conversation->id,
            'user_id' => $data['creator_id'],
            'joined_at' => now(),
        ]);

        // Add other members if provided
        if (isset($data['user_ids']) && is_array($data['user_ids'])) {
            foreach ($data['user_ids'] as $userId) {
                if ($userId != $data['creator_id']) {
                    ConversationMember::create([
                        'conversation_id' => $conversation->id,
                        'user_id' => $userId,
                        'joined_at' => now(),
                    ]);
                }
            }
        }

        return $conversation->fresh()->toArray();
    }

    public function findById(int $id): ?array
    {
        $conversation = Conversation::with(['members', 'team', 'channel'])->find($id);
        return $conversation ? $conversation->toArray() : null;
    }

    public function addMember(int $conversationId, int $userId): bool
    {
        try {
            ConversationMember::create([
                'conversation_id' => $conversationId,
                'user_id' => $userId,
                'joined_at' => now(),
            ]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function removeMember(int $conversationId, int $userId): bool
    {
        return ConversationMember::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function isMember(int $conversationId, int $userId): bool
    {
        return ConversationMember::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->exists();
    }

    public function canManageMembers(int $conversationId, int $userId): bool
    {
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            return false;
        }

        // For direct messages, only participants can manage
        if ($conversation->type === 'direct') {
            return $this->isMember($conversationId, $userId);
        }

        // For team/channel conversations, check team permissions
        if ($conversation->team_id) {
            $teamMember = DB::table('team_members')
                ->where('team_id', $conversation->team_id)
                ->where('user_id', $userId)
                ->whereIn('role', ['owner', 'admin'])
                ->exists();
            return $teamMember;
        }

        return false;
    }

    private function getUnreadCount(int $conversationId, int $userId): int
    {
        $lastRead = ConversationMember::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->value('last_read_at');

        if (!$lastRead) {
            return Message::where('conversation_id', $conversationId)->count();
        }

        return Message::where('conversation_id', $conversationId)
            ->where('created_at', '>', $lastRead)
            ->count();
    }

    private function getLastMessage(int $conversationId): ?array
    {
        $message = Message::where('conversation_id', $conversationId)
            ->with('user')
            ->orderByDesc('id')
            ->first();

        if (!$message) {
            return null;
        }

        return [
            'id' => $message->id,
            'content' => $message->content,
            'type' => $message->type,
            'sender' => [
                'id' => $message->user->id,
                'name' => $message->user->name,
                'username' => $message->user->username,
            ],
            'created_at' => $message->created_at,
        ];
    }
}