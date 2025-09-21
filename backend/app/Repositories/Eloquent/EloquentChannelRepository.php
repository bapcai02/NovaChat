<?php

namespace App\Repositories\Eloquent;

use App\Models\Channel;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Repositories\Contracts\ChannelRepositoryInterface;

class EloquentChannelRepository implements ChannelRepositoryInterface
{
    public function getAll(): array
    {
        return Channel::orderBy('id', 'asc')->get()->toArray();
    }

    public function getById(int $id): ?array
    {
        $row = Channel::find($id);

        return $row ? $row->toArray() : null;
    }

    public function create(array $data, int $createdBy): array
    {
        $channel = Channel::create([
            'name' => $data['name'],
            'display_name' => $data['display_name'] ?? null,
            'description' => $data['description'] ?? null,
            'is_private' => (bool) ($data['is_private'] ?? false),
            'created_by' => $createdBy,
            'team_id' => $data['team_id'] ?? null,
        ]);

        // Create channel conversation
        if ($channel->team_id) {
            $conversation = Conversation::create([
                'type' => 'channel',
                'name' => $channel->name,
                'team_id' => $channel->team_id,
                'channel_id' => $channel->id,
                'metadata' => null,
            ]);

            // Add all team members to channel conversation
            $teamMembers = \DB::table('team_members')
                ->where('team_id', $channel->team_id)
                ->get();

            foreach ($teamMembers as $member) {
                ConversationMember::firstOrCreate([
                    'conversation_id' => $conversation->id,
                    'user_id' => $member->user_id,
                ], [
                    'joined_at' => now(),
                ]);
            }
        }

        return $channel->toArray();
    }

    public function update(int $id, array $data): array
    {
        $channel = Channel::find($id);
        if (! $channel) {
            return null;
        }

        $channel->update([
            'name' => $data['name'] ?? $channel->name,
            'display_name' => $data['display_name'] ?? $channel->display_name,
            'description' => $data['description'] ?? $channel->description,
            'is_private' => isset($data['is_private']) ? (bool) $data['is_private'] : $channel->is_private,
        ]);

        return $channel->toArray();
    }

    public function delete(int $id): bool
    {
        $channel = Channel::find($id);
        if (! $channel) {
            return false;
        }

        return $channel->delete();
    }

    public function getByTeam(int $teamId): array
    {
        return Channel::where('team_id', $teamId)
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }

    public function addMember(int $teamId, int $channelId, int $userId): bool
    {
        // Find the channel conversation
        $conversation = Conversation::where('type', 'channel')
            ->where('team_id', $teamId)
            ->where('channel_id', $channelId)
            ->first();

        if (! $conversation) {
            return false;
        }

        // Add user to conversation
        $conversationMember = ConversationMember::firstOrCreate([
            'conversation_id' => $conversation->id,
            'user_id' => $userId,
        ], [
            'joined_at' => now(),
        ]);

        return (bool) $conversationMember;
    }

    public function removeMember(int $teamId, int $channelId, int $userId): bool
    {
        // Find the channel conversation
        $conversation = Conversation::where('type', 'channel')
            ->where('team_id', $teamId)
            ->where('channel_id', $channelId)
            ->first();

        if (! $conversation) {
            return false;
        }

        // Remove user from conversation
        return ConversationMember::where('conversation_id', $conversation->id)
            ->where('user_id', $userId)
            ->delete() > 0;
    }
}
