<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\PrivateChannel;

class UserStatusChanged implements ShouldBroadcast
{
    use InteractsWithSockets;

    public function __construct(public array $payload)
    {
    }

    public function broadcastOn(): array
    {
        $roomId = $this->payload['roomId'];
        return [new PrivateChannel('channel.' . $roomId)];
    }
}


