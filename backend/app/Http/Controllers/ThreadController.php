<?php

namespace App\Http\Controllers;

use App\Services\ThreadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ThreadController extends Controller
{
    public function __construct(private ThreadService $threads)
    {
    }

    public function index(int $messageId): JsonResponse
    {
        $replies = $this->threads->getReplies($messageId);
        return response()->json(['success' => true, 'data' => $replies]);
    }

    public function store(int $messageId, Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $validated = $request->validate([
            'content' => 'required|string',
            'type' => 'nullable|string|in:text,voice,image,file',
            'metadata' => 'array'
        ]);
        $reply = $this->threads->addReply(
            $messageId,
            (int)$user->id,
            $validated['content'],
            $validated['type'] ?? 'text',
            $validated['metadata'] ?? []
        );
        return response()->json(['success' => true, 'data' => $reply], 201);
    }
}


