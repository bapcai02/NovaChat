<?php

namespace App\Http\Controllers;

use App\Services\MessageService;
use App\Http\Requests\MessageRequest;
use App\Http\Requests\MessageReactionRequest;
use App\Http\Requests\EditMessageRequest;
use App\Http\Requests\BookmarkRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    private MessageService $messages;

    public function __construct(MessageService $messages)
    {
        $this->messages = $messages;
    }

    public function index(Request $request, string $roomId): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request, $roomId) {
            $type = $request->query('type', 'channel');
            $limit = (int) $request->query('limit', 50);
            $limit = $limit > 0 && $limit <= 100 ? $limit : 50;
            $beforeId = $request->query('beforeId');
            $userId = Auth::id();
            
            $result = $this->messages->getMessages($roomId, $type, $limit, $beforeId, $userId);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to retrieve messages',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->successResponse($result['data'] ?? null, 'Messages retrieved successfully');
        }, 'Messages retrieved', 'Failed to retrieve messages');
    }

    public function store(MessageRequest $request, string $conversationId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $conversationId, $user) {
            $data = $request->validated();
            $data['conversation_id'] = (int) $conversationId;
            $data['user_id'] = $user->id;
            $result = $this->messages->storeMessage($data);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to send message',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->createdResponse($result['data'] ?? null, $result['message'] ?? 'Message sent successfully');
        }, 'Message sent', 'Failed to send message');
    }

    public function addReaction(MessageReactionRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $messageId, $user) {
            $data = $request->validated();
            $result = $this->messages->addReaction($messageId, (int)$user->id, $data['emoji']);
            
            if (!$result['success']) {
                $code = $result['message'] === 'Message not found' ? 404 : 500;
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to add reaction',
                    $result['errors'] ?? null,
                    $code
                );
            }
            
            return $this->createdResponse($result['data'] ?? null, $result['message'] ?? 'Reaction added successfully');
        }, 'Reaction added', 'Failed to add reaction');
    }

    public function removeReaction(Request $request, string $messageId, string $emoji = null): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        // If emoji is not in URL, get it from request body
        if (!$emoji) {
            $data = $request->json()->all();
            $emoji = $data['emoji'] ?? null;
            
            if (!$emoji) {
                return $this->validationErrorResponse(['emoji' => ['The emoji field is required.']]);
            }
        }

        return $this->executeInTransactionWithResponse(function () use ($messageId, $emoji, $user) {
            $result = $this->messages->removeReaction($messageId, (int)$user->id, $emoji);
            
            if (!$result['success']) {
                $code = in_array($result['message'], ['Message not found', 'Reaction not found']) ? 404 : 500;
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to remove reaction',
                    $result['errors'] ?? null,
                    $code
                );
            }
            
            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Reaction removed successfully');
        }, 'Reaction removed', 'Failed to remove reaction');
    }

    public function edit(EditMessageRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $messageId, $user) {
            $data = $request->validated();
            $result = $this->messages->editMessage($messageId, (int)$user->id, $data['content']);
            
            if (!$result['success']) {
                $code = $result['message'] === 'Message not found' ? 404 : 500;
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to edit message',
                    $result['errors'] ?? null,
                    $code
                );
            }
            
            return $this->updatedResponse($result['data'] ?? null, $result['message'] ?? 'Message edited successfully');
        }, 'Message edited', 'Failed to edit message');
    }

    public function bookmark(BookmarkRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $messageId, $user) {
            $data = $request->validated();
            $result = $this->messages->bookmarkMessage($messageId, (int)$user->id, $data['note'] ?? null, $data['tags'] ?? null);
            
            if (!$result['success']) {
                $code = $result['message'] === 'Message not found' ? 404 : 500;
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to bookmark message',
                    $result['errors'] ?? null,
                    $code
                );
            }
            
            return $this->createdResponse($result['data'] ?? null, $result['message'] ?? 'Message bookmarked successfully');
        }, 'Message bookmarked', 'Failed to bookmark message');
    }

    public function removeBookmark(string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($messageId, $user) {
            $result = $this->messages->removeBookmark($messageId, (int)$user->id);
            
            if (!$result['success']) {
                $code = $result['message'] === 'Bookmark not found' ? 404 : 500;
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to remove bookmark',
                    $result['errors'] ?? null,
                    $code
                );
            }
            
            return $this->successResponse($result['data'] ?? null, $result['message'] ?? 'Bookmark removed successfully');
        }, 'Bookmark removed', 'Failed to remove bookmark');
    }

    public function getBookmarks(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $user) {
            $page = (int) $request->get('page', 1);
            $limit = (int) $request->get('limit', 20);
            $result = $this->messages->getUserBookmarks((int)$user->id, $page, $limit);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to retrieve bookmarks',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->successResponse($result['data'] ?? null, 'Bookmarks retrieved successfully');
        }, 'Bookmarks retrieved', 'Failed to retrieve bookmarks');
    }

    public function isBookmarked(string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($messageId, $user) {
            $isBookmarked = $this->messages->isMessageBookmarked((string)$messageId, (int)$user->id);
            return $this->successResponse(['isBookmarked' => $isBookmarked], 'Bookmark status retrieved successfully');
        }, 'Bookmark status retrieved', 'Failed to check bookmark status');
    }
}


