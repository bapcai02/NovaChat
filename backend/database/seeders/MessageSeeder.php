<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domain\Message\Entities\Message;
use App\Domain\Channel\Entities\Channel;
use App\Domain\User\Entities\User;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $generalChannel = Channel::where('name', 'general')->first();
        $randomChannel = Channel::where('name', 'random')->first();
        $developmentChannel = Channel::where('name', 'development')->first();

        if (!$generalChannel || !$randomChannel || !$developmentChannel) {
            $this->command->error('Channels not found. Please run ChannelSeeder first.');
            return;
        }

        // Sample messages for general channel with rich metadata
        $generalMessages = [
            [
                'content' => 'Welcome everyone to NovaChat! 🎉',
                'user_id' => 1, // Admin
                'type' => 'text',
                'created_at' => now()->subDays(2)->subHours(2),
                'metadata' => [
                    'reactions' => [ ['emoji' => '👍', 'count' => 3] ],
                    'read_by' => [1,2,3,4],
                ],
            ],
            [
                'content' => 'Thanks for the welcome! Excited to be here.',
                'user_id' => 2, // John Doe
                'type' => 'text',
                'created_at' => now()->subDays(2)->subHours(1)->subMinutes(30),
                'metadata' => [
                    'reactions' => [ ['emoji' => '🎉', 'count' => 1] ],
                ],
            ],
            [
                'content' => 'This looks great! The UI is really clean.',
                'user_id' => 3, // Mike Johnson
                'type' => 'text',
                'created_at' => now()->subDays(2)->subHours(1)->subMinutes(15),
            ],
            [
                'content' => 'Agreed! The dark theme is perfect for late night coding sessions 😄',
                'user_id' => 4, // Sarah Wilson
                'type' => 'text',
                'created_at' => now()->subDays(2)->subHours(1),
            ],
            [
                'content' => 'Has anyone tried the voice message feature yet?',
                'user_id' => 5, // David Brown
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(3),
            ],
            [
                'content' => 'Yes! It works really well. Great for quick updates.',
                'user_id' => 6, // Emily Davis
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(2)->subMinutes(45),
            ],
            [
                'content' => 'Uploading latest mockups and docs.',
                'user_id' => 2,
                'type' => 'file',
                'created_at' => now()->subDays(1)->subHours(2),
                'metadata' => [
                    'attachments' => [[
                        'type' => 'file', 'url' => '#', 'name' => 'spec-v2.pdf', 'size' => '2.4 MB'
                    ]],
                    'reactions' => [ ['emoji' => '📄', 'count' => 1] ],
                ],
            ],
            [
                'content' => 'audio:mock-url',
                'user_id' => 3,
                'type' => 'system', // keep type allowed, put details in metadata
                'created_at' => now()->subDays(1)->subHours(1)->subMinutes(30),
                'metadata' => [
                    'type' => 'voice',
                    'duration' => 14,
                ],
            ],
        ];

        // Sample messages for random channel
        $randomMessages = [
            [
                'content' => 'Anyone else watching the new season of that show? 👀',
                'user_id' => 2, // John Doe
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(4),
            ],
            [
                'content' => 'Which show are you talking about?',
                'user_id' => 7, // Alex Chen
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(3)->subMinutes(30),
            ],
            [
                'content' => 'The one with the dragons and politics 😏',
                'user_id' => 2, // John Doe
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(3)->subMinutes(15),
            ],
            [
                'content' => 'Oh! I love that show! The new season is amazing!',
                'user_id' => 8, // Lisa Garcia
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(3),
            ],
            [
                'content' => 'Spoiler alert: I just finished episode 5 and... 😱',
                'user_id' => 9, // Tom Wilson
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(2)->subMinutes(30),
            ],
            [
                'content' => 'NO SPOILERS! I\'m only on episode 3! 🙈',
                'user_id' => 10, // Maria Rodriguez
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(2)->subMinutes(15),
            ],
        ];

        // Sample messages for development channel
        $developmentMessages = [
            [
                'content' => 'Hey team, I\'m working on the new authentication system. Any thoughts on the current implementation?',
                'user_id' => 1, // Admin
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(6),
            ],
            [
                'content' => 'I think we should consider using JWT tokens instead of session-based auth for better scalability.',
                'user_id' => 5, // David Brown
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(5)->subMinutes(45),
            ],
            [
                'content' => 'Good point! JWT would work better with our microservices architecture.',
                'user_id' => 7, // Alex Chen
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(5)->subMinutes(30),
            ],
            [
                'content' => 'I\'ve been looking into OAuth 2.0 as well. Could be useful for third-party integrations.',
                'user_id' => 4, // Sarah Wilson
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(5)->subMinutes(15),
            ],
            [
                'content' => 'Great suggestions! Let\'s create a design doc and discuss this in our next meeting.',
                'user_id' => 1, // Admin
                'type' => 'text',
                'created_at' => now()->subDays(1)->subHours(5),
            ],
            [
                'content' => 'I\'ll create a PR with the JWT implementation for review.',
                'user_id' => 5, // David Brown
                'type' => 'text',
                'created_at' => now()->subHours(2),
            ],
            [
                'content' => 'Perfect! I\'ll review it as soon as it\'s ready.',
                'user_id' => 6, // Emily Davis
                'type' => 'text',
                'created_at' => now()->subHours(1)->subMinutes(45),
            ],
        ];

        // Create messages for general channel
        foreach ($generalMessages as $messageData) {
            $meta = isset($messageData['metadata']) ? $messageData['metadata'] : [];
            unset($messageData['metadata']);
            Message::create(array_merge($messageData, [
                'channel_id' => $generalChannel->id,
                'metadata' => $meta,
                'updated_at' => $messageData['created_at'],
            ]));
        }

        // Create messages for random channel
        foreach ($randomMessages as $messageData) {
            Message::create(array_merge($messageData, [
                'channel_id' => $randomChannel->id,
                'metadata' => $messageData['metadata'] ?? [],
                'updated_at' => $messageData['created_at'],
            ]));
        }

        // Create messages for development channel
        foreach ($developmentMessages as $messageData) {
            Message::create(array_merge($messageData, [
                'channel_id' => $developmentChannel->id,
                'metadata' => $messageData['metadata'] ?? [],
                'updated_at' => $messageData['created_at'],
            ]));
        }

        // Generate additional mixed messages for general channel
        for ($i = 0; $i < 25; $i++) {
            $meta = [];
            $type = 'text';
            if ($i % 5 === 0) {
                $type = 'file';
                $meta['attachments'] = [[ 'type' => 'file', 'url' => '#', 'name' => 'file-'.$i.'.txt', 'size' => rand(1,5).'.0 MB' ]];
            } elseif ($i % 6 === 0) {
                $type = 'system';
                $meta['type'] = 'voice';
                $meta['duration'] = 8 + ($i % 12);
            }
            $meta['reactions'] = $i % 3 === 0 ? [[ 'emoji' => '👍', 'count' => 1 + ($i % 4) ]] : [];
            $meta['read_by'] = [1,2,3,4];

            Message::create([
                'channel_id' => $generalChannel->id,
                'user_id' => 1 + ($i % 6),
                'parent_id' => null,
                'content' => $type === 'system' ? 'audio:mock-url' : 'Seeded message #'.($i+1).' with rich metadata',
                'type' => $type,
                'metadata' => $meta,
                'is_edited' => false,
                'is_pinned' => false,
                'created_at' => now()->subMinutes(120 - $i),
                'updated_at' => now()->subMinutes(120 - $i),
            ]);
        }

        $this->command->info('Messages seeded successfully!');
    }
}
