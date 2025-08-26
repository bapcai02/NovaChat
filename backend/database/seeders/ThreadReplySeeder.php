<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ThreadReplySeeder extends Seeder
{
    public function run(): void
    {
        // Get more existing messages to use as parent messages
        $parentMessages = DB::table('messages')
            ->whereNull('parent_id')
            ->where('channel_id', '>', 0)
            ->limit(20)
            ->get();

        if ($parentMessages->isEmpty()) {
            $this->command->info('No parent messages found. Skipping thread replies.');
            return;
        }

        $users = DB::table('users')->get();
        if ($users->isEmpty()) {
            $this->command->info('No users found. Skipping thread replies.');
            return;
        }

        $replyContents = [
            "Great idea! I'm excited to see how this develops. 🎉",
            "I'll start working on the implementation today.",
            "Perfect! Let me know if you need help with the design specs.",
            "I can help with testing once it's ready! 🧪",
            "Thanks everyone! I'll keep you all updated. 🚀",
            "This looks promising! Can't wait to see the results.",
            "I have some suggestions for improvement.",
            "Let's schedule a meeting to discuss this further.",
            "I'll review the code and provide feedback.",
            "This is exactly what we needed! 👍",
            "I'm on board with this approach.",
            "Let me know if you need any assistance.",
            "This will definitely improve our workflow.",
            "I'll share this with the team.",
            "Great progress so far!",
            "I have a question about the implementation.",
            "This is going to be really useful.",
            "I'll start working on my part right away.",
            "Let's make sure we test this thoroughly.",
            "I'm looking forward to seeing this in action!",
        ];

        $reactions = [
            ['emoji' => '👍', 'count' => 2, 'users' => ['user1', 'user2']],
            ['emoji' => '❤️', 'count' => 1, 'users' => ['user3']],
            ['emoji' => '🚀', 'count' => 3, 'users' => ['user1', 'user4', 'user5']],
            ['emoji' => '👏', 'count' => 1, 'users' => ['user2']],
            ['emoji' => '🎉', 'count' => 2, 'users' => ['user1', 'user3']],
        ];

        foreach ($parentMessages as $parentMessage) {
            // Create 8-25 replies for each parent message
            $numReplies = rand(8, 25);
            
            for ($i = 0; $i < $numReplies; $i++) {
                $user = $users->random();
                $content = $replyContents[array_rand($replyContents)];
                
                // Add some variety to the content
                if (rand(1, 3) === 1) {
                    $content = "**" . $content . "**";
                } elseif (rand(1, 3) === 1) {
                    $content = "*" . $content . "*";
                }

                $metadata = [];
                
                // Add reactions to more replies
                if (rand(1, 2) === 1) {
                    $metadata['reactions'] = [$reactions[array_rand($reactions)]];
                }

                // Add attachments to more replies
                if (rand(1, 3) === 1) {
                    $metadata['attachments'] = [
                        [
                            'type' => 'file',
                            'url' => '#',
                            'name' => 'document-' . rand(1, 100) . '.pdf',
                            'size' => rand(100, 2000) . ' KB'
                        ]
                    ];
                }

                // Add read_by information
                $metadata['read_by'] = [];
                $readCount = rand(0, min(3, $users->count() - 1));
                for ($j = 0; $j < $readCount; $j++) {
                    $readUser = $users->random();
                    $metadata['read_by'][] = [
                        'id' => $readUser->id,
                        'name' => $readUser->name,
                        'read_at' => now()->subMinutes(rand(1, 60))->toISOString()
                    ];
                }

                DB::table('messages')->insert([
                    'channel_id' => $parentMessage->channel_id,
                    'user_id' => $user->id,
                    'parent_id' => $parentMessage->id,
                    'content' => $content,
                    'type' => 'text',
                    'metadata' => json_encode($metadata),
                    'is_edited' => rand(1, 10) === 1, // 10% chance of being edited
                    'is_pinned' => false,
                    'is_deleted' => false,
                    'created_at' => now()->subMinutes(rand(1, 1440)), // Within last 24 hours
                    'updated_at' => now()->subMinutes(rand(1, 1440)),
                ]);
            }
        }

        $this->command->info('Thread replies seeded successfully!');
    }
}
