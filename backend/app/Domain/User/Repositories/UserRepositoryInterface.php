<?php

namespace App\Domain\User\Repositories;

use App\Domain\User\Entities\UserDDD;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function findById(int $id): ?UserDDD;
    public function findByEmail(string $email): ?UserDDD;
    public function findByUsername(string $username): ?UserDDD;
    public function save(UserDDD $user): void;
    public function delete(UserDDD $user): void;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function findByTeam(int $teamId, int $perPage = 15): LengthAwarePaginator;
    public function search(string $query, int $perPage = 15): LengthAwarePaginator;
    public function findOnlineUsers(): array;
    public function findActiveUsers(): array;
    public function updateStatus(UserDDD $user, string $status, ?string $statusMessage = null): UserDDD;
}
