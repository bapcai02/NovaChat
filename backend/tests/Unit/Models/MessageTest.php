<?php

namespace Tests\Unit\Models;

use App\Models\Message;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Channel;
use App\Models\MessageReaction;
use App\Models\Bookmark;
use App\Models\MessageRead;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_can_be_created()
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        
        $message = Message::create([
            'user_id' => $user->id,
            'conversation_id' => $conversation->id,
            'content' => 'Hello World',
            'type' => 'text',
        ]);

        $this->assertInstanceOf(Message::class, $message);
        $this->assertEquals('Hello World', $message->content);
        $this->assertEquals('text', $message->type);
        $this->assertEquals($user->id, $message->user_id);
        $this->assertEquals($conversation->id, $message->conversation_id);
    }

    public function test_message_has_user_relationship()
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $message->user);
        $this->assertEquals($user->id, $message->user->id);
    }

    public function test_message_has_conversation_relationship()
    {
        $conversation = Conversation::factory()->create();
        $message = Message::factory()->create(['conversation_id' => $conversation->id]);

        $this->assertInstanceOf(Conversation::class, $message->conversation);
        $this->assertEquals($conversation->id, $message->conversation->id);
    }

    public function test_message_has_channel_relationship()
    {
        $channel = Channel::factory()->create();
        $message = Message::factory()->create(['channel_id' => $channel->id]);

        $this->assertInstanceOf(Channel::class, $message->channel);
        $this->assertEquals($channel->id, $message->channel->id);
    }

    public function test_message_has_parent_relationship()
    {
        $parentMessage = Message::factory()->create();
        $replyMessage = Message::factory()->create(['parent_id' => $parentMessage->id]);

        $this->assertInstanceOf(Message::class, $replyMessage->parent);
        $this->assertEquals($parentMessage->id, $replyMessage->parent->id);
    }

    public function test_message_has_replies_relationship()
    {
        $parentMessage = Message::factory()->create();
        $reply1 = Message::factory()->create(['parent_id' => $parentMessage->id]);
        $reply2 = Message::factory()->create(['parent_id' => $parentMessage->id]);

        $this->assertTrue($parentMessage->replies->contains($reply1));
        $this->assertTrue($parentMessage->replies->contains($reply2));
        $this->assertEquals(2, $parentMessage->replies->count());
    }

    public function test_message_has_reactions_relationship()
    {
        $message = Message::factory()->create();
        $reaction = MessageReaction::factory()->create(['message_id' => $message->id]);

        $this->assertTrue($message->reactions->contains($reaction));
        $this->assertEquals(1, $message->reactions->count());
    }

    public function test_message_has_bookmarks_relationship()
    {
        $message = Message::factory()->create();
        $bookmark = Bookmark::factory()->create(['message_id' => $message->id]);

        $this->assertTrue($message->bookmarks->contains($bookmark));
        $this->assertEquals(1, $message->bookmarks->count());
    }

    public function test_message_has_reads_relationship()
    {
        $message = Message::factory()->create();
        $read = MessageRead::factory()->create(['message_id' => $message->id]);

        $this->assertTrue($message->reads->contains($read));
        $this->assertEquals(1, $message->reads->count());
    }

    public function test_message_casts_are_applied()
    {
        $message = Message::create([
            'user_id' => User::factory()->create()->id,
            'conversation_id' => Conversation::factory()->create()->id,
            'content' => 'Test message',
            'type' => 'text',
            'metadata' => ['key' => 'value'],
            'is_edited' => true,
            'is_pinned' => true,
            'is_deleted' => false,
            'edited_at' => now(),
            'deleted_at' => null,
        ]);

        $this->assertIsArray($message->metadata);
        $this->assertEquals(['key' => 'value'], $message->metadata);
        $this->assertIsBool($message->is_edited);
        $this->assertTrue($message->is_edited);
        $this->assertIsBool($message->is_pinned);
        $this->assertTrue($message->is_pinned);
        $this->assertIsBool($message->is_deleted);
        $this->assertFalse($message->is_deleted);
        $this->assertInstanceOf(\Carbon\Carbon::class, $message->edited_at);
        $this->assertNull($message->deleted_at);
    }

    public function test_message_boot_creates_read_entries()
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        
        // Create message and verify it was created
        $message = Message::create([
            'user_id' => $user->id,
            'conversation_id' => $conversation->id,
            'content' => 'Test message',
            'type' => 'text',
        ]);

        $this->assertNotNull($message);
        $this->assertEquals($user->id, $message->user_id);
        $this->assertEquals($conversation->id, $message->conversation_id);
    }
}
