<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Team;
use App\Models\Conversation;
use App\Models\ConversationMember;

return new class extends Migration
{
    public function up(): void
    {
        // Create team conversations for existing teams
        $teams = Team::all();
        
        foreach ($teams as $team) {
            // Check if team conversation already exists
            $existingConversation = Conversation::where('type', 'team')
                ->where('team_id', $team->id)
                ->first();
                
            if (!$existingConversation) {
                // Create team conversation
                $conversation = Conversation::create([
                    'type' => 'team',
                    'name' => $team->name,
                    'team_id' => $team->id,
                    'channel_id' => null,
                    'metadata' => null,
                ]);
                
                // Add all team members to conversation
                $teamMembers = \DB::table('team_members')
                    ->where('team_id', $team->id)
                    ->get();
                    
                foreach ($teamMembers as $member) {
                    ConversationMember::create([
                        'conversation_id' => $conversation->id,
                        'user_id' => $member->user_id,
                        'joined_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Remove team conversations
        Conversation::where('type', 'team')->delete();
    }
};