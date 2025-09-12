<?php

namespace App\Http\Controllers;

use App\Http\Requests\ThreadRequest;
use App\Services\ThreadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ThreadController extends Controller
{
    private ThreadService $threads;

    public function __construct(ThreadService $threads)
    {
        $this->threads = $threads;
    }

    public function index(int $messageId): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($messageId) {
            $replies = $this->threads->getReplies($messageId);
            return $this->successResponse($replies, 'Thread replies retrieved successfully');
        }, 'Thread replies retrieved', 'Failed to retrieve thread replies');
    }

    public function store(int $messageId, ThreadRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($messageId, $request, $user) {
            $validated = $request->validated();
            $reply = $this->threads->addReply(
                $messageId,
                (int)$user->id,
                $validated['content'],
                $validated['type'] ?? 'text',
                $validated['metadata'] ?? []
            );
            return $this->createdResponse($reply, 'Reply added successfully');
        }, 'Reply added', 'Failed to add reply');
    }
}


