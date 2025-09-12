<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Models\Team;
use App\Models\TeamMember;

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
        $team = Team::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'created_by' => $userId,
        ]);
        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $userId,
            'role' => 'owner',
        ]);
        return $team->toArray();
    }

    public function addMember(int $teamId, int $userId, string $role = 'member'): bool
    {
        return (bool) TeamMember::create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'role' => $role,
        ]);
    }

    public function removeMember(int $teamId, int $userId): bool
    {
        return TeamMember::where('team_id', $teamId)->where('user_id', $userId)->delete() > 0;
    }

    public function isMember(int $teamId, int $userId): bool
    {
        return TeamMember::where('team_id', $teamId)->where('user_id', $userId)->exists();
    }
}


