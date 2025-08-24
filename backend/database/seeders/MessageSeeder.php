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

        // Sample messages for general channel
        $generalMessages = [
            [
                'content' => 'Welcome everyone to NovaChat! 🎉',
                'user_id' => 1, // Admin
                'type' => 'text',
                'created_at' => now()->subDays(2)->subHours(2),
            ],
            [
                'content' => 'Thanks for the welcome! Excited to be here.',
                'user_id' => 2, // John Doe
                'type' => 'text',
                'created_at' => now()->subDays(2)->subHours(1)->subMinutes(30),
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
            Message::create(array_merge($messageData, [
                'channel_id' => $generalChannel->id,
                'metadata' => json_encode([]),
                'updated_at' => $messageData['created_at'],
            ]));
        }

        // Create messages for random channel
        foreach ($randomMessages as $messageData) {
            Message::create(array_merge($messageData, [
                'channel_id' => $randomChannel->id,
                'metadata' => json_encode([]),
                'updated_at' => $messageData['created_at'],
            ]));
        }

        // Create messages for development channel
        foreach ($developmentMessages as $messageData) {
            Message::create(array_merge($messageData, [
                'channel_id' => $developmentChannel->id,
                'metadata' => json_encode([]),
                'updated_at' => $messageData['created_at'],
            ]));
        }

        $this->command->info('Messages seeded successfully!');
    }
}
