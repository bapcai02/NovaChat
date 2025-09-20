<?php

namespace App\Jobs;

use App\Services\UserPresenceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessUserPresenceEvents implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(UserPresenceService $presenceService): void
    {
        try {
            Log::info('Starting to process user presence events');

            $events = $presenceService->consumeEvents(10, 1000);

            if (empty($events)) {
                Log::debug('No events to process');

                return;
            }

            $processedCount = 0;
            $errorCount = 0;

            foreach ($events as $event) {
                if ($event['status'] === 'processed') {
                    $processedCount++;
                } elseif ($event['status'] === 'error') {
                    $errorCount++;
                }
            }

            Log::info('Processed user presence events', [
                'total' => count($events),
                'processed' => $processedCount,
                'errors' => $errorCount,
            ]);

            // If there were events processed, dispatch another job to continue processing
            if ($processedCount > 0) {
                self::dispatch()->delay(now()->addSeconds(1));
            } else {
                // If no events were processed, wait a bit longer before trying again
                self::dispatch()->delay(now()->addSeconds(5));
            }
        } catch (\Exception $e) {
            Log::error('Error processing user presence events: '.$e->getMessage());

            // Retry the job after a delay
            $this->release(30); // Retry after 30 seconds
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('User presence events job failed: '.$exception->getMessage());
    }
}
