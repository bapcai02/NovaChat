<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\PrivateChannel;

class MessageSent implements ShouldBroadcast
{
    use InteractsWithSockets;

    public array $payload;

    public function __construct(array $payload)
    {
        \Log::info('=== MessageSent event created ===');
        \Log::info('Payload:', $payload);
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        $conversationId = $this->payload['conversation_id'];
        $type = $this->payload['type'] ?? 'direct';
        
        \Log::info('MessageSent broadcastOn called:', [
            'conversationId' => $conversationId,
            'type' => $type
        ]);
        
        if ($type === 'direct') {
            $channel = 'chat.dm.' . $conversationId;
            \Log::info('Broadcasting to direct message channel:', $channel);
            return [new PrivateChannel($channel)];
        } else {
            $channel = 'chat.channel.' . $conversationId;
            \Log::info('Broadcasting to channel channel:', $channel);
            return [new PrivateChannel($channel)];
        }
    }

    public function broadcastAs(): string
    {
        $eventName = 'ChatMessageSent';
        \Log::info('MessageSent broadcastAs called:', $eventName);
        return $eventName;
    }
}
