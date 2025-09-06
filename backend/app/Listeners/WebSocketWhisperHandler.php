<?php

namespace App\Listeners;

use App\Services\MessageService;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class WebSocketWhisperHandler
{
    private MessageService $messageService;

    public function __construct(MessageService $messageService)
    {
        $this->messageService = $messageService;
    }

    public function handle($event)
    {
        try {
            Log::info('WebSocket whisper handler received:', $event);
            
            // Extract data from the whisper event
            $data = $event->data ?? $event;
            $conversationId = $data['conversation_id'] ?? null;
            $content = $data['content'] ?? '';
            $type = $data['type'] ?? 'text';
            $senderId = $data['sender_id'] ?? null;
            
            if (!$conversationId || !$content || !$senderId) {
                Log::warning('Invalid WebSocket whisper data:', $data);
                return;
            }
            
            // Create message data
            $messageData = [
                'user_id' => $senderId,
                'conversation_id' => $conversationId,
                'content' => $content,
                'type' => $type,
                'metadata' => []
            ];
            
            // Create message via service
            $result = $this->messageService->storeMessage($messageData);
            
            if ($result['success']) {
                Log::info('Message created via WebSocket whisper:', $result['data']);
                
                // Broadcast the message to all clients
                broadcast(new MessageSent($result['data']))->toOthers();
            } else {
                Log::error('Failed to create message via WebSocket whisper:', $result);
            }
            
        } catch (\Exception $e) {
            Log::error('WebSocket whisper handler error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'event' => $event
            ]);
        }
    }
}