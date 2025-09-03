<?php

namespace App\Interfaces\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Application\Services\UserStatusApplicationService;
use App\Http\Controllers\Controller;
use App\Interfaces\Request\UserStatusRequest;

class UserStatusController extends Controller
{
    private UserStatusApplicationService $userStatusService;

    public function __construct(UserStatusApplicationService $userStatusService)
    {
        $this->userStatusService = $userStatusService;
    }

    public function updateStatus(UserStatusRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $result = $this->userStatusService->updateStatus($user->id, $data);

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 500);
        }
    }

    public function startTyping(UserStatusRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $result = $this->userStatusService->startTyping($user->id, $data['roomId']);

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 500);
        }
    }

    public function stopTyping(UserStatusRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $result = $this->userStatusService->stopTyping($user->id, $data['roomId']);

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 500);
        }
    }

    public function getOnlineUsers(Request $request): JsonResponse
    {
        $result = $this->userStatusService->getOnlineUsers();

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 500);
        }
    }
}
