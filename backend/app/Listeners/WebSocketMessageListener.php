<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Log;
use BeyondCode\LaravelWebSockets\Events\WebSocketMessageReceived;
use App\Services\MessageService;
use App\Events\MessageSent;

class WebSocketMessageListener
{
    protected $messageService;

    public function __construct(MessageService $messageService)
    {
        $this->messageService = $messageService;
    }

    public function handle(WebSocketMessageReceived $event)
    {
        Log::info('=== WebSocketMessageListener handle method called ===');
        Log::info('=== WebSocketMessageReceived event ===');
        Log::info('Event data:', $event->toArray());

        $payload = $event->payload;
        Log::info('Payload:', $payload);

        // Check if this is a client-send-message or client-client-send-message event
        if (isset($payload['event']) && 
            ($payload['event'] === 'client-send-message' || $payload['event'] === 'client-client-send-message')) {
            
            Log::info('Processing client message event');
            
            $data = $payload['data'] ?? [];
            Log::info('Message data:', $data);

            $conversationId = $data['conversation_id'] ?? null;
            $content = $data['content'] ?? '';
            $type = $data['type'] ?? 'text';
            $senderId = $data['sender_id'] ?? null;

            if (!$conversationId || !$content || !$senderId) {
                Log::warning('Invalid message data - missing required fields:', $data);
                return;
            }

            $messageData = [
                'user_id' => $senderId,
                'conversation_id' => $conversationId,
                'content' => $content,
                'type' => $type,
                'metadata' => []
            ];

            try {
                $result = $this->messageService->storeMessage($messageData);

                if ($result['success']) {
                    Log::info('Message created successfully via WebSocket:', $result['data']);
                    
                    // Broadcast the message to other clients
                    broadcast(new MessageSent($result['data']))->toOthers();
                    Log::info('Message broadcasted to other clients');
                } else {
                    Log::error('Failed to create message:', $result);
                }
            } catch (\Exception $e) {
                Log::error('Error processing WebSocket message:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'payload' => $payload
                ]);
            }
        } else {
            Log::info('Non-chat WebSocket message received:', $payload);
        }
    }
}