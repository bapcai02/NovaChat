<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserStatusService
{
    public function __construct(private UserRepositoryInterface $users)
    {
    }

    public function updateStatus(int $userId, array $data): array
    {
        try {
            DB::table('users')->where('id', $userId)->update([
                'is_online' => $data['status'] === 'online',
                'status_message' => $data['statusMessage'] ?? ucfirst($data['status']),
                'last_seen_at' => now(),
                'updated_at' => now()
            ]);
            $payload = [
                'userId' => (string) $userId,
                'roomId' => $data['roomId'] ?? 'global',
                'status' => $data['status'],
                'statusMessage' => $data['statusMessage'] ?? ucfirst($data['status']),
                'timestamp' => now()->toISOString()
            ];
            if (class_exists(\App\Events\UserStatusChanged::class)) {
                broadcast(new \App\Events\UserStatusChanged($payload))->toOthers();
            }
            return ['success' => true, 'data' => $payload];
        } catch (\Throwable $e) {
            Log::error('UserStatusService@updateStatus failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to update status'];
        }
    }

    public function getOnlineUsers(): array
    {
        try {
            $users = DB::table('users')
                ->where('is_online', true)
                ->select('id', 'name', 'username', 'avatar', 'status_message', 'last_seen_at')
                ->get();
            return ['success' => true, 'data' => $users];
        } catch (\Throwable $e) {
            Log::error('UserStatusService@getOnlineUsers failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to get online users'];
        }
    }

    public function startTyping(int $userId, string $roomId): array
    {
        try {
            $user = DB::table('users')->find($userId);
            if (!$user) { return ['success' => false, 'message' => 'User not found']; }
            $payload = [
                'roomId' => $roomId,
                'userId' => (string) $userId,
                'userName' => $user->name,
                'username' => $user->username,
                'timestamp' => now()->toISOString()
            ];
            if (class_exists(\App\Events\UserTyping::class)) {
                broadcast(new \App\Events\UserTyping($payload))->toOthers();
            }
            return ['success' => true, 'data' => $payload];
        } catch (\Throwable $e) {
            Log::error('UserStatusService@startTyping failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to send typing event'];
        }
    }

    public function stopTyping(int $userId, string $roomId): array
    {
        try {
            $user = DB::table('users')->find($userId);
            if (!$user) { return ['success' => false, 'message' => 'User not found']; }
            $payload = [
                'roomId' => $roomId,
                'userId' => (string) $userId,
                'userName' => $user->name,
                'username' => $user->username,
                'timestamp' => now()->toISOString()
            ];
            if (class_exists(\App\Events\UserStoppedTyping::class)) {
                broadcast(new \App\Events\UserStoppedTyping($payload))->toOthers();
            }
            return ['success' => true, 'data' => $payload];
        } catch (\Throwable $e) {
            Log::error('UserStatusService@stopTyping failed: '.$e->getMessage());
            return ['success' => false, 'message' => 'Failed to send stop typing event'];
        }
    }
}


