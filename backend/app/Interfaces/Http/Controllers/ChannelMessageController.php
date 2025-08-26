<?php

namespace App\Interfaces\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ChannelMessageController extends Controller
{
    public function index(int $channelId): JsonResponse
    {
        // Load from DB (seeded) and shape for frontend
        $messages = \App\Domain\Message\Entities\Message::with('user')
            ->where('channel_id', $channelId)
            ->orderBy('created_at', 'asc')
            ->limit(100)
            ->get()
            ->map(function ($m) {
                $meta = [];
                try { $meta = $m->metadata ? (is_array($m->metadata) ? $m->metadata : json_decode($m->metadata, true)) : []; } catch (\Throwable $e) {}
                return [
                    'id' => $m->id,
                    'channel_id' => $m->channel_id,
                    'sender' => [
                        'id' => $m->user->id ?? null,
                        'name' => $m->user->name ?? 'User',
                        'avatar' => $m->user->avatar ?? null,
                    ],
                    'content' => $m->content,
                    'type' => $m->type,
                    'created_at' => optional($m->created_at)->toISOString(),
                    'is_edited' => (bool) $m->is_edited,
                    'is_pinned' => (bool) $m->is_pinned,
                    'attachments' => $meta['attachments'] ?? [],
                    'reactions' => $meta['reactions'] ?? [],
                    'read_by' => $meta['read_by'] ?? [],
                    'duration' => $meta['duration'] ?? null,
                ];
            })->values();

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }
}


