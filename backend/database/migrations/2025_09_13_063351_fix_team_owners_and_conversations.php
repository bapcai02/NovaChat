<?php

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Team;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Fix team owners - ensure they are in team_members table
        $teams = Team::all();

        foreach ($teams as $team) {
            // Check if team owner is in team_members
            $ownerInMembers = \DB::table('team_members')
                ->where('team_id', $team->id)
                ->where('user_id', $team->owner_id)
                ->exists();

            if (! $ownerInMembers) {
                // Add team owner to team_members
                \DB::table('team_members')->insert([
                    'team_id' => $team->id,
                    'user_id' => $team->owner_id,
                    'role' => 'owner',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Fix team conversation - ensure all team members are in conversation
            $teamConversation = Conversation::where('type', 'team')
                ->where('team_id', $team->id)
                ->first();

            if ($teamConversation) {
                // Get all team members
                $teamMembers = \DB::table('team_members')
                    ->where('team_id', $team->id)
                    ->get();

                foreach ($teamMembers as $member) {
                    // Check if member is already in conversation
                    $memberInConversation = \DB::table('conversation_members')
                        ->where('conversation_id', $teamConversation->id)
                        ->where('user_id', $member->user_id)
                        ->exists();

                    if (! $memberInConversation) {
                        ConversationMember::create([
                            'conversation_id' => $teamConversation->id,
                            'user_id' => $member->user_id,
                            'joined_at' => now(),
                        ]);
                    }
                }
            }
        }
    }

    public function down(): void
    {
        // This migration only adds data, no need to rollback
    }
};
