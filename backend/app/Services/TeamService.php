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
}


