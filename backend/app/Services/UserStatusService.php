<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;

class UserStatusService
{
    private UserRepositoryInterface $users;

    public function __construct(UserRepositoryInterface $users)
    {
        $this->users = $users;
    }

    public function updateStatus(int $userId, array $data): array
    {
        $this->users->update($userId, [
            'is_online' => $data['status'] === 'online',
            'status_message' => $data['statusMessage'] ?? ucfirst($data['status']),
            'last_seen_at' => now(),
        ]);

        $payload = [
            'userId' => (string) $userId,
            'roomId' => $data['roomId'] ?? 'global',
            'status' => $data['status'],
            'statusMessage' => $data['statusMessage'] ?? ucfirst($data['status']),
            'timestamp' => now()->toISOString(),
        ];

        return ['success' => true, 'data' => $payload];
    }

    public function getOnlineUsers(): array
    {
        $users = $this->users->getOnlineUsers();

        return ['success' => true, 'data' => $users];
    }

    public function startTyping(int $userId, string $roomId): array
    {
        $user = $this->users->findById($userId);
        if (! $user) {
            return ['success' => false, 'message' => 'User not found'];
        }

        $payload = [
            'roomId' => $roomId,
            'userId' => (string) $userId,
            'userName' => $user->name,
            'username' => $user->username,
            'timestamp' => now()->toISOString(),
        ];

        // Realtime is handled by WS; skip Laravel broadcast

        return ['success' => true, 'data' => $payload];
    }

    public function stopTyping(int $userId, string $roomId): array
    {
        $user = $this->users->findById($userId);
        if (! $user) {
            return ['success' => false, 'message' => 'User not found'];
        }

        $payload = [
            'roomId' => $roomId,
            'userId' => (string) $userId,
            'userName' => $user->name,
            'username' => $user->username,
            'timestamp' => now()->toISOString(),
        ];

        // Realtime is handled by WS; skip Laravel broadcast

        return ['success' => true, 'data' => $payload];
    }
}
