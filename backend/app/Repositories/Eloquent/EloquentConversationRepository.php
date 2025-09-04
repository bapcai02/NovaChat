<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\ConversationRepositoryInterface;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\DirectMessage;
use Illuminate\Support\Facades\Schema;

class EloquentConversationRepository implements ConversationRepositoryInterface
{
    public function getUserConversations(int $userId): array
    {
        $conversations = Conversation::whereHas('members', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        })
        ->with(['members' => function ($q) use ($userId) {
            $q->where('user_id', '!=', $userId);
        }])
        ->withCount('messages')
        ->orderByDesc('updated_at')
        ->get();

        return $conversations->map(function ($conv) use ($userId) {
            $otherMember = $conv->members->first();
            return [
                'id' => $conv->id,
                'type' => $conv->type,
                'title' => $conv->title,
                'name' => $conv->name,
                'team_id' => $conv->team_id,
                'messages_count' => $conv->messages_count,
                'other_member' => $otherMember ? [
                    'id' => $otherMember->id,
                    'name' => $otherMember->name,
                    'username' => $otherMember->username,
                    'avatar' => $otherMember->avatar,
                ] : null,
                'created_at' => $conv->created_at,
                'updated_at' => $conv->updated_at,
            ];
        })->toArray();
    }

    public function getConversationMessages(int $userId, int $conversationId): array
    {
        return Message::where('conversation_id', $conversationId)
            ->with('user')
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'type' => $message->type,
                    'user_id' => $message->user_id,
                    'sender' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                        'username' => $message->user->username,
                        'avatar' => $message->user->avatar,
                    ],
                    'created_at' => $message->created_at,
                    'updated_at' => $message->updated_at,
                    'is_edited' => $message->is_edited,
                    'is_pinned' => $message->is_pinned,
                ];
            })
            ->toArray();
    }

    public function createDirectConversation(int $userId1, int $userId2, ?string $name = null): array
    {
        // Always create new conversation (allow multiple DMs between same users)
        $conversation = Conversation::create([
            'type' => 'direct',
            'team_id' => null,
            'name' => $name,
        ]);

        // Add both users as members
        $conversation->members()->attach([
            $userId1 => ['joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            $userId2 => ['joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'name' => $conversation->name,
            'created_at' => $conversation->created_at,
        ];
    }

    public function createTeamConversation(int $teamId, array $userIds, ?string $name = null): array
    {
        $conversation = Conversation::create([
            'type' => 'team',
            'team_id' => $teamId,
            'name' => $name ?: 'Team Chat',
        ]);

        // Add all users as members
        $members = [];
        foreach ($userIds as $userId) {
            $members[$userId] = ['joined_at' => now(), 'created_at' => now(), 'updated_at' => now()];
        }
        $conversation->members()->attach($members);

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'team_id' => $conversation->team_id,
            'name' => $conversation->name,
            'created_at' => $conversation->created_at,
        ];
    }

    public function addMemberToConversation(int $conversationId, int $userId): bool
    {
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            return false;
        }

        $conversation->members()->syncWithoutDetaching([
            $userId => ['joined_at' => now(), 'created_at' => now(), 'updated_at' => now()]
        ]);

        return true;
    }

    public function removeMemberFromConversation(int $conversationId, int $userId): bool
    {
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            return false;
        }

        $conversation->members()->detach($userId);
        return true;
    }
}


