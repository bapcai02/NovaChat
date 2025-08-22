<?php

namespace App\Domain\User\Repositories;

use App\Domain\User\Entities\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function findByUsername(string $username): ?User;
    public function save(User $user): void;
    public function delete(User $user): void;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function findByTeam(int $teamId, int $perPage = 15): LengthAwarePaginator;
    public function search(string $query, int $perPage = 15): LengthAwarePaginator;
    public function findOnlineUsers(): array;
    public function findActiveUsers(): array;
}
