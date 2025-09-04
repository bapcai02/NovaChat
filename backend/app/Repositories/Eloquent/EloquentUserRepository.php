<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function create(array $data)
    {
        $id = DB::table('users')->insertGetId(array_merge($data, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        return DB::table('users')->find($id);
    }
    public function findById(int $id)
    {
        return DB::table('users')->find($id);
    }

    public function findByEmail(string $email)
    {
        return DB::table('users')->where('email', $email)->first();
    }

    public function findByUsername(string $username)
    {
        return DB::table('users')->where('username', $username)->first();
    }

    public function save($user): void
    {
        // no-op placeholder for compatibility
    }

    public function delete($user): void
    {
        // no-op placeholder for compatibility
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return DB::table('users')->paginate($perPage);
    }

    public function findByTeam(int $teamId, int $perPage = 15): LengthAwarePaginator
    {
        return DB::table('users')
            ->join('team_members', 'users.id', '=', 'team_members.user_id')
            ->where('team_members.team_id', $teamId)
            ->select('users.*')
            ->paginate($perPage);
    }

    public function search(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return DB::table('users')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('username', 'like', "%{$query}%");
            })
            ->paginate($perPage);
    }

    public function findOnlineUsers(): array
    {
        return DB::table('users')->where('is_online', true)->get()->toArray();
    }

    public function findActiveUsers(): array
    {
        return DB::table('users')->where('is_online', true)->get()->toArray();
    }

    public function updateStatus($user, string $status, ?string $statusMessage = null)
    {
        $updates = ['last_seen_at' => now()];
        if ($status === 'online') { $updates['is_online'] = true; }
        elseif ($status === 'offline') { $updates['is_online'] = false; }
        if ($statusMessage !== null) { $updates['status_message'] = $statusMessage; }
        DB::table('users')->where('id', is_object($user) ? $user->id : $user)->update($updates);
        return DB::table('users')->find(is_object($user) ? $user->id : $user);
    }
}


