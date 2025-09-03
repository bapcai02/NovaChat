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
     * @var array{roomType?:string,roomId:string,messageId:string,senderId:string,content:string,createdAt:string}
     */
    public array $payload;

    public function __construct(array $payload)
    {
        Log::info('ChatMessageSent event constructed with payload:', $payload);
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        $roomType = $this->payload['roomType'] ?? 'channel';
        $channelName = $roomType === 'direct'
            ? 'chat.dm.' . $this->payload['roomId']
            : 'chat.channel.' . $this->payload['roomId'];

        Log::info('ChatMessageSent broadcasting on channel:', ['name' => $channelName, 'roomType' => $roomType]);
        return [new PrivateChannel($channelName)];
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


