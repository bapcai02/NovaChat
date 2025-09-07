<?php

namespace App\Http\Controllers;

use App\Models\MessageRead;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UnreadController extends Controller
{
    /**
     * Get unread counts for all conversations for the authenticated user.
     */
    public function getUnreadCounts(): JsonResponse
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        $unreadCounts = MessageRead::getUnreadCountsForUser($userId);

        // Get conversation details
        $conversations = Conversation::whereIn('id', array_keys($unreadCounts))
            ->with(['members', 'channel', 'team'])
            ->get()
            ->keyBy('id');

        $result = [];
        foreach ($unreadCounts as $conversationId => $count) {
            $conversation = $conversations->get($conversationId);
            if ($conversation) {
                $result[] = [
                    'conversation_id' => $conversationId,
                    'unread_count' => $count,
                    'conversation_name' => $conversation->title,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Mark all messages in a conversation as read for the authenticated user.
     */
    public function markConversationAsRead(string $conversationId): JsonResponse
    {
        $userId = Auth::id();

        // Check if user is a member of this conversation
        $isMember = Conversation::where('id', $conversationId)
            ->whereHas('members', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->exists();

        if (!$isMember) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a member of this conversation'
            ], 403);
        }

        // Mark all messages as read
        MessageRead::markConversationAsRead((int)$conversationId, $userId);

        return response()->json([
            'success' => true,
            'message' => 'Conversation marked as read'
        ]);
    }

    /**
     * Get unread count for a specific conversation.
     */
    public function getConversationUnreadCount(string $conversationId): JsonResponse
    {
        $userId = Auth::id();

        // Check if user is a member of this conversation
        $isMember = Conversation::where('id', $conversationId)
            ->whereHas('members', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->exists();

        if (!$isMember) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a member of this conversation'
            ], 403);
        }

        $unreadCount = MessageRead::getUnreadCount((int)$conversationId, $userId);

        return response()->json([
            'success' => true,
            'data' => [
                'conversation_id' => $conversationId,
                'unread_count' => $unreadCount
            ]
        ]);
    }
}
