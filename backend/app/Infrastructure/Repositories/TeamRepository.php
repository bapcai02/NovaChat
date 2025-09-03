<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Team\Repositories\TeamRepositoryInterface;
use App\Domain\Team\Entities\Team;
use Illuminate\Support\Facades\DB;

class TeamRepository implements TeamRepositoryInterface
{
    public function findById(int $id): ?Team
    {
        $data = DB::table('teams')->find($id);
        return $data ? $this->mapToEntity($data) : null;
    }

    public function getTeamsForUser(int $userId): array
    {
        return DB::table('teams')
            ->join('team_members', 'teams.id', '=', 'team_members.team_id')
            ->where('team_members.user_id', $userId)
            ->select('teams.*')
            ->get()
            ->map(function ($team) {
                return [
                    'id' => $team->id,
                    'name' => $team->name,
                    'description' => $team->description,
                    'created_at' => $team->created_at,
                    'updated_at' => $team->updated_at,
                ];
            })
            ->toArray();
    }

    public function create(array $data, int $userId): Team
    {
        DB::beginTransaction();

        try {
            $teamId = DB::table('teams')->insertGetId([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('team_members')->insert([
                'team_id' => $teamId,
                'user_id' => $userId,
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (isset($data['members']) && is_array($data['members'])) {
                foreach ($data['members'] as $memberId) {
                    DB::table('team_members')->insert([
                        'team_id' => $teamId,
                        'user_id' => $memberId,
                        'role' => 'member',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();

            return $this->findById($teamId);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function addMember(int $teamId, int $userId, string $role = 'member'): bool
    {
        $existingMember = DB::table('team_members')
            ->where('team_id', $teamId)
            ->where('user_id', $userId)
            ->first();

        if ($existingMember) {
            return false;
        }

        return DB::table('team_members')->insert([
            'team_id' => $teamId,
            'user_id' => $userId,
            'role' => $role,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function removeMember(int $teamId, int $userId): bool
    {
        return DB::table('team_members')
            ->where('team_id', $teamId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function isMember(int $teamId, int $userId): bool
    {
        return DB::table('team_members')
            ->where('team_id', $teamId)
            ->where('user_id', $userId)
            ->exists();
    }

    private function mapToEntity($data): Team
    {
        return new Team(
            id: $data->id,
            name: $data->name,
            description: $data->description,
            createdBy: $data->created_by,
            createdAt: $data->created_at,
            updatedAt: $data->updated_at
        );
    }
}
