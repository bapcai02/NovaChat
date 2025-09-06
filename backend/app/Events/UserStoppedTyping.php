<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\PrivateChannel;

class UserStoppedTyping implements ShouldBroadcast
{
    use InteractsWithSockets;

    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        $roomId = $this->payload['roomId'];
        return [new PrivateChannel('channel.' . $roomId)];
    }
}


