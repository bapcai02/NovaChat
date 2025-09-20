<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\MessageReaction;
use App\Models\User;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MessageReactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_reaction_belongs_to_user()
    {
        $user = User::factory()->create();
        $reaction = MessageReaction::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $reaction->user);
        $this->assertEquals($user->id, $reaction->user->id);
    }

    public function test_message_reaction_belongs_to_message()
    {
        $message = Message::factory()->create();
        $reaction = MessageReaction::factory()->create(['message_id' => $message->id]);

        $this->assertInstanceOf(Message::class, $reaction->message);
        $this->assertEquals($message->id, $reaction->message->id);
    }

    public function test_message_reaction_fillable_attributes()
    {
        $reaction = new MessageReaction();
        $fillable = $reaction->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('message_id', $fillable);
        $this->assertContains('emoji', $fillable);
    }

    public function test_message_reaction_casts()
    {
        $reaction = MessageReaction::factory()->create([
            'emoji' => '👍',
        ]);

        $this->assertIsString($reaction->emoji);
    }

    public function test_message_reaction_unique_constraint()
    {
        $user = User::factory()->create();
        $message = Message::factory()->create();
        
        // Create first reaction
        MessageReaction::factory()->create([
            'user_id' => $user->id,
            'message_id' => $message->id,
            'emoji' => '👍',
        ]);

        // Try to create duplicate reaction - should fail
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        MessageReaction::factory()->create([
            'user_id' => $user->id,
            'message_id' => $message->id,
            'emoji' => '👍',
        ]);
    }
}
