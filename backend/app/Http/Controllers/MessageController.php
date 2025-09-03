<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use App\Domain\Message\Events\ChatMessageSent;

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
                        'reactions' => [],
                        'read_by' => [],
                    ];
                });

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
}


