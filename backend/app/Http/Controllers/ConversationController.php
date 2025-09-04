<?php

namespace App\Http\Controllers;

use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    public function __construct(private ConversationService $conversations)
    {
    }

    public function index(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $data = $this->conversations->getUserConversations((int)$user->id);
        return response()->json(['success' => true, 'data' => $data]);
    }
}


