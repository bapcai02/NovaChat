<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Models\ConversationMember;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class FastMessageSeeder extends Command
{
    protected $signature = 'seed:fast-messages {--total=1000000} {--batch=5000} {--chunk=100}';
    protected $description = 'Create messages using optimized bulk insert with chunking';

    private $faker;

    public function __construct()
    {
        parent::__construct();
        $this->faker = Faker::create();
    }

    public function handle()
    {
        $total = (int) $this->option('total');
        $batchSize = (int) $this->option('batch');
        $chunkSize = (int) $this->option('chunk');

        $this->info("Creating {$total} messages with batch size {$batchSize}...");
        $startTime = microtime(true);

        // Disable foreign key checks and indexes temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::statement('ALTER TABLE messages DISABLE KEYS;');

        try {
            $conversations = Conversation::all();
            $messagesPerConv = intval($total / $conversations->count());
            
            $progressBar = $this->output->createProgressBar($total);
            $progressBar->start();

            $allMessages = [];
            $created = 0;

            foreach ($conversations as $conversation) {
                $convMembers = ConversationMember::where('conversation_id', $conversation->id)->pluck('user_id')->toArray();
                if (empty($convMembers)) continue;

                $msgCount = $this->faker->numberBetween($messagesPerConv / 2, $messagesPerConv * 2);
                
                for ($i = 0; $i < $msgCount && $created < $total; $i++) {
                    $allMessages[] = [
                        'user_id' => $this->faker->randomElement($convMembers),
                        'conversation_id' => $conversation->id,
                        'channel_id' => $conversation->channel_id,
                        'parent_id' => null,
                        'content' => $this->faker->sentence(),
                        'type' => 'text',
                        'metadata' => null,
                        'is_edited' => false,
                        'edited_at' => null,
                        'is_pinned' => false,
                        'is_deleted' => false,
                        'deleted_at' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    $created++;

                    // Insert in batches
                    if (count($allMessages) >= $batchSize) {
                        $this->insertBatch($allMessages, $chunkSize);
                        $progressBar->advance(count($allMessages));
                        $allMessages = [];
                    }
                }
            }

            // Insert remaining messages
            if (!empty($allMessages)) {
                $this->insertBatch($allMessages, $chunkSize);
                $progressBar->advance(count($allMessages));
            }

            $progressBar->finish();
            $this->newLine();

        } finally {
            // Re-enable indexes and foreign key checks
            DB::statement('ALTER TABLE messages ENABLE KEYS;');
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $endTime = microtime(true);
        $this->info("Created {$total} messages in " . round($endTime - $startTime, 2) . " seconds");
        $this->info("Rate: " . round($total / ($endTime - $startTime), 0) . " messages/second");
    }

    private function insertBatch(array $messages, int $chunkSize)
    {
        // Split into smaller chunks to avoid memory issues
        $chunks = array_chunk($messages, $chunkSize);
        
        foreach ($chunks as $chunk) {
            DB::table('messages')->insert($chunk);
        }
    }
}
