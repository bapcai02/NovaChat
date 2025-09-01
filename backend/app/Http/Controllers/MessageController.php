<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Domain\Message\Events\ChatMessageSent;

class MessageController extends Controller
{
    public function index(Request $request, string $roomId): JsonResponse
    {
        try {
            // Load messages from DB based on roomId (which is actually channel_id)
            $messages = DB::table('messages')
                ->where('channel_id', $roomId)
                ->orderBy('created_at', 'asc')
                ->limit(100)
                ->get()
                ->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'room_id' => $message->channel_id,
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
        $data = $request->validate([
            'roomId' => 'required|string',
            'senderId' => 'required|string',
            'content' => 'required|string',
        ]);

        try {
            $createdAt = Carbon::now()->format('Y-m-d H:i:s');
            $messageId = (string) DB::table('messages')->insertGetId([
                'channel_id' => $data['roomId'], // Use channel_id instead of room_id
                'user_id' => $data['senderId'], // Use user_id instead of sender_id
                'content' => $data['content'],
                'type' => 'text',
                'metadata' => '[]',
                'is_edited' => false,
                'is_pinned' => false,
                'is_deleted' => false,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $payload = [
                'roomId' => (string) $data['roomId'],
                'messageId' => (string) $messageId,
                'senderId' => (string) $data['senderId'],
                'content' => (string) $data['content'],
                'createdAt' => (string) $createdAt,
            ];

            broadcast(new ChatMessageSent($payload))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $payload,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('MessageController@store failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
            ], 500);
        }
    }
}


