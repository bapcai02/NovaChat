<?php

namespace App\Domain\Search\Repositories;

use Illuminate\Support\Facades\DB;

class SearchRepository implements SearchRepositoryInterface
{
    public function searchMessages(string $query, array $filters = []): array
    {
        $queryBuilder = DB::table('messages as m')
            ->join('users as u', 'm.user_id', '=', 'u.id')
            ->join('channels as c', 'm.channel_id', '=', 'c.id')
            ->where('m.is_deleted', false)
            ->where(function ($q) use ($query) {
                $q->where('m.content', 'like', "%{$query}%")
                  ->orWhere('u.name', 'like', "%{$query}%")
                  ->orWhere('u.username', 'like', "%{$query}%");
            });

        // Apply time filters
        if (isset($filters['time'])) {
            switch ($filters['time']) {
                case 'today':
                    $queryBuilder->whereDate('m.created_at', today());
                    break;
                case 'week':
                    $queryBuilder->whereBetween('m.created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'month':
                    $queryBuilder->whereMonth('m.created_at', now()->month);
                    break;
                case 'year':
                    $queryBuilder->whereYear('m.created_at', now()->year);
                    break;
            }
        }

        // Apply channel filter
        if (isset($filters['channel_id'])) {
            $queryBuilder->where('m.channel_id', $filters['channel_id']);
        }

        return $queryBuilder
            ->select([
                'm.id',
                'm.content',
                'm.created_at',
                'm.metadata',
                'u.name as author_name',
                'u.username as author_username',
                'u.avatar as author_avatar',
                'c.name as channel_name',
                'c.display_name as channel_display_name'
            ])
            ->orderBy('m.created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($message) {
                $metadata = json_decode($message->metadata ?? '{}', true) ?: [];
                return [
                    'id' => $message->id,
                    'type' => 'message',
                    'title' => substr($message->content, 0, 100) . (strlen($message->content) > 100 ? '...' : ''),
                    'content' => $message->content,
                    'author' => $message->author_name,
                    'author_username' => $message->author_username,
                    'author_avatar' => $message->author_avatar,
                    'channel' => $message->channel_display_name ?: $message->channel_name,
                    'timestamp' => $message->created_at,
                    'reactions' => count($metadata['reactions'] ?? []),
                    'attachments' => count($metadata['attachments'] ?? []),
                ];
            })
            ->toArray();
    }

    public function searchChannels(string $query, array $filters = []): array
    {
        return DB::table('channels as c')
            ->leftJoin('channel_members as cm', 'c.id', '=', 'cm.channel_id')
            ->where(function ($q) use ($query) {
                $q->where('c.name', 'like', "%{$query}%")
                  ->orWhere('c.display_name', 'like', "%{$query}%")
                  ->orWhere('c.description', 'like', "%{$query}%");
            })
            ->select([
                'c.id',
                'c.name',
                'c.display_name',
                'c.description',
                'c.is_private',
                'c.created_at',
                DB::raw('COUNT(DISTINCT cm.user_id) as member_count')
            ])
            ->groupBy('c.id', 'c.name', 'c.display_name', 'c.description', 'c.is_private', 'c.created_at')
            ->orderBy('c.created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($channel) {
                return [
                    'id' => $channel->id,
                    'type' => 'channel',
                    'title' => $channel->display_name ?: $channel->name,
                    'content' => $channel->description,
                    'author' => $channel->member_count . ' members',
                    'timestamp' => $channel->is_private ? 'Private channel' : 'Public channel',
                    'is_private' => $channel->is_private,
                ];
            })
            ->toArray();
    }

    public function searchUsers(string $query, array $filters = []): array
    {
        return DB::table('users')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('username', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->select(['id', 'name', 'username', 'email', 'avatar', 'status', 'is_online', 'last_seen_at'])
            ->orderBy('name')
            ->limit(20)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'type' => 'user',
                    'title' => $user->name,
                    'content' => $user->is_online ? 'Online' : 'Last seen ' . ($user->last_seen_at ? \Carbon\Carbon::parse($user->last_seen_at)->diffForHumans() : 'unknown'),
                    'author' => '@' . $user->username,
                    'avatar' => $user->avatar,
                    'timestamp' => $user->status,
                    'is_online' => $user->is_online,
                ];
            })
            ->toArray();
    }

    public function searchFiles(string $query, array $filters = []): array
    {
        // Search for files in message attachments
        return DB::table('messages as m')
            ->join('users as u', 'm.user_id', '=', 'u.id')
            ->join('channels as c', 'm.channel_id', '=', 'c.id')
            ->where('m.is_deleted', false)
            ->whereRaw("JSON_EXTRACT(m.metadata, '$.attachments') IS NOT NULL")
            ->whereRaw("JSON_EXTRACT(m.metadata, '$.attachments') LIKE ?", ["%{$query}%"])
            ->select([
                'm.id',
                'm.metadata',
                'm.created_at',
                'u.name as author_name',
                'u.username as author_username',
                'c.name as channel_name',
                'c.display_name as channel_display_name'
            ])
            ->orderBy('m.created_at', 'desc')
            ->limit(20)
            ->get()
            ->flatMap(function ($message) use ($query) {
                $metadata = json_decode($message->metadata ?? '{}', true) ?: [];
                $attachments = $metadata['attachments'] ?? [];
                
                return collect($attachments)
                    ->filter(function ($attachment) use ($query) {
                        return stripos($attachment['name'] ?? '', $query) !== false;
                    })
                    ->map(function ($attachment) use ($message) {
                        return [
                            'id' => $message->id . '_' . ($attachment['name'] ?? 'file'),
                            'type' => 'file',
                            'title' => $attachment['name'] ?? 'Unknown file',
                            'content' => ($attachment['size'] ?? 'Unknown size') . ' • Uploaded by ' . $message->author_name,
                            'author' => $message->author_name,
                            'timestamp' => $message->created_at,
                            'channel' => $message->channel_display_name ?: $message->channel_name,
                            'file_size' => $attachment['size'] ?? null,
                            'file_type' => $attachment['type'] ?? 'file',
                        ];
                    });
            })
            ->toArray();
    }

    public function searchAll(string $query, array $filters = []): array
    {
        $results = [];
        
        if (!isset($filters['type']) || $filters['type'] === 'all' || $filters['type'] === 'messages') {
            $results = array_merge($results, $this->searchMessages($query, $filters));
        }
        
        if (!isset($filters['type']) || $filters['type'] === 'all' || $filters['type'] === 'channels') {
            $results = array_merge($results, $this->searchChannels($query, $filters));
        }
        
        if (!isset($filters['type']) || $filters['type'] === 'all' || $filters['type'] === 'users') {
            $results = array_merge($results, $this->searchUsers($query, $filters));
        }
        
        if (!isset($filters['type']) || $filters['type'] === 'all' || $filters['type'] === 'files') {
            $results = array_merge($results, $this->searchFiles($query, $filters));
        }

        // Sort by relevance (messages first, then others)
        usort($results, function ($a, $b) {
            $typeOrder = ['message' => 0, 'channel' => 1, 'user' => 2, 'file' => 3];
            return $typeOrder[$a['type']] <=> $typeOrder[$b['type']];
        });

        return array_slice($results, 0, 50);
    }
}
