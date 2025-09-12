<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\PrivateChannel;

class ReactionAdded implements ShouldBroadcast
{
    use InteractsWithSockets;

    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        $conversationId = $this->payload['conversation_id'];
        $type = $this->payload['type'] ?? 'direct';
        
        if ($type === 'direct') {
            return [new PrivateChannel('chat.dm.' . $conversationId)];
        } else {
            return [new PrivateChannel('chat.channel.' . $conversationId)];
        }
    }

    public function broadcastAs(): string
    {
        return 'ChatReactionAdded';
    }
}
