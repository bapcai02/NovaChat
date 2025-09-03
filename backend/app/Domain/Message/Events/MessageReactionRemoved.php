<?php

namespace App\Domain\Message\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReactionRemoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function broadcastOn()
    {
        $roomType = $this->payload['roomType'] ?? 'channel';
        $roomId = $this->payload['roomId'];
        
        if ($roomType === 'direct') {
            return new PrivateChannel("chat.dm.{$roomId}");
        } else {
            return new PrivateChannel("chat.channel.{$roomId}");
        }
    }

    public function broadcastAs()
    {
        return 'MessageReactionRemoved';
    }

    public function broadcastWith()
    {
        return $this->payload;
    }
}
