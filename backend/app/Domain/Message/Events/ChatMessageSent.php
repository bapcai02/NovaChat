<?php

namespace App\Domain\Message\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChatMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var array{roomId:string,messageId:string,senderId:string,content:string,createdAt:string}
     */
    public array $payload;

    public function __construct(array $payload)
    {
        Log::info('ChatMessageSent event constructed with payload:', $payload);
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        $channel = 'chat.' . $this->payload['roomId'];
        Log::info('ChatMessageSent broadcasting on channel:', $channel);
        return [new PrivateChannel($channel)];
    }

    public function broadcastAs(): string
    {
        return 'ChatMessageSent';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}


