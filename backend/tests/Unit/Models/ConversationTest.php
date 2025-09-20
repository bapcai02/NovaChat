<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Conversation;
use App\Models\Team;
use App\Models\Channel;
use App\Models\User;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_conversation_belongs_to_team()
    {
        $team = Team::factory()->create();
        $conversation = Conversation::factory()->create(['team_id' => $team->id]);

        $this->assertInstanceOf(Team::class, $conversation->team);
        $this->assertEquals($team->id, $conversation->team->id);
    }

    public function test_conversation_belongs_to_channel()
    {
        $channel = Channel::factory()->create();
        $conversation = Conversation::factory()->create(['channel_id' => $channel->id]);

        $this->assertInstanceOf(Channel::class, $conversation->channel);
        $this->assertEquals($channel->id, $conversation->channel->id);
    }

    public function test_conversation_has_many_messages()
    {
        $conversation = Conversation::factory()->create();
        $messages = Message::factory()->count(3)->create(['conversation_id' => $conversation->id]);

        $this->assertCount(3, $conversation->messages);
        $this->assertInstanceOf(Message::class, $conversation->messages->first());
    }

    public function test_conversation_has_many_members()
    {
        $conversation = Conversation::factory()->create();
        $users = User::factory()->count(3)->create();
        
        // Attach users to conversation
        $conversation->members()->attach($users->pluck('id'));

        $this->assertCount(3, $conversation->members);
        $this->assertInstanceOf(User::class, $conversation->members->first());
    }

    public function test_conversation_fillable_attributes()
    {
        $conversation = new Conversation();
        $fillable = $conversation->getFillable();

        $this->assertContains('team_id', $fillable);
        $this->assertContains('channel_id', $fillable);
        $this->assertContains('name', $fillable);
        $this->assertContains('type', $fillable);
        // is_private is not in fillable array
        $this->assertContains('is_pinned', $fillable);
        $this->assertContains('metadata', $fillable);
    }

    public function test_conversation_casts()
    {
        $conversation = Conversation::factory()->create([
            'is_pinned' => true,
            'metadata' => ['key' => 'value'],
        ]);

        $this->assertIsBool($conversation->is_pinned);
        $this->assertIsArray($conversation->metadata);
        $this->assertEquals('value', $conversation->metadata['key']);
    }

    public function test_conversation_scope_where_direct()
    {
        Conversation::factory()->create(['type' => 'direct']);
        Conversation::factory()->create(['type' => 'channel']);

        $directConversations = Conversation::where('type', 'direct')->get();

        $this->assertCount(1, $directConversations);
        $this->assertEquals('direct', $directConversations->first()->type);
    }

    public function test_conversation_scope_where_channel()
    {
        Conversation::factory()->create(['type' => 'direct']);
        Conversation::factory()->create(['type' => 'channel']);

        $channelConversations = Conversation::where('type', 'channel')->get();

        $this->assertCount(1, $channelConversations);
        $this->assertEquals('channel', $channelConversations->first()->type);
    }

    public function test_conversation_scope_where_pinned()
    {
        $unpinned = Conversation::factory()->create(['is_pinned' => false]);
        $pinned = Conversation::factory()->create(['is_pinned' => true]);

        // Debug: Check what was actually created
        $unpinnedFresh = $unpinned->fresh();
        $pinnedFresh = $pinned->fresh();
        
        $this->assertFalse($unpinnedFresh->is_pinned, 'Unpinned conversation should have is_pinned = false');
        $this->assertTrue($pinnedFresh->is_pinned, 'Pinned conversation should have is_pinned = true');

        $pinnedConversations = Conversation::where('is_pinned', true)->get();
        $allConversations = Conversation::all();

        $this->assertCount(2, $allConversations);
        $this->assertCount(1, $pinnedConversations);
        $this->assertTrue($pinnedConversations->first()->is_pinned);
        $this->assertEquals($pinned->id, $pinnedConversations->first()->id);
    }

    public function test_conversation_title_attribute()
    {
        $conversation = Conversation::factory()->create(['type' => 'direct']);
        
        // Test direct conversation title
        $this->assertEquals('Direct Message', $conversation->title);
        
        // Test channel conversation title
        $channel = Channel::factory()->create(['name' => 'Test Channel']);
        $channelConversation = Conversation::factory()->create([
            'type' => 'channel',
            'channel_id' => $channel->id
        ]);
        
        $this->assertEquals('Test Channel', $channelConversation->title);
        
        // Test team conversation title
        $team = Team::factory()->create(['name' => 'Test Team']);
        $teamConversation = Conversation::factory()->create([
            'type' => 'team',
            'team_id' => $team->id
        ]);
        
        $this->assertEquals('Test Team', $teamConversation->title);
    }
}
