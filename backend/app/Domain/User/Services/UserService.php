<?php

namespace App\Domain\User\Services;

use App\Domain\User\Entities\User;
use App\Domain\User\Repositories\UserRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserService
{
    protected UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Get all users
     */
    public function getAllUsers(): Collection
    {
        return collect($this->userRepository->findOnlineUsers());
    }

    /**
     * Get user by ID
     */
    public function getUserById(int $userId): ?User
    {
        return $this->userRepository->findById($userId);
    }

    /**
     * Get users by IDs
     */
    public function getUsersByIds(array $userIds): Collection
    {
        return collect($this->userRepository->findOnlineUsers());
    }

    /**
     * Search users
     */
    public function searchUsers(string $query): Collection
    {
        $paginator = $this->userRepository->search($query, 100);
        return collect($paginator->items());
    }

    /**
     * Get online users
     */
    public function getOnlineUsers(): Collection
    {
        return collect($this->userRepository->findOnlineUsers());
    }

    /**
     * Update user status
     */
    public function updateUserStatus(int $userId, string $status): bool
    {
        try {
            $user = $this->userRepository->findById($userId);
            if ($user) {
                $this->userRepository->updateStatus($user, $status);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to update user status: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update user last seen
     */
    public function updateLastSeen(int $userId): bool
    {
        try {
            $user = $this->userRepository->findById($userId);
            if ($user) {
                $this->userRepository->updateStatus($user, $user->status);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to update user last seen: ' . $e->getMessage());
            return false;
        }
    }
}
