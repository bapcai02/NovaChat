<?php

namespace App\Interfaces\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ConversationMessageController extends Controller
{
    public function index(int $conversationId): JsonResponse
    {
        $participants = [
            [ 'id' => 1, 'name' => 'Admin', 'avatar' => 'https://i.pravatar.cc/64?u=1' ],
            [ 'id' => 2, 'name' => 'Alice Nguyen', 'avatar' => 'https://i.pravatar.cc/64?u=2' ],
        ];

        $messages = [];
        for ($i = 0; $i < 20; $i++) {
            $user = $participants[$i % 2];
            $base = [
                'id' => 2001 + $i,
                'conversation_id' => $conversationId,
                'sender' => $user,
                'created_at' => now()->subMinutes(15 - $i)->toISOString(),
                'read_by' => array_column($participants, 'id'),
                'reactions' => $i % 2 === 0 ? [ ['emoji' => '✅', 'count' => 1] ] : [],
            ];
            if ($i % 6 === 0) {
                $messages[] = $base + [
                    'type' => 'voice',
                    'content' => 'audio:mock-url',
                    'duration' => 8 + ($i % 10),
                ];
            } else {
                $messages[] = $base + [
                    'type' => 'text',
                    'content' => 'DM message #' . ($i + 1) . ' in conversation ' . $conversationId,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }
}


