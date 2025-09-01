<?php

namespace App\Domain\User\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.status.' . $this->payload['userId']),
            new PrivateChannel('chat.' . $this->payload['roomId'])
        ];
    }

    public function broadcastAs(): string
    {
        return 'UserStatusChanged';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
