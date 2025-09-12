<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\UserSessionRepositoryInterface;
use Illuminate\Support\Facades\DB;

class EloquentUserSessionRepository implements UserSessionRepositoryInterface
{
    public function getByUserIdOrdered(int $userId): array
    {
        return DB::table('user_sessions')
            ->where('user_id', $userId)
            ->orderByDesc('last_active')
            ->get()
            ->toArray();
    }

    public function deleteByUserAndId(int $userId, int $id): void
    {
        DB::table('user_sessions')
            ->where('user_id', $userId)
            ->where('id', $id)
            ->delete();
    }
}


