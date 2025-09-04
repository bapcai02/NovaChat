<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\SearchRepositoryInterface;
use App\Models\Message;
use App\Models\Channel;
use App\Models\User;
use App\Models\File;

class EloquentSearchRepository implements SearchRepositoryInterface
{
    public function searchAll(string $query, array $filters = []): array
    {
        return [
            'messages' => $this->searchMessages($query, $filters),
            'channels' => $this->searchChannels($query, $filters),
            'users' => $this->searchUsers($query, $filters),
            'files' => $this->searchFiles($query, $filters),
        ];
    }

    public function searchMessages(string $query, array $filters = []): array
    {
        $q = Message::query()->where('content', 'like', "%$query%");
        if (!empty($filters['channel_id'])) {
            $q->where('channel_id', (int)$filters['channel_id']);
        }
        return $q->orderByDesc('id')->limit(50)->get()->toArray();
    }

    public function searchChannels(string $query, array $filters = []): array
    {
        return Channel::where('name', 'like', "%$query%")
            ->orderByDesc('id')->limit(50)->get()->toArray();
    }

    public function searchUsers(string $query, array $filters = []): array
    {
        return User::where(function ($q) use ($query) {
                $q->where('name', 'like', "%$query%")
                  ->orWhere('email', 'like', "%$query%")
                  ->orWhere('username', 'like', "%$query%");
            })
            ->orderByDesc('id')->limit(50)->get()->toArray();
    }

    public function searchFiles(string $query, array $filters = []): array
    {
        return File::where('name', 'like', "%$query%")
            ->orderByDesc('id')->limit(50)->get()->toArray();
    }
}


