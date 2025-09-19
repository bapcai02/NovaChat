<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use App\Jobs\StoreChatMessage;
use Illuminate\Support\Facades\Log;

class ProcessChatMessages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chat:process-messages';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process chat messages from Redis queue';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting chat message processor...');

        // Test Redis connection first
        try {
            $this->info('Testing Redis connection...');
            Redis::ping();
            $this->info('Redis connection successful');
        } catch (\Exception $e) {
            $this->error('Redis connection failed: ' . $e->getMessage());
            return;
        }

        // Use base key; Redis client may apply configured prefix automatically
        $baseKey = 'chat_messages_list';
        $prefixedKey = (string) config('database.redis.options.prefix', '') . $baseKey;
        // Check queue length across both keys (best effort)
        $queueLength = (int) Redis::llen($baseKey) + (int) Redis::llen($prefixedKey);
        $this->info("Queue length: {$queueLength}");

        while (true) {
            try {
                // Blocking pop from Redis list(s) with 5 second timeout
                $messageData = Redis::brpop([$baseKey, $prefixedKey], 5);
                
                if ($messageData) {
                    $payload = is_array($messageData) ? ($messageData[1] ?? null) : null;
                    $message = $payload ? json_decode($payload, true) : null;
                    
                    if ($message) {
                        $this->info('Processing message: ' . json_encode($message));
                        
                        // Force log to file
                        file_put_contents(storage_path('logs/laravel.log'),
                            '[' . now() . '] local.INFO: === Dispatching StoreChatMessage Job ===' . PHP_EOL .
                            'Message: ' . json_encode($message) . PHP_EOL,
                            FILE_APPEND | LOCK_EX
                        );
                        
                        // Dispatch job to store message
                        StoreChatMessage::dispatch(
                            $message['conversation_id'] ?? null,
                            $message['sender_id'] ?? null,
                            $message['content'] ?? '',
                            $message['timestamp'] ?? null,
                            $message['parent_id'] ?? null,
                            $message['attachments'] ?? []
                        );
                        
                        $this->info('Message dispatched to queue');
                    } else {
                        $this->error('Invalid message format: ' . ($payload ?? 'null'));
                    }
                } else {
                    // No message received, continue loop
                    $this->line('No messages in queue, waiting...');
                }
                
            } catch (\Exception $e) {
                $this->error('Error processing message: ' . $e->getMessage());
                Log::error('Chat message processor error', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                // Wait a bit before retrying
                sleep(1);
            }
        }
    }
}
