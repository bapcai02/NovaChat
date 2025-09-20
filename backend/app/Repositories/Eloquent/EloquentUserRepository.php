<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function create(array $data)
    {
        return User::create($data);
    }

    public function findById(int $id)
    {
        return User::find($id);
    }

    public function findByEmail(string $email)
    {
        return User::where('email', $email)->first();
    }

    public function findByUsername(string $username)
    {
        return User::where('username', $username)->first();
    }

    public function update(int $id, array $data)
    {
        $user = User::find($id);
        if (! $user) {
            return;
        }

        $user->update($data);

        return $user;
    }

    public function save($user): void
    {
        if ($user instanceof User) {
            $user->save();
        }
    }

    public function delete($user): void
    {
        if ($user instanceof User) {
            $user->delete();
        }
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return User::paginate($perPage);
    }

    public function findByTeam(int $teamId, int $perPage = 15): LengthAwarePaginator
    {
        return User::query()
            ->join('team_members', 'users.id', '=', 'team_members.user_id')
            ->where('team_members.team_id', $teamId)
            ->select('users.*')
            ->paginate($perPage);
    }

    public function search(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('username', 'like', "%{$query}%");
        })
            ->paginate($perPage);
    }

    public function findOnlineUsers(): array
    {
        return User::where('is_online', true)->get()->toArray();
    }

    public function getOnlineUsers(): array
    {
        return User::where('is_online', true)
            ->select('id', 'name', 'email', 'username', 'avatar', 'is_online', 'status_message', 'last_seen_at')
            ->get()
            ->toArray();
    }

    public function findActiveUsers(): array
    {
        return User::where('is_online', true)->get()->toArray();
    }

    public function updateStatus($user, string $status, ?string $statusMessage = null)
    {
        $model = $user instanceof User ? $user : User::find($user);
        if (! $model) {
            return null;
        }
        if ($status === 'online') {
            $model->is_online = true;
        } elseif ($status === 'offline') {
            $model->is_online = false;
        }
        if ($statusMessage !== null) {
            $model->status_message = $statusMessage;
        }
        $model->last_seen_at = now();
        $model->save();

        return $model;
    }
}
