<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;

class UserService
{
    public function __construct(private UserRepositoryInterface $users)
    {
    }

    public function getAllUsers(int $perPage = 100): array
    {
        return $this->users->paginate($perPage)->items();
    }

    public function getUserById(int $id): ?array
    {
        $user = $this->users->findById($id);
        return $user ? (array) $user : null;
    }
}


