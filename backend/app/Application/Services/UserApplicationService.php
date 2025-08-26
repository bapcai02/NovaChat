<?php

namespace App\Application\Services;

use App\Domain\User\Repositories\UserRepositoryInterface;

class UserApplicationService
{
    private UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAllUsers(): array
    {
        $users = $this->userRepository->paginate(100)->items();
        return array_map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'status' => $user->status,
                'is_online' => $user->is_online,
                'last_seen_at' => $user->last_seen_at ? $user->last_seen_at->toISOString() : null,
            ];
        }, $users);
    }

    public function getUserById(int $id): ?array
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'status' => $user->status,
            'is_online' => $user->is_online,
            'last_seen_at' => $user->last_seen_at ? $user->last_seen_at->toISOString() : null,
        ];
    }
}
