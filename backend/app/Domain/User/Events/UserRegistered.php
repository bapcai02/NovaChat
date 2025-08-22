<?php

namespace App\Domain\User\Events;

use App\Domain\User\Entities\User;
use App\Shared\Events\DomainEvent;

class UserRegistered implements DomainEvent
{
    public function __construct(
        public readonly User $user
    ) {}

    public function getEventName(): string
    {
        return 'user.registered';
    }

    public function getEventData(): array
    {
        return [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
            'name' => $this->user->name,
            'username' => $this->user->username,
            'registered_at' => now()->toISOString(),
        ];
    }
}
