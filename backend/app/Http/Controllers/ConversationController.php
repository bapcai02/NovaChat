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
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($user) {
            $conversations = $this->conversations->getUserConversations($user->id);
            return $this->successResponse($conversations, 'Conversations retrieved successfully');
        }, 'Conversations retrieved', 'Failed to retrieve conversations');
    }

    public function store(ConversationRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $user) {
            $data = $request->validated();
            $data['creator_id'] = $user->id;

            $result = $this->conversations->createConversation($data);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to create conversation',
                    $result['errors'] ?? null,
                    500
                );
            }
            
            return $this->createdResponse($result['data'] ?? null, $result['message'] ?? 'Conversation created successfully');
        }, 'Conversation created', 'Failed to create conversation');
    }

    public function show(Request $request, int $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $user) {
            $conversation = $this->conversations->getConversation($conversationId, $user->id);
            
            if (!$conversation['success']) {
                return $this->errorResponse(
                    $conversation['message'] ?? 'Conversation not found',
                    null,
                    $conversation['code'] ?? 404
                );
            }
            
            return $this->successResponse($conversation['data'] ?? null, 'Conversation retrieved successfully');
        }, 'Conversation retrieved', 'Failed to retrieve conversation');
    }

    public function getMessages(Request $request, int $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $conversationId, $user) {
            $limit = $request->query('limit', 50);
            $beforeId = $request->query('before_id');

            $messages = $this->conversations->getConversationMessages($conversationId, $user->id, $limit, $beforeId);
            
            if (!$messages['success']) {
                return $this->errorResponse(
                    $messages['message'] ?? 'Failed to retrieve messages',
                    null,
                    $messages['code'] ?? 500
                );
            }
            
            return $this->successResponse($messages['data'] ?? null, 'Messages retrieved successfully');
        }, 'Messages retrieved', 'Failed to retrieve messages');
    }

    public function addMember(AddMemberRequest $request, int $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $conversationId, $user) {
            $validated = $request->validated();
            $result = $this->conversations->addMember($conversationId, $validated['user_id'], $user->id);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to add member',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Member added successfully');
        }, 'Member added', 'Failed to add member');
    }

    public function removeMember(Request $request, int $conversationId, int $userId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $userId, $user) {
            $result = $this->conversations->removeMember($conversationId, $userId, $user->id);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to remove member',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Member removed successfully');
        }, 'Member removed', 'Failed to remove member');
    }
}