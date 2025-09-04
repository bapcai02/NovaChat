<?php

namespace App\Services;

use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Support\Facades\Log;

class TeamService
{
    public function __construct(private TeamRepositoryInterface $teams)
    {
    }

    public function getTeamsForUser(int $userId): array
    {
        try {
            $data = $this->teams->getTeamsForUser($userId);
            return ['success' => true, 'data' => $data];
        } catch (\Throwable $e) {
            Log::error('TeamService@getTeamsForUser failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to load teams'];
        }
    }

    public function createTeam(array $data, int $userId): array
    {
        try {
            $team = $this->teams->create($data, $userId);
            return ['success' => true, 'data' => $team];
        } catch (\Throwable $e) {
            Log::error('TeamService@createTeam failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to create team'];
        }
    }
}


