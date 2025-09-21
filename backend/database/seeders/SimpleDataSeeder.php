<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use App\Models\User;
use App\Models\Team;
use App\Models\Channel;
use App\Models\Conversation;
use App\Models\TeamMember;
use App\Models\ConversationMember;

class SimpleDataSeeder extends Seeder
{
    private $faker;
    protected $command;

    public function __construct()
    {
        $this->faker = Faker::create();
    }

    public function run(): void
    {
        $this->command = $this->command ?? app('command');
        $this->command->info('Creating comprehensive test data...');
        $startTime = microtime(true);

        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Only clear data if not running multiple times
            // if (!app()->runningInConsole() || !$this->command->option('no-clear')) {
            //     $this->clearData();
            // }
            
            // Create users
            // $userCount = $this->createUsers();
            
            // Create teams
            // $teamCount = $this->createTeams();
            
            // Create channels
            // $channelCount = $this->createChannels();
            
            // Create conversations
            // $conversationCount = $this->createConversations();
            
            // Create team members
            // $teamMemberCount = $this->createTeamMembers();
            
            // Create conversation members
            // $conversationMemberCount = $this->createConversationMembers();
            
            // Create channel members
            // $channelMemberCount = $this->createChannelMembers();
            
            // Create messages
            // $messageCount = $this->createMessages();
            
            // Create message reactions
            $messageReactionCount = $this->createMessageReactions();
            
            // Create message reads
            // $messageReadCount = $this->createMessageReads();

        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $endTime = microtime(true);
        
        $this->command->info("\n=== INSERT SUMMARY ===");
        $this->command->info("Users created: 0 (skipped)");
        $this->command->info("Teams created: 0 (skipped)");
        $this->command->info("Channels created: 0 (skipped)");
        $this->command->info("Conversations created: 0 (skipped)");
        $this->command->info("Team members created: 0 (skipped)");
        $this->command->info("Conversation members created: 0 (skipped)");
        $this->command->info("Channel members created: 0 (skipped)");
        $this->command->info("Messages created: 0 (skipped)");
        $this->command->info("Message reactions created: {$messageReactionCount}");
        $this->command->info("Message reads created: 0 (skipped)");
        $this->command->info("Total time: " . round($endTime - $startTime, 2) . " seconds");
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
        
        // Get current max user ID to avoid conflicts
        $maxUserId = DB::table('users')->max('id') ?? 0;
        $startId = $maxUserId + 1;
        $createdCount = 0;
        
        for ($i = 0; $i < 10000; $i++) {
            $currentId = $startId + $i;
            $isAdmin = $i < 10; // First 10 users are admin
            
            try {
                User::create([
                    'name' => $isAdmin ? "Admin " . $currentId : $this->faker->name(),
                    'email' => $isAdmin ? "admin{$currentId}@example.com" : "user{$currentId}@example.com",
                    'username' => $isAdmin ? "admin{$currentId}" : "user{$currentId}",
                    'password' => Hash::make('password'),
                    'role' => $isAdmin ? 'admin' : 'user',
                    'status' => 'active',
                    'is_online' => $this->faker->boolean(30),
                    'avatar' => 'https://ui-avatars.com/api/?name=' . ($isAdmin ? 'Admin' : 'User') . '&background=random',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $createdCount++;
            } catch (\Exception $e) {
                // Skip if user already exists
                $this->command->warn("User {$currentId} already exists, skipping...");
            }

            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine();
        return $createdCount;
    }

    private function createTeams()
    {
        $this->command->info('Creating 50 teams...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(50);
        $progressBar->start();
        
        // Get current max team ID to avoid conflicts
        $maxTeamId = DB::table('teams')->max('id') ?? 0;
        $startId = $maxTeamId + 1;
        $createdCount = 0;
        
        for ($i = 0; $i < 50; $i++) {
            $currentId = $startId + $i;
            
            try {
                Team::create([
                    'name' => "Team " . $currentId,
                    'description' => "Description for team " . $currentId,
                    'slug' => "team-" . $currentId,
                    'owner_id' => $this->faker->numberBetween(1, 10000),
                    'is_private' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $createdCount++;
            } catch (\Exception $e) {
                $this->command->warn("Team {$currentId} already exists, skipping...");
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine();
        return $createdCount;
    }

    private function createChannels()
    {
        $this->command->info('Creating 200 channels...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(200);
        $progressBar->start();
        
        // Get current max channel ID to avoid conflicts
        $maxChannelId = DB::table('channels')->max('id') ?? 0;
        $startId = $maxChannelId + 1;
        $createdCount = 0;
        
        for ($i = 0; $i < 200; $i++) {
            $currentId = $startId + $i;
            
            try {
                Channel::create([
                    'name' => "Channel " . $currentId,
                    'description' => "Description for channel " . $currentId,
                    'team_id' => $this->faker->numberBetween(1, 50),
                    'is_private' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $createdCount++;
            } catch (\Exception $e) {
                $this->command->warn("Channel {$currentId} already exists, skipping...");
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine();
        return $createdCount;
    }

    private function createConversations()
    {
        $this->command->info('Creating 500 conversations...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(500);
        $progressBar->start();
        
        // Get current max conversation ID to avoid conflicts
        $maxConvId = DB::table('conversations')->max('id') ?? 0;
        $startId = $maxConvId + 1;
        $createdCount = 0;
        
        for ($i = 0; $i < 500; $i++) {
            $currentId = $startId + $i;
            
            try {
                Conversation::create([
                    'title' => "Conversation " . $currentId,
                    'type' => $this->faker->randomElement(['channel', 'direct']),
                    'team_id' => $this->faker->numberBetween(1, 50),
                    'channel_id' => $this->faker->numberBetween(1, 200),
                    'created_by' => $this->faker->numberBetween(1, 10000),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $createdCount++;
            } catch (\Exception $e) {
                $this->command->warn("Conversation {$currentId} already exists, skipping...");
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine();
        return $createdCount;
    }

    private function createTeamMembers()
    {
        $this->command->info('Creating team members...');
        
        $teams = Team::all();
        $users = User::all();
        $totalMembers = 0;
        
        foreach ($teams as $team) {
            $userCount = $this->faker->numberBetween(10, 50);
            $selectedUsers = $users->random($userCount);
            $totalMembers += $userCount;
        }
        
        $progressBar = $this->command->getOutput()->createProgressBar($totalMembers);
        $progressBar->start();
        $createdCount = 0;
        
        foreach ($teams as $team) {
            $userCount = $this->faker->numberBetween(10, 50);
            $selectedUsers = $users->random($userCount);
            
            foreach ($selectedUsers as $user) {
                try {
                    TeamMember::create([
                        'team_id' => $team->id,
                        'user_id' => $user->id,
                        'role' => 'member',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $createdCount++;
                } catch (\Exception $e) {
                    // Skip if already exists
                }
                
                $progressBar->advance();
            }
        }
        
        $progressBar->finish();
        $this->command->newLine();
        return $createdCount;
    }

    private function createConversationMembers()
    {
        $this->command->info('Creating conversation members...');
        
        $conversations = Conversation::all();
        $users = User::all();
        $totalMembers = 0;
        
        foreach ($conversations as $conversation) {
            $userCount = $this->faker->numberBetween(5, 20);
            $totalMembers += $userCount;
        }
        
        $progressBar = $this->command->getOutput()->createProgressBar($totalMembers);
        $progressBar->start();
        $createdCount = 0;
        
        foreach ($conversations as $conversation) {
            $userCount = $this->faker->numberBetween(5, 20);
            $selectedUsers = $users->random($userCount);
            
            foreach ($selectedUsers as $user) {
                try {
                    ConversationMember::create([
                        'conversation_id' => $conversation->id,
                        'user_id' => $user->id,
                        'joined_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $createdCount++;
                } catch (\Exception $e) {
                    // Skip if already exists
                }
                
                $progressBar->advance();
            }
        }
        
        $progressBar->finish();
        $this->command->newLine();
        return $createdCount;
    }

    private function createMessages()
    {
        $this->command->info('Creating 1,000,000 messages with bulk insert...');

        $startTime = microtime(true);
        $conversations = Conversation::all();
        $messagesPerConv = intval(1000000 / $conversations->count());
        $batchSize = 1000; // Insert 1000 messages at a time
        $totalMessages = 0;

        $progressBar = $this->command->getOutput()->createProgressBar(1000000);
        $progressBar->start();

        foreach ($conversations as $conversation) {
            $convMembers = ConversationMember::where('conversation_id', $conversation->id)->pluck('user_id')->toArray();
            if (empty($convMembers)) continue;

            $msgCount = $this->faker->numberBetween($messagesPerConv / 2, $messagesPerConv * 2);
            $messages = [];

            for ($i = 0; $i < $msgCount; $i++) {
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

                // Bulk insert when batch is full
                if (count($messages) >= $batchSize) {
                    DB::table('messages')->insert($messages);
                    $totalMessages += count($messages);
                    $progressBar->advance(count($messages));
                    $messages = []; // Reset batch
                }
            }

            // Insert remaining messages
            if (!empty($messages)) {
                DB::table('messages')->insert($messages);
                $totalMessages += count($messages);
                $progressBar->advance(count($messages));
            }
        }

        $progressBar->finish();
        $this->command->newLine();

        $endTime = microtime(true);
        $this->command->info("Created {$totalMessages} messages in " . round($endTime - $startTime, 2) . " seconds");
        
        return $totalMessages;
    }

    private function createChannelMembers()
    {
        $this->command->info('Creating channel members with bulk insert...');
        
        // Get all channels and users
        $channels = DB::table('channels')->pluck('id')->toArray();
        $users = DB::table('users')->pluck('id')->toArray();
        
        if (empty($channels) || empty($users)) {
            $this->command->warn('No channels or users found, skipping channel members creation');
            return 0;
        }
        
        $this->command->info("Found " . count($channels) . " channels and " . count($users) . " users");
        
        $channelMembers = [];
        $createdCount = 0;
        
        // For each channel, add 5-20 random members
        foreach ($channels as $channelId) {
            $memberCount = $this->faker->numberBetween(5, 20);
            $selectedUsers = $this->faker->randomElements($users, min($memberCount, count($users)));
            
            foreach ($selectedUsers as $userId) {
                $channelMembers[] = [
                    'channel_id' => $channelId,
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $createdCount++;
            }
        }
        
        $this->command->info("Prepared {$createdCount} channel members for insertion");
        
        // Bulk insert all channel members at once
        try {
            DB::table('channel_members')->insert($channelMembers);
            $this->command->info("Created {$createdCount} channel members successfully");
            return $createdCount;
        } catch (\Exception $e) {
            $this->command->warn("Error inserting channel members: " . $e->getMessage());
            return 0;
        }
    }

    private function createMessageReactions()
    {
        $this->command->info('Creating message reactions...');
        
        try {
            // Get a small sample of messages and users
            $messages = DB::table('messages')->limit(1000)->pluck('id')->toArray();
            $users = DB::table('users')->limit(100)->pluck('id')->toArray();
            
            if (empty($messages) || empty($users)) {
                $this->command->warn('No messages or users found, skipping message reactions creation');
                return 0;
            }
            
            $this->command->info("Found " . count($messages) . " messages and " . count($users) . " users");
            
            $reactions = ['👍', '👎', '❤️', '😂', '😮'];
            $createdCount = 0;
            
            // Create reactions for 100 messages only
            $selectedMessages = array_slice($messages, 0, 100);
            
            foreach ($selectedMessages as $messageId) {
                // Each message gets 1-3 reactions
                $reactionNum = $this->faker->numberBetween(1, 3);
                $selectedUsers = $this->faker->randomElements($users, min($reactionNum, count($users)));
                
                foreach ($selectedUsers as $userId) {
                    try {
                        DB::table('message_reactions')->insert([
                            'message_id' => $messageId,
                            'user_id' => $userId,
                            'emoji' => $this->faker->randomElement($reactions),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $createdCount++;
                    } catch (\Exception $e) {
                        // Skip duplicate reactions
                    }
                }
            }
            
            $this->command->info("Created {$createdCount} message reactions successfully");
            return $createdCount;
            
        } catch (\Exception $e) {
            $this->command->error("Error creating message reactions: " . $e->getMessage());
            return 0;
        }
    }

    private function createMessageReads()
    {
        $this->command->info('Creating message reads with bulk insert...');
        
        // Get all messages and users
        $messages = DB::table('messages')->pluck('id')->toArray();
        $users = DB::table('users')->pluck('id')->toArray();
        
        if (empty($messages) || empty($users)) {
            $this->command->warn('No messages or users found, skipping message reads creation');
            return 0;
        }
        
        $this->command->info("Found " . count($messages) . " messages and " . count($users) . " users");
        
        $messageReads = [];
        $createdCount = 0;
        
        // Create reads for 80% of messages
        $messageCount = count($messages);
        $readCount = intval($messageCount * 0.8);
        $selectedMessages = $this->faker->randomElements($messages, $readCount);
        
        foreach ($selectedMessages as $messageId) {
            // Each message gets 1-10 reads
            $readNum = $this->faker->numberBetween(1, 10);
            $selectedUsers = $this->faker->randomElements($users, min($readNum, count($users)));
            
            foreach ($selectedUsers as $userId) {
                $messageReads[] = [
                    'message_id' => $messageId,
                    'user_id' => $userId,
                    'read_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $createdCount++;
            }
        }
        
        $this->command->info("Prepared {$createdCount} message reads for insertion");
        
        // Bulk insert in batches
        $batchSize = 1000;
        $batches = array_chunk($messageReads, $batchSize);
        
        foreach ($batches as $batch) {
            try {
                DB::table('message_reads')->insert($batch);
            } catch (\Exception $e) {
                $this->command->warn("Error inserting message reads batch: " . $e->getMessage());
            }
        }
        
        $this->command->info("Created {$createdCount} message reads successfully");
        return $createdCount;
    }
}