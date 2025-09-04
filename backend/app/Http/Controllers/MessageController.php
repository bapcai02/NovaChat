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
    public function __construct(private MessageService $messages)
    {
    }

    public function index(Request $request, string $roomId): JsonResponse
    {
        $type = $request->query('type', 'channel');
        $limit = (int) $request->query('limit', 50);
        $limit = $limit > 0 && $limit <= 100 ? $limit : 50;
        $beforeId = $request->query('beforeId');
        $userId = Auth::id();
        $result = $this->messages->getMessages($roomId, $type, $limit, $beforeId, $userId);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function store(MessageRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $data = $request->validated();
        $result = $this->messages->storeMessage($data);
        return response()->json($result, $result['success'] ? 201 : 500);
    }

    public function addReaction(MessageReactionRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $data = $request->validated();
        $result = $this->messages->addReaction($messageId, (int)$user->id, $data['emoji']);
        return response()->json($result, $result['success'] ? 201 : ($result['message'] === 'Message not found' ? 404 : 500));
    }

    public function removeReaction(Request $request, string $messageId, string $emoji): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $result = $this->messages->removeReaction($messageId, (int)$user->id, $emoji);
        return response()->json($result, $result['success'] ? 200 : ($result['message'] === 'Message not found' || $result['message'] === 'Reaction not found' ? 404 : 500));
    }

    public function edit(EditMessageRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $data = $request->validated();
        $result = $this->messages->editMessage($messageId, (int)$user->id, $data['content']);
        return response()->json($result, $result['success'] ? 200 : ($result['message'] === 'Message not found' ? 404 : 500));
    }

    public function bookmark(BookmarkRequest $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $data = $request->validated();
        $result = $this->messages->bookmarkMessage($messageId, (int)$user->id, $data['note'] ?? null, $data['tags'] ?? null);
        return response()->json($result, $result['success'] ? 201 : ($result['message'] === 'Message not found' ? 404 : 500));
    }

    public function removeBookmark(string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $result = $this->messages->removeBookmark($messageId, (int)$user->id);
        return response()->json($result, $result['success'] ? 200 : ($result['message'] === 'Bookmark not found' ? 404 : 500));
    }

    public function getBookmarks(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $page = (int) $request->get('page', 1);
        $limit = (int) $request->get('limit', 20);
        $result = $this->messages->getUserBookmarks((int)$user->id, $page, $limit);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function isBookmarked(string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $isBookmarked = $this->messages->isMessageBookmarked((string)$messageId, (int)$user->id);
        return response()->json(['success' => true, 'data' => ['isBookmarked' => $isBookmarked]]);
    }
}


