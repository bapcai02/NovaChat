<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Message\Entities\Message;
use App\Domain\Message\Services\MessageService;
use App\Domain\Channel\Services\ChannelService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    protected MessageService $messageService;
    protected ChannelService $channelService;

    public function __construct(MessageService $messageService, ChannelService $channelService)
    {
        $this->messageService = $messageService;
        $this->channelService = $channelService;
    }

    /**
     * Get messages for a channel
     */
    public function index(Request $request, string $channelId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'integer|min:1',
                'limit' => 'integer|min:1|max:100',
                'before' => 'date',
                'after' => 'date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 50);
            $before = $request->input('before');
            $after = $request->input('after');

            // Check if user has access to this channel
            $channel = $this->channelService->getChannelWithMembers($channelId, $user->id);
            
            if (!$channel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Channel not found or access denied'
                ], 404);
            }

            $messages = $this->messageService->getMessagesForChannel(
                $channelId, 
                $user->id, 
                $page, 
                $limit, 
                $before, 
                $after
            );

            return response()->json([
                'success' => true,
                'data' => $messages,
                'message' => 'Messages retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new message
     */
    public function store(Request $request, string $channelId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:4000',
                'type' => 'in:text,file,voice,image',
                'attachments' => 'array',
                'attachments.*.type' => 'required|in:file,image,voice',
                'attachments.*.url' => 'required|url',
                'attachments.*.name' => 'required|string',
                'attachments.*.size' => 'integer',
                'reply_to' => 'exists:messages,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Check if user has access to this channel
            $channel = $this->channelService->getChannelWithMembers($channelId, $user->id);
            
            if (!$channel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Channel not found or access denied'
                ], 404);
            }

            $messageData = $request->only(['content', 'type', 'attachments', 'reply_to']);
            $messageData['channel_id'] = $channelId;
            $messageData['user_id'] = $user->id;

            $message = $this->messageService->createMessage($messageData);

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create message'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Message sent successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific message
     */
    public function show(string $channelId, string $messageId): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user has access to this channel
            $channel = $this->channelService->getChannelWithMembers($channelId, $user->id);
            
            if (!$channel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Channel not found or access denied'
                ], 404);
            }

            $message = $this->messageService->getMessage($messageId, $channelId, $user->id);

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Message retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a message
     */
    public function update(Request $request, string $channelId, string $messageId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:4000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $content = $request->input('content');

            $message = $this->messageService->updateMessage($messageId, $channelId, $user->id, $content);

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message not found or access denied'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Message updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a message
     */
    public function destroy(string $channelId, string $messageId): JsonResponse
    {
        try {
            $user = Auth::user();

            $deleted = $this->messageService->deleteMessage($messageId, $channelId, $user->id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message not found or access denied'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add reaction to message
     */
    public function addReaction(Request $request, string $channelId, string $messageId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'emoji' => 'required|string|max:10'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $emoji = $request->input('emoji');

            $reaction = $this->messageService->addReaction($messageId, $channelId, $user->id, $emoji);

            if (!$reaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to add reaction'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $reaction,
                'message' => 'Reaction added successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add reaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove reaction from message
     */
    public function removeReaction(Request $request, string $channelId, string $messageId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'emoji' => 'required|string|max:10'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $emoji = $request->input('emoji');

            $removed = $this->messageService->removeReaction($messageId, $channelId, $user->id, $emoji);

            if (!$removed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to remove reaction'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Reaction removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove reaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark message as read
     */
    public function markAsRead(string $channelId, string $messageId): JsonResponse
    {
        try {
            $user = Auth::user();

            $marked = $this->messageService->markAsRead($messageId, $channelId, $user->id);

            if (!$marked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to mark message as read'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Message marked as read'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark message as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
