<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\MessageRead;
use App\Models\User;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MessageReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_read_belongs_to_user()
    {
        $user = User::factory()->create();
        $messageRead = MessageRead::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $messageRead->user);
        $this->assertEquals($user->id, $messageRead->user->id);
    }

    public function test_message_read_belongs_to_message()
    {
        $message = Message::factory()->create();
        $messageRead = MessageRead::factory()->create(['message_id' => $message->id]);

        $this->assertInstanceOf(Message::class, $messageRead->message);
        $this->assertEquals($message->id, $messageRead->message->id);
    }

    public function test_message_read_fillable_attributes()
    {
        $messageRead = new MessageRead();
        $fillable = $messageRead->getFillable();

        $this->assertContains('message_id', $fillable);
        $this->assertContains('user_id', $fillable);
        $this->assertContains('read_at', $fillable);
    }

    public function test_message_read_casts()
    {
        $messageRead = MessageRead::factory()->create([
            'read_at' => now(),
        ]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $messageRead->read_at);
    }

    public function test_message_read_unique_constraint()
    {
        $user = User::factory()->create();
        $message = Message::factory()->create();
        
        // Create first read record
        MessageRead::factory()->create([
            'user_id' => $user->id,
            'message_id' => $message->id,
        ]);

        // Try to create duplicate read record - should fail
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        MessageRead::factory()->create([
            'user_id' => $user->id,
            'message_id' => $message->id,
        ]);
    }
}
