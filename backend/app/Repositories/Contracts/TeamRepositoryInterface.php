<?php

namespace App\Repositories\Contracts;

interface TeamRepositoryInterface
{
    public function findById(int $id): ?array;
    public function getTeamsForUser(int $userId): array;
    public function create(array $data, int $userId): array;
    public function addMember(int $teamId, int $userId, string $role = 'member'): bool;
    public function removeMember(int $teamId, int $userId): bool;
    public function isMember(int $teamId, int $userId): bool;
}


