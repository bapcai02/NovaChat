<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Domain\User\Events\UserStatusChanged;
use App\Domain\Message\Events\UserTyping;
use App\Domain\Message\Events\UserStoppedTyping;

class UserStatusController extends Controller
{
    public function updateStatus(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|string|in:online,away,busy,offline',
            'statusMessage' => 'nullable|string|max:100',
            'roomId' => 'required|string'
        ]);

        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            // Update user status in database
            DB::table('users')->where('id', $user->id)->update([
                'is_online' => $data['status'] === 'online',
                'status_message' => $data['statusMessage'] ?? ucfirst($data['status']),
                'last_seen_at' => now(),
                'updated_at' => now()
            ]);

            // Update or create user_statuses record
            DB::table('user_statuses')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'status' => $data['status'],
                    'status_message' => $data['statusMessage'] ?? ucfirst($data['status']),
                    'last_seen_at' => now(),
                    'updated_at' => now()
                ]
            );

            // Broadcast status change
            $payload = [
                'userId' => (string) $user->id,
                'roomId' => $data['roomId'],
                'status' => $data['status'],
                'statusMessage' => $data['statusMessage'] ?? ucfirst($data['status']),
                'userName' => $user->name,
                'userName' => $user->username,
                'timestamp' => now()->toISOString()
            ];

            broadcast(new UserStatusChanged($payload))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $payload
            ]);

        } catch (\Throwable $e) {
            Log::error('UserStatusController@updateStatus failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status'
            ], 500);
        }
    }

    public function startTyping(Request $request): JsonResponse
    {
        $data = $request->validate([
            'roomId' => 'required|string'
        ]);

        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $payload = [
                'roomId' => $data['roomId'],
                'userId' => (string) $user->id,
                'userName' => $user->name,
                'userName' => $user->username,
                'timestamp' => now()->toISOString()
            ];

            broadcast(new UserTyping($payload))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $payload
            ]);

        } catch (\Throwable $e) {
            Log::error('UserStatusController@startTyping failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send typing event'
            ], 500);
        }
    }

    public function stopTyping(Request $request): JsonResponse
    {
        $data = $request->validate([
            'roomId' => 'required|string'
        ]);

        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $payload = [
                'roomId' => $data['roomId'],
                'userId' => (string) $user->id,
                'userName' => $user->name,
                'userName' => $user->username,
                'timestamp' => now()->toISOString()
            ];

            broadcast(new UserStoppedTyping($payload))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $payload
            ]);

        } catch (\Throwable $e) {
            Log::error('UserStatusController@stopTyping failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send stop typing event'
            ], 500);
        }
    }

    public function getOnlineUsers(Request $request): JsonResponse
    {
        try {
            $roomId = $request->query('roomId', '1');
            
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

            return response()->json([
                'success' => true,
                'data' => $onlineUsers
            ]);

        } catch (\Throwable $e) {
            Log::error('UserStatusController@getOnlineUsers failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get online users'
            ], 500);
        }
    }
}
