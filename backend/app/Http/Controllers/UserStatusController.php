<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Services\UserPresenceService;

class UserStatusController extends Controller
{
    public function __construct(
        private UserPresenceService $presenceService
    ) {}

    /**
     * Get user status by ID
     */
    public function getUserStatus(int $userId): JsonResponse
    {
        try {
            $status = $this->presenceService->getUserStatus($userId);
            
            if (!$status) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get multiple users status
     */
    public function getUsersStatus(Request $request): JsonResponse
    {
        try {
            $userIds = $request->input('user_ids', []);
            
            if (empty($userIds) || !is_array($userIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'user_ids array is required'
                ], 400);
            }

            $statuses = $this->presenceService->getUsersStatus($userIds);
            
            return response()->json([
                'success' => true,
                'data' => $statuses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get users status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user status
     */
    public function getCurrentUserStatus(): JsonResponse
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $status = $this->presenceService->getUserStatus($userId);
            
            return response()->json([
                'success' => true,
                'data' => $status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get current user status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}