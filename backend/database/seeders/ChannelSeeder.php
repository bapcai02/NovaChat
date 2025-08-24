<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domain\Channel\Entities\Channel;
use App\Domain\Channel\Entities\ChannelMember;
use App\Domain\User\Entities\User;

class ChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample channels
        $channels = [
            [
                'name' => 'general',
                'display_name' => 'General',
                'description' => 'General discussion for all team members',
                'type' => 'public',
                'topic' => 'Welcome to the general channel!',
                'created_by' => 1, // Admin user
                'permissions' => json_encode([
                    'read' => true,
                    'write' => true,
                    'admin' => false
                ])
            ],
            [
                'name' => 'random',
                'display_name' => 'Random',
                'description' => 'Random conversations and fun stuff',
                'type' => 'public',
                'topic' => 'Share memes, jokes, and random thoughts here!',
                'created_by' => 2, // John Doe
                'permissions' => json_encode([
                    'read' => true,
                    'write' => true,
                    'admin' => false
                ])
            ],
            [
                'name' => 'development',
                'display_name' => 'Development',
                'description' => 'Development discussions and code reviews',
                'type' => 'public',
                'topic' => 'Discuss development topics, share code, and get help',
                'created_by' => 1, // Admin user
                'permissions' => json_encode([
                    'read' => true,
                    'write' => true,
                    'admin' => false
                ])
            ],
            [
                'name' => 'design',
                'display_name' => 'Design',
                'description' => 'Design team discussions and feedback',
                'type' => 'public',
                'topic' => 'Share design mockups, get feedback, and discuss UX',
                'created_by' => 3, // Mike Johnson (UX Designer)
                'permissions' => json_encode([
                    'read' => true,
                    'write' => true,
                    'admin' => false
                ])
            ],
            [
                'name' => 'marketing',
                'display_name' => 'Marketing',
                'description' => 'Marketing team private discussions',
                'type' => 'private',
                'topic' => 'Internal marketing strategy and planning',
                'created_by' => 2, // John Doe
                'permissions' => json_encode([
                    'read' => true,
                    'write' => true,
                    'admin' => false
                ])
            ],
        ];

        foreach ($channels as $channelData) {
            $channel = Channel::create($channelData);

            // Add creator as admin member
            ChannelMember::create([
                'channel_id' => $channel->id,
                'user_id' => $channel->created_by,
                'role' => 'admin',
                'joined_at' => now()
            ]);

            // Add all users to public channels
            if ($channel->type === 'public') {
                $users = User::where('id', '!=', $channel->created_by)->get();
                foreach ($users as $user) {
                    ChannelMember::create([
                        'channel_id' => $channel->id,
                        'user_id' => $user->id,
                        'role' => 'member',
                        'joined_at' => now()
                    ]);
                }
            }

            // Add specific users to private channels
            if ($channel->type === 'private') {
                // Add a few specific users to marketing channel
                $marketingUsers = [3, 4, 5]; // Mike, Sarah, David
                foreach ($marketingUsers as $userId) {
                    if ($userId != $channel->created_by) {
                        ChannelMember::create([
                            'channel_id' => $channel->id,
                            'user_id' => $userId,
                            'role' => 'member',
                            'joined_at' => now()
                        ]);
                    }
                }
            }
        }

        $this->command->info('Channels seeded successfully!');
    }
}
