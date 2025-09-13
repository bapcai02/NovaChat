<?php

namespace App\Services;

use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Support\Facades\Log;

class TeamService
{
    private TeamRepositoryInterface $teams;

    public function __construct(TeamRepositoryInterface $teams)
    {
        $this->teams = $teams;
    }

    public function getTeamsForUser(int $userId): array
    {
        $data = $this->teams->getTeamsForUser($userId);
        return ['success' => true, 'data' => $data];
    }

    public function createTeam(array $data, int $userId): array
    {
        $team = $this->teams->create($data, $userId);
        return ['success' => true, 'data' => $team];
    }

    public function addMember(int $teamId, int $userId, int $addedBy): array
    {
        try {
            $result = $this->teams->addMember($teamId, $userId);
            if ($result) {
                return ['success' => true, 'message' => 'Member added successfully'];
            }
            return ['success' => false, 'message' => 'Failed to add member'];
        } catch (\Exception $e) {
            Log::error('Failed to add member to team', [
                'team_id' => $teamId,
                'user_id' => $userId,
                'added_by' => $addedBy,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'message' => 'Failed to add member: ' . $e->getMessage()];
        }
    }

    public function removeMember(int $teamId, int $userId, int $removedBy): array
    {
        try {
            $result = $this->teams->removeMember($teamId, $userId);
            if ($result) {
                return ['success' => true, 'message' => 'Member removed successfully'];
            }
            return ['success' => false, 'message' => 'Failed to remove member'];
        } catch (\Exception $e) {
            Log::error('Failed to remove member from team', [
                'team_id' => $teamId,
                'user_id' => $userId,
                'removed_by' => $removedBy,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'message' => 'Failed to remove member: ' . $e->getMessage()];
        }
    }
}


