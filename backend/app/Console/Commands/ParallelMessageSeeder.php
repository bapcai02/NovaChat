<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Models\ConversationMember;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ParallelMessageSeeder extends Command
{
    protected $signature = 'seed:parallel-messages {--threads=4} {--batch-size=1000} {--total=1000000}';
    protected $description = 'Create messages using multiple threads for faster insertion';

    private $faker;

    public function __construct()
    {
        parent::__construct();
        $this->faker = Faker::create();
    }

    public function handle()
    {
        $threads = (int) $this->option('threads');
        $batchSize = (int) $this->option('batch-size');
        $totalMessages = (int) $this->option('total');

        $this->info("Creating {$totalMessages} messages using {$threads} threads...");
        $startTime = microtime(true);

        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Get all conversations
            $conversations = Conversation::all();
            $messagesPerThread = intval($totalMessages / $threads);

            // Create process handles
            $processes = [];
            $pipes = [];

            for ($i = 0; $i < $threads; $i++) {
                $startId = $i * $messagesPerThread;
                $endId = ($i + 1) * $messagesPerThread;
                if ($i === $threads - 1) {
                    $endId = $totalMessages; // Last thread gets remaining messages
                }

                $descriptorspec = [
                    0 => ["pipe", "r"],  // stdin
                    1 => ["pipe", "w"],  // stdout
                    2 => ["pipe", "w"]   // stderr
                ];

                $command = "php artisan seed:thread-messages {$startId} {$endId} {$batchSize}";
                $process = proc_open($command, $descriptorspec, $pipes[$i]);

                if (is_resource($process)) {
                    $processes[$i] = $process;
                    $this->info("Started thread {$i} (messages {$startId}-{$endId})");
                }
            }

            // Wait for all processes to complete
            $this->info("Waiting for all threads to complete...");
            $progressBar = $this->output->createProgressBar($threads);
            $progressBar->start();

            foreach ($processes as $i => $process) {
                $status = proc_get_status($process);
                while ($status['running']) {
                    usleep(100000); // Wait 100ms
                    $status = proc_get_status($process);
                }
                
                proc_close($process);
                $progressBar->advance();
                $this->info("Thread {$i} completed");
            }

            $progressBar->finish();
            $this->newLine();

        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $endTime = microtime(true);
        $this->info("Completed in " . round($endTime - $startTime, 2) . " seconds");
    }
}
