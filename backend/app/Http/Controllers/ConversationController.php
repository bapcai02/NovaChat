<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddMemberRequest;
use App\Http\Requests\ConversationRequest;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    private ConversationService $conversations;

    public function __construct(ConversationService $conversations)
    {
        $this->conversations = $conversations;
    }

    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $conversations = $this->conversations->getUserConversations($user->id);
        return response()->json(['success' => true, 'data' => $conversations]);
    }

    public function store(ConversationRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $data = $request->validated();
        $data['creator_id'] = $user->id;

        $result = $this->conversations->createConversation($data);
        return response()->json($result, $result['success'] ? 201 : 500);
    }

    public function show(Request $request, int $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $conversation = $this->conversations->getConversation($conversationId, $user->id);
        return response()->json($conversation);
    }

    public function getMessages(Request $request, int $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $limit = $request->query('limit', 50);
        $beforeId = $request->query('before_id');

        $messages = $this->conversations->getConversationMessages($conversationId, $user->id, $limit, $beforeId);
        return response()->json($messages);
    }

    public function addMember(AddMemberRequest $request, int $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validated();
        $result = $this->conversations->addMember($conversationId, $validated['user_id'], $user->id);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function removeMember(Request $request, int $conversationId, int $userId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $result = $this->conversations->removeMember($conversationId, $userId, $user->id);
        return response()->json($result, $result['success'] ? 200 : 500);
    }
}