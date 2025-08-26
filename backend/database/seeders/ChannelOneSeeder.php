<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChannelOneSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure channel_id = 1 exists
        DB::table('channels')->insertOrIgnore([
            'id' => 1,
            'name' => 'general',
            'display_name' => 'General',
            'description' => 'General discussion channel',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $users = DB::table('users')->get();
        if ($users->isEmpty()) {
            $this->command->info('No users found. Skipping channel one seeder.');
            return;
        }

        $mainMessages = [
            "Hey everyone! Welcome to **NovaChat**! 🚀 This is going to be an *amazing* place for our team to collaborate.",
            "I've uploaded the latest design mockups for the new feature. Let me know what you think!",
            "Great work everyone! I can see the progress we've made. The new interface looks much cleaner.",
            "Don't forget about the meeting at **2 PM today**! We'll be discussing the Q4 roadmap.",
            "I'll prepare the presentation slides. Should I include the analytics data from last month?",
            "The new emoji reactions are so much fun! 🎉 I love how we can express ourselves better now.",
            "I agree! The performance improvements are *noticeable*. Much faster loading times.",
            "Can someone help me with the API integration? I'm getting a `404 error`.",
            "I can help with the API issue. What endpoint are you trying to access?",
            "The new features look fantastic! Can't wait to test them out.",
            "Let's schedule a code review session for tomorrow afternoon.",
            "I've found a bug in the authentication system. Should I create a ticket?",
            "The database migration is complete. All data has been successfully transferred.",
            "Great job on the UI improvements! The user experience is much better now.",
            "I'm working on the mobile app version. Should be ready for testing next week.",
            "The server deployment was successful. The new version is now live!",
            "I've updated the documentation with the latest API changes.",
            "The security audit is complete. All vulnerabilities have been addressed.",
            "Let's plan the next sprint. What features should we prioritize?",
            "The customer feedback has been overwhelmingly positive! 🎉",
        ];

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
            "This is a game-changer for our productivity!",
            "I've already started implementing this approach.",
            "The team will love this new feature.",
            "This addresses all the issues we've been discussing.",
            "I can't believe how much faster this is!",
            "The user interface is so intuitive now.",
            "This will save us hours of work every week.",
            "I'm impressed with the attention to detail.",
            "This is exactly the solution we needed.",
            "The performance improvements are incredible!",
        ];

        $reactions = [
            ['emoji' => '👍', 'count' => 2, 'users' => ['user1', 'user2']],
            ['emoji' => '❤️', 'count' => 1, 'users' => ['user3']],
            ['emoji' => '🚀', 'count' => 3, 'users' => ['user1', 'user4', 'user5']],
            ['emoji' => '👏', 'count' => 1, 'users' => ['user2']],
            ['emoji' => '🎉', 'count' => 2, 'users' => ['user1', 'user3']],
            ['emoji' => '🔥', 'count' => 1, 'users' => ['user4']],
            ['emoji' => '💯', 'count' => 1, 'users' => ['user5']],
        ];

        // Create main messages first
        $parentMessageIds = [];
        foreach ($mainMessages as $index => $content) {
            $user = $users->random();
            $metadata = [];
            
            // Add reactions to some main messages
            if (rand(1, 2) === 1) {
                $metadata['reactions'] = [$reactions[array_rand($reactions)]];
            }

            // Add attachments to some main messages
            if (rand(1, 4) === 1) {
                $metadata['attachments'] = [
                    [
                        'type' => 'file',
                        'url' => '#',
                        'name' => 'document-' . rand(1, 100) . '.pdf',
                        'size' => rand(100, 2000) . ' KB'
                    ]
                ];
            }

            $messageId = DB::table('messages')->insertGetId([
                'channel_id' => 1,
                'user_id' => $user->id,
                'parent_id' => null,
                'content' => $content,
                'type' => 'text',
                'metadata' => json_encode($metadata),
                'is_edited' => false,
                'is_pinned' => rand(1, 10) === 1, // 10% chance of being pinned
                'is_deleted' => false,
                'created_at' => now()->subMinutes(rand(1, 1440)),
                'updated_at' => now()->subMinutes(rand(1, 1440)),
            ]);
            
            $parentMessageIds[] = $messageId;
        }

        // Create many replies for each parent message
        foreach ($parentMessageIds as $parentId) {
            // Create 15-40 replies for each parent message
            $numReplies = rand(15, 40);
            
            for ($i = 0; $i < $numReplies; $i++) {
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
                
                // Add reactions to more replies
                if (rand(1, 2) === 1) {
                    $metadata['reactions'] = [$reactions[array_rand($reactions)]];
                }

                // Add attachments to some replies
                if (rand(1, 4) === 1) {
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
                $readCount = rand(0, min(5, $users->count() - 1));
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
                    'parent_id' => $parentId,
                    'content' => $content,
                    'type' => 'text',
                    'metadata' => json_encode($metadata),
                    'is_edited' => rand(1, 10) === 1, // 10% chance of being edited
                    'is_pinned' => false,
                    'is_deleted' => false,
                    'created_at' => now()->subMinutes(rand(1, 1440)),
                    'updated_at' => now()->subMinutes(rand(1, 1440)),
                ]);
            }
        }

        $this->command->info('Channel One (ID=1) seeded successfully with ' . count($parentMessageIds) . ' main messages and many replies!');
    }
}
