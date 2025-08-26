<?php

namespace App\Domain\User\Repositories;

use App\Domain\User\Entities\User;
use App\Domain\User\Repositories\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    public function save(User $user): void
    {
        $user->save();
    }

    public function delete(User $user): void
    {
        $user->delete();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return User::paginate($perPage);
    }

    public function findByTeam(int $teamId, int $perPage = 15): LengthAwarePaginator
    {
        // For now, return all users since team functionality might not be implemented yet
        return User::paginate($perPage);
    }

    public function search(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('email', 'like', "%{$query}%")
              ->orWhere('username', 'like', "%{$query}%");
        })->paginate($perPage);
    }

    public function findOnlineUsers(): array
    {
        // Use presence flag instead of writing presence into the status enum
        return User::where('is_online', true)->get()->toArray();
    }

    public function findActiveUsers(): array
    {
        // Treat any user with is_online true as active for presence purposes
        return User::where('is_online', true)->get()->toArray();
    }

    // Additional helper methods for the application
    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    public function getAll(): Collection
    {
        return User::all();
    }

    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = User::query();

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        return $query->paginate($perPage);
    }

    public function getOnlineUsers(): Collection
    {
        return User::where('is_online', true)->get();
    }

    public function updateStatus(User $user, string $status, ?string $statusMessage = null): User
    {
        // Map presence values to presence flags; do not overwrite the status enum
        $updates = [
            'last_seen_at' => now(),
        ];

        if ($status === 'online') {
            $updates['is_online'] = true;
        } elseif ($status === 'offline') {
            $updates['is_online'] = false;
        }

        // Optionally reflect presence in status_message
        if ($statusMessage !== null) {
            $updates['status_message'] = $statusMessage;
        } elseif (in_array($status, ['online', 'offline', 'away', 'busy'], true)) {
            $updates['status_message'] = ucfirst($status);
        }

        $user->update($updates);

        return $user->fresh();
    }

    public function searchUsers(string $query, int $limit = 20): Collection
    {
        return User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('email', 'like', "%{$query}%")
              ->orWhere('username', 'like', "%{$query}%");
        })
        ->limit($limit)
        ->get();
    }

    public function getUsersByRole(string $role): Collection
    {
        return User::where('role', $role)->get();
    }

    public function getUsersByIds(array $ids): Collection
    {
        return User::whereIn('id', $ids)->get();
    }

    public function countByStatus(string $status): int
    {
        return User::where('status', $status)->count();
    }

    public function getRecentUsers(int $limit = 10): Collection
    {
        return User::orderBy('created_at', 'desc')->limit($limit)->get();
    }
}
