<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Channel;
use App\Models\Conversation;
use App\Models\ConversationMember;

return new class extends Migration
{
    public function up(): void
    {
        // Fix existing channel conversations that don't have members
        $channelConversations = Conversation::where('type', 'channel')
            ->whereNotNull('channel_id')
            ->get();
            
        foreach ($channelConversations as $conversation) {
            // Check if conversation has members
            $hasMembers = ConversationMember::where('conversation_id', $conversation->id)->exists();
            
            if (!$hasMembers && $conversation->team_id) {
                // Add all team members to this channel conversation
                $teamMembers = \DB::table('team_members')
                    ->where('team_id', $conversation->team_id)
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
        // Remove members from channel conversations
        $channelConversationIds = Conversation::where('type', 'channel')
            ->pluck('id')
            ->toArray();
            
        ConversationMember::whereIn('conversation_id', $channelConversationIds)->delete();
    }
};