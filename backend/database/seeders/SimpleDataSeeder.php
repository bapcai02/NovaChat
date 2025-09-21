<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Message;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class SimpleDataSeeder extends Seeder
{
    private $faker;

    public function __construct()
    {
        $this->faker = Faker::create();
    }

    public function run(): void
    {
        $this->command->info('Creating 10k users and 1M messages...');
        $startTime = microtime(true);

        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Clear data
            $this->clearData();
            
            // Create users
            $this->createUsers();
            
            // Create teams
            $this->createTeams();
            
            // Create channels
            $this->createChannels();
            
            // Create conversations
            $this->createConversations();
            
            // Create messages
            $this->createMessages();

        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $endTime = microtime(true);
        $this->command->info('Completed in ' . round($endTime - $startTime, 2) . ' seconds');
    }

    private function clearData()
    {
        DB::statement('TRUNCATE TABLE messages');
        DB::statement('TRUNCATE TABLE conversation_members');
        DB::statement('TRUNCATE TABLE conversations');
        DB::statement('TRUNCATE TABLE channels');
        DB::statement('TRUNCATE TABLE team_members');
        DB::statement('TRUNCATE TABLE teams');
        DB::statement('TRUNCATE TABLE users');
    }

    private function createUsers()
    {
        $this->command->info('Creating 10,000 users...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(10000);
        $progressBar->start();
        
        for ($i = 0; $i < 10000; $i++) {
            $isAdmin = $i < 10; // First 10 users are admin
            User::create([
                'name' => $isAdmin ? "Admin " . ($i + 1) : $this->faker->name(),
                'email' => $isAdmin ? "admin{$i}@example.com" : "user{$i}@example.com",
                'username' => $isAdmin ? "admin{$i}" : "user{$i}",
                'password' => Hash::make('password'),
                'role' => $isAdmin ? 'admin' : 'user',
                'status' => 'active',
                'is_online' => $this->faker->boolean(30),
                'avatar' => 'https://ui-avatars.com/api/?name=' . ($isAdmin ? 'Admin' : 'User') . '&background=random',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine();
    }

    private function createTeams()
    {
        $this->command->info('Creating 50 teams...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(50);
        $progressBar->start();
        
        for ($i = 0; $i < 50; $i++) {
            Team::create([
                'name' => "Team " . ($i + 1),
                'description' => "Description for team " . ($i + 1),
                'slug' => "team-" . ($i + 1),
                'owner_id' => $this->faker->numberBetween(1, 10000),
                'is_private' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine();

        // Create team members
        $this->command->info('Creating team members...');
        $totalMembers = 0;
        for ($teamId = 1; $teamId <= 50; $teamId++) {
            $userCount = $this->faker->numberBetween(10, 50);
            $userIds = $this->faker->randomElements(range(1, 10000), $userCount);
            $totalMembers += $userCount;
        }
        
        $progressBar = $this->command->getOutput()->createProgressBar($totalMembers);
        $progressBar->start();
        
        for ($teamId = 1; $teamId <= 50; $teamId++) {
            $userCount = $this->faker->numberBetween(10, 50);
            $userIds = $this->faker->randomElements(range(1, 10000), $userCount);
            
            foreach ($userIds as $userId) {
                TeamMember::create([
                    'team_id' => $teamId,
                    'user_id' => $userId,
                    'role' => 'member',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $progressBar->advance();
            }
        }
        
        $progressBar->finish();
        $this->command->newLine();
    }

    private function createChannels()
    {
        $this->command->info('Creating 200 channels...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(200);
        $progressBar->start();
        
        for ($i = 0; $i < 200; $i++) {
            Channel::create([
                'name' => "channel-" . ($i + 1),
                'description' => "Channel " . ($i + 1),
                'slug' => "channel-" . ($i + 1),
                'team_id' => $this->faker->numberBetween(1, 50),
                'is_private' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine();
    }

    private function createConversations()
    {
        $this->command->info('Creating conversations...');
        
        $channels = Channel::all();
        $totalConversations = $channels->count() + 1000; // 200 channels + 1000 direct
        
        $progressBar = $this->command->getOutput()->createProgressBar($totalConversations);
        $progressBar->start();
        
        // Channel conversations
        foreach ($channels as $channel) {
            Conversation::create([
                'type' => 'channel',
                'name' => null,
                'team_id' => $channel->team_id,
                'channel_id' => $channel->id,
                'metadata' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $progressBar->advance();
        }

        // Direct conversations
        for ($i = 0; $i < 1000; $i++) {
            Conversation::create([
                'type' => 'direct',
                'name' => null,
                'team_id' => null,
                'channel_id' => null,
                'metadata' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine();

        // Create conversation members
        $this->command->info('Creating conversation members...');
        $conversations = Conversation::all();
        $totalMembers = 0;
        
        // Calculate total members first
        foreach ($conversations as $conversation) {
            if ($conversation->type === 'channel') {
                $teamMembers = TeamMember::where('team_id', $conversation->team_id)->pluck('user_id')->toArray();
                $totalMembers += min(10, count($teamMembers));
            } else {
                $totalMembers += 2;
            }
        }
        
        $progressBar = $this->command->getOutput()->createProgressBar($totalMembers);
        $progressBar->start();

        foreach ($conversations as $conversation) {
            if ($conversation->type === 'channel') {
                $teamMembers = TeamMember::where('team_id', $conversation->team_id)->pluck('user_id')->toArray();
                $userIds = $this->faker->randomElements($teamMembers, min(10, count($teamMembers)));
            } else {
                $userIds = $this->faker->randomElements(range(1, 10000), 2);
            }

            foreach ($userIds as $userId) {
                ConversationMember::create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $userId,
                    'joined_at' => now(),
                    'last_read_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $progressBar->advance();
            }
        }
        
        $progressBar->finish();
        $this->command->newLine();
    }

    private function createMessages()
    {
        $this->command->info('Creating 1,000,000 messages...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(1000000);
        $progressBar->start();
        
        $conversations = Conversation::all();
        $messagesPerConv = intval(1000000 / $conversations->count());

        foreach ($conversations as $conversation) {
            $convMembers = ConversationMember::where('conversation_id', $conversation->id)->pluck('user_id')->toArray();
            if (empty($convMembers)) continue;

            $msgCount = $this->faker->numberBetween($messagesPerConv / 2, $messagesPerConv * 2);
            
            for ($i = 0; $i < $msgCount; $i++) {
                Message::create([
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
                ]);

                $progressBar->advance();
            }
        }
        
        $progressBar->finish();
        $this->command->newLine();
    }
}
