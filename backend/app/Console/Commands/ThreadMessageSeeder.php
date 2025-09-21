<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Models\ConversationMember;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ThreadMessageSeeder extends Command
{
    protected $signature = 'seed:thread-messages {start} {end} {batchSize}';
    protected $description = 'Create messages for a specific range (used by parallel seeder)';

    private $faker;

    public function __construct()
    {
        parent::__construct();
        $this->faker = Faker::create();
    }

    public function handle()
    {
        $start = (int) $this->argument('start');
        $end = (int) $this->argument('end');
        $batchSize = (int) $this->argument('batchSize');

        $this->info("Thread creating messages {$start}-{$end} with batch size {$batchSize}");

        // Get conversations
        $conversations = Conversation::all();
        $messagesPerConv = intval(($end - $start) / $conversations->count());

        $messages = [];
        $created = 0;

        foreach ($conversations as $conversation) {
            $convMembers = ConversationMember::where('conversation_id', $conversation->id)->pluck('user_id')->toArray();
            if (empty($convMembers)) continue;

            $msgCount = $this->faker->numberBetween($messagesPerConv / 2, $messagesPerConv * 2);
            
            for ($i = 0; $i < $msgCount && $created < ($end - $start); $i++) {
                $messages[] = [
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

                // Bulk insert when batch is full
                if (count($messages) >= $batchSize) {
                    DB::table('messages')->insert($messages);
                    $this->info("Inserted batch of " . count($messages) . " messages");
                    $messages = [];
                }
            }
        }

        // Insert remaining messages
        if (!empty($messages)) {
            DB::table('messages')->insert($messages);
            $this->info("Inserted final batch of " . count($messages) . " messages");
        }

        $this->info("Thread completed. Created {$created} messages");
    }
}
