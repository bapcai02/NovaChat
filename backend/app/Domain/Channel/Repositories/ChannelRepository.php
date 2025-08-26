<?php

namespace App\Domain\Channel\Repositories;

use Illuminate\Support\Facades\DB;

class ChannelRepository implements ChannelRepositoryInterface
{
    public function getAllChannels(): array
    {
        return DB::table('channels as c')
            ->select('c.id', 'c.name', 'c.display_name', 'c.description', 'c.updated_at')
            ->orderBy('c.id')
            ->get()
            ->map(function ($c) {
                $members = DB::table('channel_members')->where('channel_id', $c->id)->count();
                $last = $this->getLastMessage($c->id);
                
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'display_name' => $c->display_name,
                    'description' => $c->description,
                    'is_private' => false,
                    'members_count' => $members,
                    'unread_count' => 0,
                    'last_message_preview' => $last ? substr($last['content'], 0, 80) : null,
                    'updated_at' => optional($c->updated_at)->toISOString(),
                ];
            })->values()->toArray();
    }

    public function getChannelById(int $id): ?array
    {
        $channel = DB::table('channels')->where('id', $id)->first();
        if (!$channel) {
            return null;
        }

        $members = $this->getChannelMembers($id);
        $last = $this->getLastMessage($id);

        return [
            'id' => $channel->id,
            'name' => $channel->name,
            'display_name' => $channel->display_name,
            'description' => $channel->description,
            'is_private' => false,
            'members_count' => count($members),
            'unread_count' => 0,
            'last_message_preview' => $last ? substr($last['content'], 0, 80) : null,
            'updated_at' => optional($channel->updated_at)->toISOString(),
        ];
    }

    public function getChannelMembers(int $channelId): array
    {
        return DB::table('channel_members')
            ->where('channel_id', $channelId)
            ->get()
            ->toArray();
    }

    public function getLastMessage(int $channelId): ?array
    {
        $message = DB::table('messages')
            ->where('channel_id', $channelId)
            ->orderBy('created_at', 'desc')
            ->first();

        return $message ? (array) $message : null;
    }
}
