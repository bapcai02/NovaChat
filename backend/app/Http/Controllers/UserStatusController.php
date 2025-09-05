<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStatusRequest;
use App\Services\UserStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UserStatusController extends Controller
{
    private UserStatusService $status;

    public function __construct(UserStatusService $status)
    {
        $this->status = $status;
    }

    public function updateStatus(UserStatusRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthorized');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $user) {
            $data = $request->validated();
            $result = $this->status->updateStatus((int)$user->id, $data);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to update status',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->updatedResponse($result['data'] ?? null, $result['message'] ?? 'Status updated successfully');
        }, 'Status updated', 'Failed to update status');
    }

    public function startTyping(UserStatusRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthorized');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $user) {
            $data = $request->validated();
            $result = $this->status->startTyping((int)$user->id, $data['roomId']);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to start typing',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Typing started successfully');
        }, 'Typing started', 'Failed to start typing');
    }

    public function stopTyping(UserStatusRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthorized');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $user) {
            $data = $request->validated();
            $result = $this->status->stopTyping((int)$user->id, $data['roomId']);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to stop typing',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Typing stopped successfully');
        }, 'Typing stopped', 'Failed to stop typing');
    }

    public function getOnlineUsers(): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () {
            $result = $this->status->getOnlineUsers();
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to retrieve online users',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->successResponse($result['data'] ?? null, 'Online users retrieved successfully');
        }, 'Online users retrieved', 'Failed to retrieve online users');
    }
}


