<?php

namespace App\Domain\Team\Repositories;

use App\Domain\Team\Entities\Team;

interface TeamRepositoryInterface
{
    /**
     * Find team by ID
     */
    public function findById(int $id): ?Team;

    /**
     * Get teams for user
     */
    public function getTeamsForUser(int $userId): array;

    /**
     * Create a new team
     */
    public function create(array $data, int $userId): Team;

    /**
     * Add member to team
     */
    public function addMember(int $teamId, int $userId, string $role = 'member'): bool;

    /**
     * Remove member from team
     */
    public function removeMember(int $teamId, int $userId): bool;

    /**
     * Check if user is member of team
     */
    public function isMember(int $teamId, int $userId): bool;
}
