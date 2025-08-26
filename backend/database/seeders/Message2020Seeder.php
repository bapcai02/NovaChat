<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Message2020Seeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('users')->get();
        if ($users->isEmpty()) {
            $this->command->info('No users found. Skipping message 2020 seeder.');
            return;
        }

        // Create message 2020 as a parent message
        DB::table('messages')->insert([
            'id' => 2020,
            'channel_id' => 1,
            'user_id' => $users->random()->id,
            'parent_id' => null, // Make it a parent message
            'content' => '🎯 **Message 2020 - The Ultimate Thread Discussion!** This is going to be epic with tons of replies! Let\'s make this the most active thread ever! 💪',
            'type' => 'text',
            'metadata' => json_encode([
                'reactions' => [
                    ['emoji' => '🎯', 'count' => 8, 'users' => ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8']],
                    ['emoji' => '💪', 'count' => 5, 'users' => ['user1', 'user2', 'user3', 'user4', 'user5']],
                    ['emoji' => '🔥', 'count' => 12, 'users' => ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12']],
                ]
            ]),
            'is_edited' => false,
            'is_pinned' => true,
            'is_deleted' => false,
            'created_at' => now()->subHours(1),
            'updated_at' => now()->subHours(1),
        ]);

        $replyContents = [
            "This thread is absolutely incredible! I can't believe how active it is! 🚀",
            "I've been following this discussion and it's mind-blowing!",
            "This is the best thread I've ever seen in my life!",
            "I'm so excited to be part of this amazing conversation!",
            "This is going to break all records for thread activity!",
            "I can't wait to see how many replies we get!",
            "This is the definition of viral content!",
            "I'm sharing this thread with everyone I know!",
            "This is exactly what the internet was made for!",
            "I'm blown away by the quality of discussion here!",
            "This thread is pure gold! Thank you for starting it!",
            "I've been waiting for a thread like this forever!",
            "This is going to be legendary!",
            "I'm so glad I found this thread!",
            "This is the most engaging conversation ever!",
            "I can't stop reading all these amazing replies!",
            "This thread is a masterpiece!",
            "I'm learning so much from everyone here!",
            "This is the perfect example of great community discussion!",
            "I'm inspired by all the thoughtful responses!",
            "This thread is changing my perspective on everything!",
            "I'm so grateful to be part of this conversation!",
            "This is the kind of content that makes the internet worth it!",
            "I'm amazed by the depth of discussion here!",
            "This thread is a work of art!",
            "I can't believe how much value is in this conversation!",
            "This is the best use of my time today!",
            "I'm so impressed by everyone's contributions!",
            "This thread is pure excellence!",
            "I'm going to bookmark this for future reference!",
            "This is the most valuable thread I've ever read!",
            "I'm so excited to see where this discussion goes!",
            "This thread is a game-changer!",
            "I'm telling all my friends about this thread!",
            "This is the kind of content that makes a difference!",
            "I'm so happy to be part of this amazing community!",
            "This thread is absolutely phenomenal!",
            "I can't get enough of this discussion!",
            "This is the highlight of my day!",
            "I'm so impressed by the level of engagement!",
            "This thread is a masterpiece of human interaction!",
            "I'm learning something new with every reply!",
            "This is the perfect example of meaningful discussion!",
            "I'm so grateful for everyone's insights!",
            "This thread is pure magic!",
            "I can't believe how much wisdom is shared here!",
            "This is the kind of content that changes lives!",
            "I'm so inspired by this conversation!",
            "This thread is absolutely brilliant!",
            "I'm going to remember this discussion forever!",
            "This is the most valuable thread on the internet!",
        ];

        $reactions = [
            ['emoji' => '👍', 'count' => 3, 'users' => ['user1', 'user2', 'user3']],
            ['emoji' => '❤️', 'count' => 2, 'users' => ['user4', 'user5']],
            ['emoji' => '🚀', 'count' => 4, 'users' => ['user1', 'user2', 'user3', 'user4']],
            ['emoji' => '👏', 'count' => 2, 'users' => ['user5', 'user6']],
            ['emoji' => '🎉', 'count' => 3, 'users' => ['user1', 'user2', 'user3']],
            ['emoji' => '🔥', 'count' => 2, 'users' => ['user4', 'user5']],
            ['emoji' => '💯', 'count' => 1, 'users' => ['user6']],
            ['emoji' => '✨', 'count' => 2, 'users' => ['user1', 'user2']],
            ['emoji' => '🌟', 'count' => 1, 'users' => ['user3']],
            ['emoji' => '🎯', 'count' => 2, 'users' => ['user4', 'user5']],
            ['emoji' => '💪', 'count' => 1, 'users' => ['user6']],
            ['emoji' => '🏆', 'count' => 1, 'users' => ['user1']],
        ];

        // Create 100 replies to message 2020
        for ($i = 0; $i < 100; $i++) {
            $user = $users->random();
            $content = $replyContents[array_rand($replyContents)];
            
            // Add some variety to the content
            if (rand(1, 3) === 1) {
                $content = "**" . $content . "**";
            } elseif (rand(1, 3) === 1) {
                $content = "*" . $content . "*";
            } elseif (rand(1, 5) === 1) {
                $content = "`" . $content . "`";
            }

            $metadata = [];
            
            // Add reactions to most replies
            if (rand(1, 2) === 1) {
                $metadata['reactions'] = [$reactions[array_rand($reactions)]];
            }

            // Add attachments to some replies
            if (rand(1, 5) === 1) {
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
            $readCount = rand(0, min(8, $users->count() - 1));
            for ($j = 0; $j < $readCount; $j++) {
                $readUser = $users->random();
                $metadata['read_by'][] = [
                    'id' => $readUser->id,
                    'name' => $readUser->name,
                    'read_at' => now()->subMinutes(rand(1, 60))->toISOString()
                ];
            }

            DB::table('messages')->insert([
                'channel_id' => 1,
                'user_id' => $user->id,
                'parent_id' => 2020, // Reply to message 2020
                'content' => $content,
                'type' => 'text',
                'metadata' => json_encode($metadata),
                'is_edited' => rand(1, 15) === 1, // 7% chance of being edited
                'is_pinned' => false,
                'is_deleted' => false,
                'created_at' => now()->subMinutes(rand(1, 60)), // Within last hour
                'updated_at' => now()->subMinutes(rand(1, 60)),
            ]);
        }

        $this->command->info('Message 2020 created as parent message with 100 replies!');
    }
}
