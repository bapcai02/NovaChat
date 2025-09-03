<?php

namespace App\Application\Services;

use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Domain\User\Events\UserStatusChanged;
use App\Domain\Message\Events\UserTyping;
use App\Domain\Message\Events\UserStoppedTyping;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserStatusApplicationService
{
    private UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Update user status
     */
    public function updateStatus(int $userId, array $data): array
    {
        try {
            // Update user status in database
            DB::table('users')->where('id', $userId)->update([
                'is_online' => $data['status'] === 'online',
                'status_message' => $data['statusMessage'] ?? ucfirst($data['status']),
                'last_seen_at' => now(),
                'updated_at' => now()
            ]);

            // Update or create user_statuses record
            DB::table('user_statuses')->updateOrInsert(
                ['user_id' => $userId],
                [
                    'status' => $data['status'],
                    'status_message' => $data['statusMessage'] ?? ucfirst($data['status']),
                    'last_seen_at' => now(),
                    'updated_at' => now()
                ]
            );

            // Get user info for broadcast
            $user = $this->userRepository->findById($userId);
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }

            // Broadcast status change
            $payload = [
                'userId' => (string) $userId,
                'roomId' => $data['roomId'],
                'status' => $data['status'],
                'statusMessage' => $data['statusMessage'] ?? ucfirst($data['status']),
                'userName' => $user->getName(),
                'username' => $user->getUsername(),
                'timestamp' => now()->toISOString()
            ];

            broadcast(new UserStatusChanged($payload))->toOthers();

            return [
                'success' => true,
                'data' => $payload
            ];

        } catch (\Throwable $e) {
            Log::error('UserStatusApplicationService@updateStatus failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to update status'
            ];
        }
    }

    /**
     * Start typing indicator
     */
    public function startTyping(int $userId, string $roomId): array
    {
        try {
            $user = $this->userRepository->findById($userId);
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }

            $payload = [
                'roomId' => $roomId,
                'userId' => (string) $userId,
                'userName' => $user->getName(),
                'username' => $user->getUsername(),
                'timestamp' => now()->toISOString()
            ];

            broadcast(new UserTyping($payload))->toOthers();

            return [
                'success' => true,
                'data' => $payload
            ];

        } catch (\Throwable $e) {
            Log::error('UserStatusApplicationService@startTyping failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send typing event'
            ];
        }
    }

    /**
     * Stop typing indicator
     */
    public function stopTyping(int $userId, string $roomId): array
    {
        try {
            $user = $this->userRepository->findById($userId);
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }

            $payload = [
                'roomId' => $roomId,
                'userId' => (string) $userId,
                'userName' => $user->getName(),
                'username' => $user->getUsername(),
                'timestamp' => now()->toISOString()
            ];

            broadcast(new UserStoppedTyping($payload))->toOthers();

            return [
                'success' => true,
                'data' => $payload
            ];

        } catch (\Throwable $e) {
            Log::error('UserStatusApplicationService@stopTyping failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send stop typing event'
            ];
        }
    }

    /**
     * Get online users
     */
    public function getOnlineUsers(): array
    {
        try {
            // Get online users from database
            $onlineUsers = DB::table('users')
                ->where('is_online', true)
                ->select('id', 'name', 'username', 'avatar', 'status_message', 'last_seen_at')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => (string) $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'avatar' => $user->avatar,
                        'status' => 'online',
                        'statusMessage' => $user->status_message,
                        'lastSeenAt' => $user->last_seen_at
                    ];
                });

            return [
                'success' => true,
                'data' => $onlineUsers
            ];

        } catch (\Throwable $e) {
            Log::error('UserStatusApplicationService@getOnlineUsers failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to get online users'
            ];
        }
    }
}
