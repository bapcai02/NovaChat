<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\Channel;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\Bookmark;
use Illuminate\Support\Facades\Hash;

class ChatDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create users
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'username' => 'john_doe',
                'password' => Hash::make('password'),
                'avatar' => 'https://ui-avatars.com/api/?name=John+Doe&background=random',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'username' => 'jane_smith',
                'password' => Hash::make('password'),
                'avatar' => 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
            ],
            [
                'name' => 'Mike Johnson',
                'email' => 'mike@example.com',
                'username' => 'mike_johnson',
                'password' => Hash::make('password'),
                'avatar' => 'https://ui-avatars.com/api/?name=Mike+Johnson&background=random',
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(['email' => $userData['email']], $userData);
        }

        $john = User::where('email', 'john@example.com')->first();
        $jane = User::where('email', 'jane@example.com')->first();
        $mike = User::where('email', 'mike@example.com')->first();

        // Create teams
        $teams = [
            [
                'name' => 'Development Team',
                'description' => 'Main development team',
                'slug' => 'dev-team',
                'owner_id' => $john->id,
                'is_private' => false,
            ],
            [
                'name' => 'Design Team',
                'description' => 'UI/UX design team',
                'slug' => 'design-team',
                'owner_id' => $jane->id,
                'is_private' => false,
            ],
        ];

        foreach ($teams as $teamData) {
            Team::firstOrCreate(['slug' => $teamData['slug']], $teamData);
        }

        $devTeam = Team::where('slug', 'dev-team')->first();
        $designTeam = Team::where('slug', 'design-team')->first();

        // Create team members
        $teamMembers = [
            ['team_id' => $devTeam->id, 'user_id' => $john->id, 'role' => 'owner'],
            ['team_id' => $devTeam->id, 'user_id' => $jane->id, 'role' => 'admin'],
            ['team_id' => $devTeam->id, 'user_id' => $mike->id, 'role' => 'member'],
            ['team_id' => $designTeam->id, 'user_id' => $jane->id, 'role' => 'owner'],
            ['team_id' => $designTeam->id, 'user_id' => $mike->id, 'role' => 'member'],
        ];

        foreach ($teamMembers as $memberData) {
            TeamMember::firstOrCreate([
                'team_id' => $memberData['team_id'],
                'user_id' => $memberData['user_id']
            ], $memberData);
        }

        // Create channels
        $channels = [
            [
                'name' => 'general',
                'description' => 'General discussion',
                'slug' => 'general',
                'team_id' => $devTeam->id,
                'is_private' => false,
            ],
            [
                'name' => 'frontend',
                'description' => 'Frontend discussions',
                'slug' => 'frontend',
                'team_id' => $devTeam->id,
                'is_private' => false,
            ],
        ];

        foreach ($channels as $channelData) {
            Channel::firstOrCreate([
                'team_id' => $channelData['team_id'],
                'slug' => $channelData['slug']
            ], $channelData);
        }

        $generalChannel = Channel::where('slug', 'general')->first();
        $frontendChannel = Channel::where('slug', 'frontend')->first();

        // Create conversations
        $conversations = [
            // Direct conversations
            ['type' => 'direct', 'name' => null, 'team_id' => null, 'channel_id' => null, 'metadata' => null],
            ['type' => 'direct', 'name' => null, 'team_id' => null, 'channel_id' => null, 'metadata' => null],
            // Channel conversations
            ['type' => 'channel', 'name' => null, 'team_id' => $devTeam->id, 'channel_id' => $generalChannel->id, 'metadata' => null],
            ['type' => 'channel', 'name' => null, 'team_id' => $devTeam->id, 'channel_id' => $frontendChannel->id, 'metadata' => null],
        ];

        foreach ($conversations as $conversationData) {
            Conversation::create($conversationData);
        }

        $directConv1 = Conversation::where('type', 'direct')->first();
        $directConv2 = Conversation::where('type', 'direct')->skip(1)->first();
        $generalConv = Conversation::where('channel_id', $generalChannel->id)->first();
        $frontendConv = Conversation::where('channel_id', $frontendChannel->id)->first();

        // Create conversation members
        $conversationMembers = [
            ['conversation_id' => $directConv1->id, 'user_id' => $john->id, 'joined_at' => now()],
            ['conversation_id' => $directConv1->id, 'user_id' => $jane->id, 'joined_at' => now()],
            ['conversation_id' => $directConv2->id, 'user_id' => $john->id, 'joined_at' => now()],
            ['conversation_id' => $directConv2->id, 'user_id' => $mike->id, 'joined_at' => now()],
            ['conversation_id' => $generalConv->id, 'user_id' => $john->id, 'joined_at' => now()],
            ['conversation_id' => $generalConv->id, 'user_id' => $jane->id, 'joined_at' => now()],
            ['conversation_id' => $generalConv->id, 'user_id' => $mike->id, 'joined_at' => now()],
            ['conversation_id' => $frontendConv->id, 'user_id' => $john->id, 'joined_at' => now()],
            ['conversation_id' => $frontendConv->id, 'user_id' => $jane->id, 'joined_at' => now()],
        ];

        foreach ($conversationMembers as $memberData) {
            ConversationMember::firstOrCreate([
                'conversation_id' => $memberData['conversation_id'],
                'user_id' => $memberData['user_id']
            ], $memberData);
        }

        // Create messages
        $messages = [
            [
                'user_id' => $john->id,
                'conversation_id' => $directConv1->id,
                'channel_id' => null,
                'parent_id' => null,
                'content' => 'Hey Jane! How are you doing?',
                'type' => 'text',
                'metadata' => null,
                'created_at' => now()->subHours(2),
            ],
            [
                'user_id' => $jane->id,
                'conversation_id' => $directConv1->id,
                'channel_id' => null,
                'parent_id' => null,
                'content' => 'Hi John! I am doing great, thanks for asking.',
                'type' => 'text',
                'metadata' => null,
                'created_at' => now()->subHours(1),
            ],
            [
                'user_id' => $john->id,
                'conversation_id' => $generalConv->id,
                'channel_id' => $generalChannel->id,
                'parent_id' => null,
                'content' => 'Good morning team! Let us start our daily standup.',
                'type' => 'text',
                'metadata' => null,
                'created_at' => now()->subHours(3),
            ],
            [
                'user_id' => $jane->id,
                'conversation_id' => $generalConv->id,
                'channel_id' => $generalChannel->id,
                'parent_id' => null,
                'content' => 'Morning! I will be working on the UI components today.',
                'type' => 'text',
                'metadata' => null,
                'created_at' => now()->subHours(2),
            ],
            [
                'user_id' => $mike->id,
                'conversation_id' => $generalConv->id,
                'channel_id' => $generalChannel->id,
                'parent_id' => null,
                'content' => 'I will be focusing on the API endpoints.',
                'type' => 'text',
                'metadata' => null,
                'created_at' => now()->subHours(1),
            ],
        ];

        foreach ($messages as $messageData) {
            Message::create($messageData);
        }

        // Create some message reactions
        $reactions = [
            ['message_id' => 1, 'user_id' => $jane->id, 'emoji' => '👍'],
            ['message_id' => 3, 'user_id' => $jane->id, 'emoji' => '👋'],
            ['message_id' => 3, 'user_id' => $mike->id, 'emoji' => '👋'],
        ];

        foreach ($reactions as $reactionData) {
            MessageReaction::firstOrCreate($reactionData);
        }

        // Create some bookmarks
        $bookmarks = [
            ['user_id' => $john->id, 'message_id' => 3, 'note' => 'Daily standup reminder'],
            ['user_id' => $jane->id, 'message_id' => 1, 'note' => 'Important conversation'],
        ];

        foreach ($bookmarks as $bookmarkData) {
            Bookmark::firstOrCreate($bookmarkData);
        }

        $this->command->info('Chat data seeded successfully!');
        $this->command->info('Created: 3 users, 2 teams, 2 channels, 4 conversations, 5 messages, 3 reactions, 2 bookmarks');
    }
}
