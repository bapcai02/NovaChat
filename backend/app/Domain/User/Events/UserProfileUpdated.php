<?php

namespace App\Domain\User\Events;

use App\Domain\User\Entities\User;
use App\Shared\Events\DomainEvent;

class UserProfileUpdated implements DomainEvent
{
    public function __construct(
        public readonly User $user,
        public readonly array $originalData
    ) {}

    public function getEventName(): string
    {
        return 'user.profile_updated';
    }

    public function getEventData(): array
    {
        return [
            'user_id' => $this->user->id,
            'original_data' => $this->originalData,
            'new_data' => [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'username' => $this->user->username,
            ],
            'updated_at' => now()->toISOString(),
        ];
    }
}
