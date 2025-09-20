<?php

namespace App\Repositories\Eloquent;

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Team;
use App\Models\TeamMember;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Support\Str;

class EloquentTeamRepository implements TeamRepositoryInterface
{
    public function findById(int $id): ?array
    {
        $row = Team::find($id);

        return $row ? $row->toArray() : null;
    }

    public function getTeamsForUser(int $userId): array
    {
        return Team::whereHas('members', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        })->get()->toArray();
    }

    public function create(array $data, int $userId): array
    {
        // Generate slug from name
        $slug = Str::slug($data['name']);

        // Ensure slug is unique
        $originalSlug = $slug;
        $counter = 1;
        while (Team::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        $team = Team::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'slug' => $slug,
            'owner_id' => $userId,
            'is_private' => $data['is_private'] ?? false,
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $userId,
            'role' => 'owner',
        ]);

        // Create team conversation
        $conversation = Conversation::create([
            'type' => 'team',
            'name' => $team->name,
            'team_id' => $team->id,
            'channel_id' => null,
            'metadata' => null,
        ]);

        // Add team owner to conversation
        ConversationMember::create([
            'conversation_id' => $conversation->id,
            'user_id' => $userId,
            'joined_at' => now(),
        ]);

        // Add selected members to team and conversation
        if (isset($data['members']) && is_array($data['members'])) {
            foreach ($data['members'] as $memberId) {
                if ($memberId != $userId) { // Don't add owner again
                    // Add to team_members
                    TeamMember::create([
                        'team_id' => $team->id,
                        'user_id' => $memberId,
                        'role' => 'member',
                    ]);

                    // Add to conversation
                    ConversationMember::create([
                        'conversation_id' => $conversation->id,
                        'user_id' => $memberId,
                        'joined_at' => now(),
                    ]);
                }
            }
        }

        return $team->toArray();
    }

    public function addMember(int $teamId, int $userId, string $role = 'member'): bool
    {
        $teamMember = TeamMember::create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'role' => $role,
        ]);

        if ($teamMember) {
            // Add to team conversation
            $teamConversation = Conversation::where('type', 'team')
                ->where('team_id', $teamId)
                ->first();

            if ($teamConversation) {
                ConversationMember::create([
                    'conversation_id' => $teamConversation->id,
                    'user_id' => $userId,
                    'joined_at' => now(),
                ]);
            }
        }

        return (bool) $teamMember;
    }

    public function removeMember(int $teamId, int $userId): bool
    {
        try {
            // Remove from team_members
            $teamMemberDeleted = TeamMember::where('team_id', $teamId)->where('user_id', $userId)->delete() > 0;

            // Also remove from team conversation
            $teamConversation = Conversation::where('type', 'team')->where('team_id', $teamId)->first();
            $conversationMemberDeleted = false;
            if ($teamConversation) {
                $conversationMemberDeleted = ConversationMember::where('conversation_id', $teamConversation->id)
                    ->where('user_id', $userId)
                    ->delete() > 0;
            }

            // Return true if either team member or conversation member was removed
            return $teamMemberDeleted || $conversationMemberDeleted;
        } catch (\Exception $e) {
            Log::error('Failed to remove member from team', [
                'team_id' => $teamId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function isMember(int $teamId, int $userId): bool
    {
        return TeamMember::where('team_id', $teamId)->where('user_id', $userId)->exists();
    }
}
