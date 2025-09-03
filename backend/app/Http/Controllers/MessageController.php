<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use App\Domain\Message\Events\ChatMessageSent;
use App\Domain\Message\Events\MessageReactionAdded;
use App\Domain\Message\Events\MessageReactionRemoved;

class MessageController extends Controller
{
    public function index(Request $request, string $roomId): JsonResponse
    {
        try {
            $type = $request->query('type', 'channel');
            $limit = (int) $request->query('limit', 50);
            $limit = $limit > 0 && $limit <= 100 ? $limit : 50;
            $beforeId = $request->query('beforeId');

            $query = DB::table('messages');

            if ($type === 'direct') {
                // If schema has conversation_id, use it; else fallback to channel_id for legacy
                if (Schema::hasColumn('messages', 'conversation_id')) {
                    $query->where('conversation_id', $roomId);
                } else {
                    $query->where('channel_id', $roomId);
                }
            } else {
                $query->where('channel_id', $roomId);
            }

            if ($beforeId) {
                $query->where('id', '<', (int) $beforeId);
            }

            // Fetch newest first for efficiency, then reverse to chronological order for UI
            $rows = $query
                ->orderBy('id', 'desc')
                ->limit($limit)
                ->get();

            $hasMore = $rows->count() === $limit;

            $messages = $rows
                ->reverse() // chronological order ascending
                ->map(function ($message) {
                    // Get reactions for this message
                    $reactions = DB::table('message_reactions')
                        ->where('message_id', $message->id)
                        ->select('emoji', DB::raw('COUNT(*) as count'))
                        ->groupBy('emoji')
                        ->get()
                        ->map(function ($reaction) {
                            return [
                                'emoji' => $reaction->emoji,
                                'count' => (int) $reaction->count,
                                'users' => []
                            ];
                        })
                        ->toArray();

                    return [
                        'id' => $message->id,
                        'room_id' => $message->channel_id ?? $message->conversation_id ?? null,
                        'sender' => [
                            'id' => $message->user_id,
                            'name' => 'User ' . $message->user_id, // TODO: Join with users table
                            'username' => 'user' . $message->user_id,
                        ],
                        'content' => $message->content,
                        'type' => $message->type ?? 'text',
                        'created_at' => $message->created_at,
                        'is_edited' => (bool) $message->is_edited,
                        'is_pinned' => (bool) $message->is_pinned,
                        'attachments' => [],
                        'reactions' => $reactions,
                        'read_by' => [],
                    ];
                })
                ->values();

            return response()->json([
                'success' => true,
                'data' => $messages,
                'meta' => [
                    'hasMore' => $hasMore,
                    'nextBeforeId' => $rows->count() > 0 ? $rows->last()->id : null,
                    'count' => $messages->count(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('MessageController@index failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load messages',
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        Log::info('MessageController@store called with data:', $request->all());
        
        $data = $request->validate([
            'type' => 'nullable|string|in:channel,direct',
            'roomId' => 'required|string',
            'senderId' => 'required|string',
            'content' => 'required|string',
        ]);

        Log::info('MessageController@store validation passed:', $data);

        try {
            $createdAt = Carbon::now()->format('Y-m-d H:i:s');
            $type = $data['type'] ?? 'channel';
            Log::info('MessageController@store inserting message to database:', [
                'roomType' => $type,
                'roomId' => $data['roomId'],
                'user_id' => $data['senderId'],
                'content' => $data['content'],
                'created_at' => $createdAt
            ]);
            
            $insert = [
                'user_id' => $data['senderId'],
                'content' => $data['content'],
                'type' => 'text',
                'metadata' => '[]',
                'is_edited' => false,
                'is_pinned' => false,
                'is_deleted' => false,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
            if ($type === 'direct') {
                if (Schema::hasColumn('messages', 'conversation_id')) {
                    $insert['conversation_id'] = $data['roomId'];
                } else {
                    $insert['channel_id'] = $data['roomId'];
                }
            } else {
                $insert['channel_id'] = $data['roomId'];
            }

            $messageId = (string) DB::table('messages')->insertGetId($insert);

            Log::info('MessageController@store message saved successfully with ID:', ['messageId' => $messageId]);

            $payload = [
                'roomType' => $type,
                'roomId' => (string) $data['roomId'],
                'messageId' => (string) $messageId,
                'senderId' => (string) $data['senderId'],
                'content' => (string) $data['content'],
                'createdAt' => (string) $createdAt,
            ];

            Log::info('MessageController@store broadcasting event with payload:', $payload);
            broadcast(new ChatMessageSent($payload))->toOthers();
            Log::info('MessageController@store broadcast event sent successfully');

            Log::info('MessageController@store returning success response');
            return response()->json([
                'success' => true,
                'data' => $payload,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('MessageController@store failed: ' . $e->getMessage(), [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
            ], 500);
        }
    }

    public function addReaction(Request $request, string $messageId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'emoji' => 'required|string|max:10',
        ]);

        try {
            // Get message info to determine room type and ID
            $message = DB::table('messages')->find($messageId);
            if (!$message) {
                return response()->json(['success' => false, 'message' => 'Message not found'], 404);
            }

            // Check if conversation_id exists and is not null
            $hasConversationId = property_exists($message, 'conversation_id') && !is_null($message->conversation_id);
            $roomType = $hasConversationId ? 'direct' : 'channel';
            $roomId = $hasConversationId ? $message->conversation_id : $message->channel_id;

            // Check if reaction already exists
            $existingReaction = DB::table('message_reactions')
                ->where('message_id', $messageId)
                ->where('user_id', $user->id)
                ->where('emoji', $data['emoji'])
                ->first();

            if ($existingReaction) {
                return response()->json([
                    'success' => true,
                    'message' => 'Reaction already exists',
                    'data' => $existingReaction
                ]);
            }

            // Add new reaction
            $reactionId = DB::table('message_reactions')->insertGetId([
                'message_id' => $messageId,
                'user_id' => $user->id,
                'emoji' => $data['emoji'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $reaction = DB::table('message_reactions')->find($reactionId);

            // Broadcast reaction added event
            $payload = [
                'roomType' => $roomType,
                'roomId' => (string) $roomId,
                'messageId' => (string) $messageId,
                'userId' => (string) $user->id,
                'emoji' => $data['emoji'],
                'reactionId' => (string) $reactionId,
                'createdAt' => now()->toISOString(),
            ];

            broadcast(new MessageReactionAdded($payload))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Reaction added successfully',
                'data' => $reaction
            ], 201);

        } catch (\Throwable $e) {
            Log::error('MessageController@addReaction failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add reaction',
            ], 500);
        }
    }

    public function removeReaction(Request $request, string $messageId, string $emoji): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        try {
            // Get message info to determine room type and ID
            $message = DB::table('messages')->find($messageId);
            if (!$message) {
                return response()->json(['success' => false, 'message' => 'Message not found'], 404);
            }

            // Check if conversation_id exists and is not null
            $hasConversationId = property_exists($message, 'conversation_id') && !is_null($message->conversation_id);
            $roomType = $hasConversationId ? 'direct' : 'channel';
            $roomId = $hasConversationId ? $message->conversation_id : $message->channel_id;

            $deleted = DB::table('message_reactions')
                ->where('message_id', $messageId)
                ->where('user_id', $user->id)
                ->where('emoji', $emoji)
                ->delete();

            if ($deleted) {
                // Broadcast reaction removed event
                $payload = [
                    'roomType' => $roomType,
                    'roomId' => (string) $roomId,
                    'messageId' => (string) $messageId,
                    'userId' => (string) $user->id,
                    'emoji' => $emoji,
                    'removedAt' => now()->toISOString(),
                ];

                broadcast(new MessageReactionRemoved($payload))->toOthers();

                return response()->json([
                    'success' => true,
                    'message' => 'Reaction removed successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Reaction not found'
                ], 404);
            }

        } catch (\Throwable $e) {
            Log::error('MessageController@removeReaction failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove reaction',
            ], 500);
        }
    }
}


