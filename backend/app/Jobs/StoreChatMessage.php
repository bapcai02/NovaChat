<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Message;
use App\Models\Conversation;
use App\Events\MessageSent;

class StoreChatMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $conversationId;
    protected $senderId;
    protected $content;
    protected $timestamp;
    protected $parentId;

    /**
     * Create a new job instance.
     */
    public function __construct($conversationId, $senderId, $content, $timestamp = null, $parentId = null)
    {
        $this->conversationId = $conversationId;
        $this->senderId = $senderId;
        $this->content = $content;
        $this->timestamp = $timestamp ?: now();
        $this->parentId = $parentId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Force log to file
            file_put_contents(storage_path('logs/laravel.log'),
                '[' . now() . '] local.INFO: === StoreChatMessage Job Started ===' . PHP_EOL .
                'Conversation ID: ' . $this->conversationId . PHP_EOL .
                'Sender ID: ' . $this->senderId . PHP_EOL .
                'Content: ' . $this->content . PHP_EOL .
                'Parent ID: ' . ($this->parentId ?: 'null') . PHP_EOL,
                FILE_APPEND | LOCK_EX
            );

            Log::info('Processing chat message from Redis queue', [
                'conversation_id' => $this->conversationId,
                'sender_id' => $this->senderId,
                'content' => $this->content,
                'parent_id' => $this->parentId
            ]);

            // If this is a thread reply and conversationId is missing, inherit from parent
            if (empty($this->conversationId) && !empty($this->parentId)) {
                $parent = Message::find($this->parentId);
                if ($parent) {
                    $this->conversationId = $parent->conversation_id;
                }
            }

            // Verify conversation exists (after inheritance if applied)
            $conversation = Conversation::find($this->conversationId);
            if (!$conversation) {
                Log::error('Conversation not found', ['conversation_id' => $this->conversationId]);
                return;
            }

            // Create message
            $message = Message::create([
                'conversation_id' => $this->conversationId,
                'user_id' => $this->senderId,  // Changed from sender_id to user_id
                'content' => $this->content,
                'type' => 'text',
                'parent_id' => $this->parentId,
                'created_at' => $this->timestamp,
                'updated_at' => $this->timestamp
            ]);

            // Force log to file
            file_put_contents(storage_path('logs/laravel.log'),
                '[' . now() . '] local.INFO: === Message Stored Successfully ===' . PHP_EOL .
                'Message ID: ' . $message->id . PHP_EOL .
                'Conversation ID: ' . $this->conversationId . PHP_EOL,
                FILE_APPEND | LOCK_EX
            );

            Log::info('Message stored successfully', [
                'message_id' => $message->id,
                'conversation_id' => $this->conversationId
            ]);

            // Dispatch event for real-time updates (optional)
            // broadcast(new MessageSent($message));

        } catch (\Exception $e) {
            Log::error('Failed to store chat message', [
                'error' => $e->getMessage(),
                'conversation_id' => $this->conversationId,
                'sender_id' => $this->senderId
            ]);
            
            // Re-throw to mark job as failed
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('StoreChatMessage job failed', [
            'error' => $exception->getMessage(),
            'conversation_id' => $this->conversationId,
            'sender_id' => $this->senderId
        ]);
    }
}
