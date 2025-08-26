<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Message901Seeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('users')->get();
        if ($users->isEmpty()) {
            $this->command->info('No users found. Skipping message 901 seeder.');
            return;
        }

        // Delete existing message 901 if it exists
        DB::table('messages')->where('id', 901)->delete();

        // Create message 901 as a parent message
        DB::table('messages')->insert([
            'id' => 901,
            'channel_id' => 1,
            'user_id' => $users->random()->id,
            'parent_id' => null, // Make it a parent message
            'content' => '🚀 **This is message 901 - a special parent message with many replies!** Let\'s discuss this amazing feature!',
            'type' => 'text',
            'metadata' => json_encode([
                'reactions' => [
                    ['emoji' => '🚀', 'count' => 5, 'users' => ['user1', 'user2', 'user3', 'user4', 'user5']],
                    ['emoji' => '❤️', 'count' => 3, 'users' => ['user1', 'user2', 'user3']],
                ]
            ]),
            'is_edited' => false,
            'is_pinned' => true,
            'is_deleted' => false,
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(2),
        ]);

        $replyContents = [
            "This is absolutely amazing! I love this feature! 🎉",
            "I can't believe how well this works! Great job team!",
            "This is exactly what we needed! Thank you so much!",
            "I've been waiting for this feature for months!",
            "This is going to revolutionize our workflow!",
            "I'm so excited to start using this!",
            "This is a game-changer for our productivity!",
            "I can't wait to show this to the rest of the team!",
            "This is the best feature I've seen in a long time!",
            "I'm impressed with the attention to detail!",
            "This will save us hours of work every day!",
            "The user experience is incredible!",
            "I love how intuitive this is!",
            "This is exactly the solution we were looking for!",
            "I'm blown away by how well this works!",
            "This is going to make our lives so much easier!",
            "I can't believe how fast this is!",
            "The performance is outstanding!",
            "This is exactly what the market needs!",
            "I'm so glad we implemented this feature!",
            "This is going to be a huge success!",
            "I can't wait to see what else you have planned!",
            "This is the future of our platform!",
            "I'm excited to see how this evolves!",
            "This is going to attract so many new users!",
            "I love the design and functionality!",
            "This is exactly what our customers want!",
            "I'm so proud to be part of this team!",
            "This is going to set us apart from the competition!",
            "I can't wait to start using this in production!",
        ];

        $reactions = [
            ['emoji' => '👍', 'count' => 2, 'users' => ['user1', 'user2']],
            ['emoji' => '❤️', 'count' => 1, 'users' => ['user3']],
            ['emoji' => '🚀', 'count' => 3, 'users' => ['user1', 'user4', 'user5']],
            ['emoji' => '👏', 'count' => 1, 'users' => ['user2']],
            ['emoji' => '🎉', 'count' => 2, 'users' => ['user1', 'user3']],
            ['emoji' => '🔥', 'count' => 1, 'users' => ['user4']],
            ['emoji' => '💯', 'count' => 1, 'users' => ['user5']],
            ['emoji' => '✨', 'count' => 1, 'users' => ['user1']],
            ['emoji' => '🌟', 'count' => 1, 'users' => ['user2']],
        ];

        // Create 50 replies to message 901
        for ($i = 0; $i < 50; $i++) {
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
                'parent_id' => 901, // Reply to message 901
                'content' => $content,
                'type' => 'text',
                'metadata' => json_encode($metadata),
                'is_edited' => rand(1, 10) === 1, // 10% chance of being edited
                'is_pinned' => false,
                'is_deleted' => false,
                'created_at' => now()->subMinutes(rand(1, 120)), // Within last 2 hours
                'updated_at' => now()->subMinutes(rand(1, 120)),
            ]);
        }

        $this->command->info('Message 901 created as parent message with 50 replies!');
    }
}
