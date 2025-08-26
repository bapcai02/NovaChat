<?php

namespace App\Domain\Message\Repositories;

use Illuminate\Support\Facades\DB;

class ThreadRepository implements ThreadRepositoryInterface
{
    public function getRepliesByMessageId(int $messageId): array
    {
        return DB::table('messages as m')
            ->where('m.parent_id', $messageId)
            ->orderBy('m.created_at', 'asc')
            ->get()
            ->map(function ($m) {
                $author = DB::table('users')->where('id', $m->user_id)->first();
                $metadata = json_decode($m->metadata ?? '{}', true) ?: [];
                return [
                    'id' => $m->id,
                    'content' => $m->content,
                    'author' => [
                        'name' => $author->name ?? 'User',
                        'username' => $author->username ?? 'user',
                        'avatar' => $author->avatar ?? null,
                    ],
                    'timestamp' => $m->created_at,
                    'type' => $m->type,
                    'attachments' => $metadata['attachments'] ?? [],
                    'reactions' => $metadata['reactions'] ?? [],
                ];
            })
            ->toArray();
    }

    public function createReply(int $parentMessageId, int $userId, string $content, ?string $type = 'text', array $metadata = []): array
    {
        $id = DB::table('messages')->insertGetId([
            'channel_id' => DB::raw('(select channel_id from messages where id = '.(int)$parentMessageId.' limit 1)') ,
            'user_id' => $userId,
            'parent_id' => $parentMessageId,
            'content' => $content,
            'type' => $type,
            'metadata' => json_encode($metadata),
            'is_edited' => false,
            'is_pinned' => false,
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $row = DB::table('messages')->where('id', $id)->first();
        $author = DB::table('users')->where('id', $userId)->first();
        return [
            'id' => $row->id,
            'content' => $row->content,
            'author' => [
                'name' => $author->name ?? 'User',
                'username' => $author->username ?? 'user',
                'avatar' => $author->avatar ?? null,
            ],
            'timestamp' => $row->created_at,
            'type' => $row->type,
            'attachments' => [],
            'reactions' => [],
        ];
    }
}


