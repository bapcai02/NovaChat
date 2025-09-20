<?php

namespace App\Repositories\Contracts;

interface UserSessionRepositoryInterface
{
    /**
     * Get sessions for a user ordered by last_active desc.
     */
    public function getByUserIdOrdered(int $userId): array;

    /**
     * Delete a specific session by id for the given user.
     */
    public function deleteByUserAndId(int $userId, int $id): void;
}
