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
}


