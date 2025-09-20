<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Channel;
use App\Models\Team;
use App\Models\User;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ChannelTest extends TestCase
{
    use RefreshDatabase;

    public function test_channel_belongs_to_team()
    {
        $team = Team::factory()->create();
        $channel = Channel::factory()->create(['team_id' => $team->id]);

        $this->assertInstanceOf(Team::class, $channel->team);
        $this->assertEquals($team->id, $channel->team->id);
    }

    public function test_channel_has_many_messages()
    {
        $channel = Channel::factory()->create();
        $messages = Message::factory()->count(3)->create(['channel_id' => $channel->id]);

        $this->assertCount(3, $channel->messages);
        $this->assertInstanceOf(Message::class, $channel->messages->first());
    }

    public function test_channel_has_many_conversations()
    {
        $channel = Channel::factory()->create();
        $conversations = Conversation::factory()->count(3)->create(['channel_id' => $channel->id]);

        $this->assertCount(3, $channel->conversations);
        $this->assertInstanceOf(Conversation::class, $channel->conversations->first());
    }

    public function test_channel_fillable_attributes()
    {
        $channel = new Channel();
        $fillable = $channel->getFillable();

        $this->assertContains('team_id', $fillable);
        $this->assertContains('name', $fillable);
        $this->assertContains('slug', $fillable);
        $this->assertContains('description', $fillable);
        $this->assertContains('is_private', $fillable);
    }

    public function test_channel_casts()
    {
        $channel = Channel::factory()->create([
            'is_private' => true,
        ]);

        $this->assertIsBool($channel->is_private);
    }

    public function test_channel_scope_where_public()
    {
        Channel::factory()->create(['is_private' => false]);
        Channel::factory()->create(['is_private' => true]);

        $publicChannels = Channel::where('is_private', false)->get();

        $this->assertCount(1, $publicChannels);
        $this->assertFalse($publicChannels->first()->is_private);
    }

    public function test_channel_scope_where_private()
    {
        Channel::factory()->create(['is_private' => false]);
        Channel::factory()->create(['is_private' => true]);

        $privateChannels = Channel::where('is_private', true)->get();

        $this->assertCount(1, $privateChannels);
        $this->assertTrue($privateChannels->first()->is_private);
    }
}
