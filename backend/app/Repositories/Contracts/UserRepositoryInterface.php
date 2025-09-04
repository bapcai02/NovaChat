<?php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function findById(int $id);
    public function findByEmail(string $email);
    public function findByUsername(string $username);
    public function create(array $data);
    public function save($user): void;
    public function delete($user): void;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function findByTeam(int $teamId, int $perPage = 15): LengthAwarePaginator;
    public function search(string $query, int $perPage = 15): LengthAwarePaginator;
    public function findOnlineUsers(): array;
    public function findActiveUsers(): array;
    public function updateStatus($user, string $status, ?string $statusMessage = null);
}


