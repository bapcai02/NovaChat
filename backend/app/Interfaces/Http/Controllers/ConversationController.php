<?php

namespace App\Interfaces\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Application\Services\ConversationApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    private ConversationApplicationService $conversationApp;

    public function __construct(ConversationApplicationService $conversationApp)
    {
        $this->conversationApp = $conversationApp;
    }

    public function index(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $conversations = $this->conversationApp->getUserConversations($user->id);

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    public function messages(int $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $messages = $this->conversationApp->getConversationMessages($user->id, $conversationId);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }
}


