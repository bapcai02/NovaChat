<?php

namespace App\Services;

use App\Repositories\Contracts\UserSessionRepositoryInterface;

class UserSessionService
{
    private UserSessionRepositoryInterface $sessions;

    public function __construct(UserSessionRepositoryInterface $sessions)
    {
        $this->sessions = $sessions;
    }

    public function listForUser(int $userId): array
    {
        return $this->sessions->getByUserIdOrdered($userId);
    }

    public function revoke(int $userId, int $id): void
    {
        $this->sessions->deleteByUserAndId($userId, $id);
    }
}


