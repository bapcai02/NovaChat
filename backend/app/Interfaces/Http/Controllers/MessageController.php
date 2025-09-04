<?php

namespace App\Interfaces\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Application\Services\MessageApplicationService;
use App\Http\Controllers\Controller;
use App\Interfaces\Request\MessageRequest;
use App\Interfaces\Request\MessageReactionRequest;
use App\Interfaces\Request\EditMessageRequest;
use App\Interfaces\Request\BookmarkRequest;

class MessageController extends Controller
{
    private MessageApplicationService $messageService;

    public function __construct(MessageApplicationService $messageService)
    {
        $this->messageService = $messageService;
    }

    public function index(Request $request, string $roomId): JsonResponse
    {
        $type = $request->query('type', 'channel');
        $limit = (int) $request->query('limit', 50);
        $limit = $limit > 0 && $limit <= 100 ? $limit : 50;
        $beforeId = $request->query('beforeId');
        
        // Get current user ID for bookmark status
        $user = Auth::user();
        $userId = $user ? $user->id : null;

        $result = $this->messageService->getMessages($roomId, $type, $limit, $beforeId, $userId);

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 500);
        }
    }

    public function store(MessageRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = $this->messageService->storeMessage($data);

        if ($result['success']) {
            return response()->json($result, 201);
        } else {
            return response()->json($result, 500);
        }
    }

    public function addReaction(MessageReactionRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $data = $request->validated();

        $result = $this->messageService->addReaction($messageId, $user->id, $data['emoji']);

        if ($result['success']) {
            return response()->json($result, 201);
        } else {
            $statusCode = $result['message'] === 'Message not found' ? 404 : 500;
            return response()->json($result, $statusCode);
        }
    }

    public function removeReaction(Request $request, string $messageId, string $emoji): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $result = $this->messageService->removeReaction($messageId, $user->id, $emoji);

        if ($result['success']) {
            return response()->json($result);
        } else {
            $statusCode = $result['message'] === 'Message not found' || $result['message'] === 'Reaction not found' ? 404 : 500;
            return response()->json($result, $statusCode);
        }
    }

    public function edit(EditMessageRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $data = $request->validated();
        $result = $this->messageService->editMessage($messageId, $user->id, $data['content']);

        if ($result['success']) {
            return response()->json($result);
        } else {
            $statusCode = $result['message'] === 'Message not found' ? 404 : 500;
            return response()->json($result, $statusCode);
        }
    }

    public function bookmark(BookmarkRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $data = $request->validated();
        $result = $this->messageService->bookmarkMessage($messageId, $user->id, $data['note'] ?? null, $data['tags'] ?? null);

        if ($result['success']) {
            return response()->json($result, 201);
        } else {
            $statusCode = $result['message'] === 'Message not found' ? 404 : 500;
            return response()->json($result, $statusCode);
        }
    }

    public function removeBookmark(string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $result = $this->messageService->removeBookmark($messageId, $user->id);

        if ($result['success']) {
            return response()->json($result);
        } else {
            $statusCode = $result['message'] === 'Bookmark not found' ? 404 : 500;
            return response()->json($result, $statusCode);
        }
    }

    public function getBookmarks(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $page = (int) $request->get('page', 1);
        $limit = (int) $request->get('limit', 20);

        $result = $this->messageService->getUserBookmarks($user->id, $page, $limit);

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 500);
        }
    }

    public function isBookmarked(string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $isBookmarked = $this->messageService->isMessageBookmarked($messageId, $user->id);

        return response()->json([
            'success' => true,
            'data' => ['isBookmarked' => $isBookmarked]
        ]);
    }
}
