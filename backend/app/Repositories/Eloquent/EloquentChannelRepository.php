<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\ChannelRepositoryInterface;
use App\Models\Channel;

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
            'is_private' => (bool)($data['is_private'] ?? false),
            'created_by' => $createdBy,
        ]);
        return $channel->toArray();
    }

    public function update(int $id, array $data): array
    {
        $channel = Channel::find($id);
        if (!$channel) {
            return null;
        }
        
        $channel->update([
            'name' => $data['name'] ?? $channel->name,
            'display_name' => $data['display_name'] ?? $channel->display_name,
            'description' => $data['description'] ?? $channel->description,
            'is_private' => isset($data['is_private']) ? (bool)$data['is_private'] : $channel->is_private,
        ]);
        
        return $channel->toArray();
    }

    public function delete(int $id): bool
    {
        $channel = Channel::find($id);
        if (!$channel) {
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
}


