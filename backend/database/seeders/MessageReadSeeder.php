<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Message;
use App\Models\MessageRead;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\User;

class MessageReadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all conversations
        $conversations = Conversation::with('members')->get();

        foreach ($conversations as $conversation) {
            // Get all messages in this conversation
            $messages = Message::where('conversation_id', $conversation->id)->get();

            foreach ($messages as $message) {
                // Get all members of this conversation except the sender
                $memberIds = $conversation->members()
                    ->where('user_id', '!=', $message->user_id)
                    ->pluck('user_id');

                // Create read status entries for each member
                foreach ($memberIds as $memberId) {
                    // Randomly mark some messages as read (70% chance)
                    $isRead = rand(1, 10) <= 7;
                    
                    MessageRead::create([
                        'message_id' => $message->id,
                        'user_id' => $memberId,
                        'read_at' => $isRead ? now()->subDays(rand(0, 7)) : null,
                    ]);
                }
            }
        }
    }
}
