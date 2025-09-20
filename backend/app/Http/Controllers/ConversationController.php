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
        if (! $user) {
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
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        \Log::info('ConversationController@store called', [
            'user_id' => $user->id,
            'request_data' => $request->all(),
        ]);

        return $this->executeInTransactionWithResponse(function () use ($request, $user) {
            $data = $request->validated();
            $data['creator_id'] = $user->id;

            \Log::info('Creating conversation with data:', $data);

            $result = $this->conversations->createConversation($data);

            if (! $result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to create conversation',
                    $result['errors'] ?? null,
                    500
                );
            }

            return $this->createdResponse($result['data'] ?? null, $result['message'] ?? 'Conversation created successfully');
        }, 'Conversation created', 'Failed to create conversation');
    }

    public function show(Request $request, string $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $user) {
            $conversation = $this->conversations->getConversation($conversationId, $user->id);

            if (! $conversation['success']) {
                return $this->errorResponse(
                    $conversation['message'] ?? 'Conversation not found',
                    null,
                    $conversation['code'] ?? 404
                );
            }

            return $this->successResponse($conversation['data'] ?? null, 'Conversation retrieved successfully');
        }, 'Conversation retrieved', 'Failed to retrieve conversation');
    }

    public function getMessages(Request $request, $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $conversationId, $user) {
            $conversationId = (int) $conversationId;
            $limit = $request->query('limit', $request->query('per_page', 50));
            $beforeId = $request->query('before_id');

            $messages = $this->conversations->getConversationMessages($conversationId, $user->id, $limit, $beforeId);

            if (! $messages['success']) {
                return $this->errorResponse(
                    $messages['message'] ?? 'Failed to retrieve messages',
                    null,
                    $messages['code'] ?? 500
                );
            }

            return $this->successResponse($messages['data'] ?? null, 'Messages retrieved successfully');
        }, 'Messages retrieved', 'Failed to retrieve messages');
    }

    public function getMembers(string $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $user) {
            $result = $this->conversations->getMembers($conversationId, $user->id);

            if (! $result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to get members',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }

            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Members retrieved successfully');
        }, 'Members retrieved', 'Failed to get members');
    }

    public function addMember(AddMemberRequest $request, string $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $conversationId, $user) {
            $validated = $request->validated();
            $result = $this->conversations->addMember($conversationId, $validated['user_id'], $user->id);

            if (! $result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to add member',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }

            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Member added successfully');
        }, 'Member added', 'Failed to add member');
    }

    public function removeMember(Request $request, string $conversationId, string $userId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $userId, $user) {
            $result = $this->conversations->removeMember($conversationId, $userId, $user->id);

            if (! $result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to remove member',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }

            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Member removed successfully');
        }, 'Member removed', 'Failed to remove member');
    }

    public function pinConversation(string $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $user) {
            $result = $this->conversations->pinConversation($conversationId, $user->id);

            if (! $result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to pin conversation',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }

            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Conversation pinned successfully');
        }, 'Conversation pinned', 'Failed to pin conversation');
    }

    public function unpinConversation(string $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $user) {
            $result = $this->conversations->unpinConversation($conversationId, $user->id);

            if (! $result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to unpin conversation',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }

            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Conversation unpinned successfully');
        }, 'Conversation unpinned', 'Failed to unpin conversation');
    }

    public function muteConversation(string $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $user) {
            $result = $this->conversations->muteConversation($conversationId, $user->id);
            if (! $result['success']) {
                return $this->errorResponse($result['message'] ?? 'Failed to mute conversation');
            }

            return $this->successResponse(null, 'Conversation muted');
        }, 'Conversation muted', 'Failed to mute conversation');
    }

    public function unmuteConversation(string $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($conversationId, $user) {
            $result = $this->conversations->unmuteConversation($conversationId, $user->id);
            if (! $result['success']) {
                return $this->errorResponse($result['message'] ?? 'Failed to unmute conversation');
            }

            return $this->successResponse(null, 'Conversation unmuted');
        }, 'Conversation unmuted', 'Failed to unmute conversation');
    }

    public function getMentions(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        $page = (int) $request->query('page', 1);
        $limit = (int) $request->query('limit', 20);

        $result = $this->conversations->getMentions($user->id, $page, $limit);
        if (! $result['success']) {
            return $this->errorResponse($result['message'] ?? 'Failed to load mentions');
        }

        return $this->successResponse([
            'items' => $result['data'] ?? [],
            'pagination' => $result['pagination'] ?? null,
        ], 'Mentions loaded');
    }

    public function getMentionsCount(): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }
        $result = $this->conversations->getMentions($user->id, 1, 1);
        $total = $result['pagination']['total'] ?? 0;

        return $this->successResponse(['count' => (int) $total], 'Mentions count');
    }
}
