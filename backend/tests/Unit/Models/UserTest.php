<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Message;
use App\Models\Channel;
use App\Models\Team;
use App\Models\Bookmark;
use App\Models\MessageReaction;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_created()
    {
        $user = User::create([
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('johndoe', $user->username);
        $this->assertEquals('john@example.com', $user->email);
    }

    public function test_user_has_messages_relationship()
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($user->messages->contains($message));
        $this->assertEquals(1, $user->messages->count());
    }

    public function test_user_has_channels_relationship()
    {
        $user = User::factory()->create();
        $channel = Channel::factory()->create();
        
        $user->channels()->attach($channel->id);

        $this->assertTrue($user->channels->contains($channel));
        $this->assertEquals(1, $user->channels->count());
    }

    public function test_user_has_teams_relationship()
    {
        $user = User::factory()->create();
        $team = Team::factory()->create();
        
        $user->teams()->attach($team->id, ['role' => 'member']);

        $this->assertTrue($user->teams->contains($team));
        $this->assertEquals(1, $user->teams->count());
    }

    public function test_user_has_bookmarks_relationship()
    {
        $user = User::factory()->create();
        $bookmark = Bookmark::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($user->bookmarks->contains($bookmark));
        $this->assertEquals(1, $user->bookmarks->count());
    }

    public function test_user_has_reactions_relationship()
    {
        $user = User::factory()->create();
        $reaction = MessageReaction::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($user->reactions->contains($reaction));
        $this->assertEquals(1, $user->reactions->count());
    }

    public function test_user_password_is_hashed()
    {
        $user = User::create([
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $this->assertNotEquals('password123', $user->password);
        $this->assertTrue(password_verify('password123', $user->password));
    }

    public function test_user_casts_are_applied()
    {
        $user = User::create([
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'is_online' => true,
            'last_seen_at' => now(),
        ]);

        $this->assertIsBool($user->is_online);
        $this->assertTrue($user->is_online);
        $this->assertInstanceOf(\Carbon\Carbon::class, $user->last_seen_at);
    }

    public function test_user_hidden_attributes_are_not_visible()
    {
        $user = User::create([
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $userArray = $user->toArray();

        $this->assertArrayNotHasKey('password', $userArray);
        $this->assertArrayNotHasKey('remember_token', $userArray);
    }
}
