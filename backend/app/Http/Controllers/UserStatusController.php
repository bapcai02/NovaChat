<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStatusRequest;
use App\Services\UserStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UserStatusController extends Controller
{
    public function __construct(private UserStatusService $status)
    {
    }

    public function updateStatus(UserStatusRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $data = $request->validated();
        $result = $this->status->updateStatus((int)$user->id, $data);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function startTyping(UserStatusRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $data = $request->validated();
        $result = $this->status->startTyping((int)$user->id, $data['roomId']);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function stopTyping(UserStatusRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $data = $request->validated();
        $result = $this->status->stopTyping((int)$user->id, $data['roomId']);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function getOnlineUsers(): JsonResponse
    {
        $result = $this->status->getOnlineUsers();
        return response()->json($result, $result['success'] ? 200 : 500);
    }
}


