<?php

namespace Tests\Unit\Models;

use App\Models\Team;
use App\Models\User;
use App\Models\Channel;
use App\Models\Conversation;
use App\Models\TeamMember;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TeamTest extends TestCase
{
    use RefreshDatabase;

    public function test_team_can_be_created()
    {
        $owner = User::factory()->create();
        
        $team = Team::create([
            'name' => 'Test Team',
            'description' => 'A test team',
            'slug' => 'test-team',
            'owner_id' => $owner->id,
            'is_private' => false,
        ]);

        $this->assertInstanceOf(Team::class, $team);
        $this->assertEquals('Test Team', $team->name);
        $this->assertEquals('A test team', $team->description);
        $this->assertEquals('test-team', $team->slug);
        $this->assertEquals($owner->id, $team->owner_id);
        $this->assertFalse($team->is_private);
    }

    public function test_team_has_owner_relationship()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);

        $this->assertInstanceOf(User::class, $team->owner);
        $this->assertEquals($owner->id, $team->owner->id);
    }

    public function test_team_has_members_relationship()
    {
        $team = Team::factory()->create();
        $member1 = User::factory()->create();
        $member2 = User::factory()->create();
        
        $team->members()->attach($member1->id, ['role' => 'member']);
        $team->members()->attach($member2->id, ['role' => 'admin']);

        $this->assertTrue($team->members->contains($member1));
        $this->assertTrue($team->members->contains($member2));
        $this->assertEquals(2, $team->members->count());
    }

    public function test_team_has_team_members_relationship()
    {
        $team = Team::factory()->create();
        $member = User::factory()->create();

        // Test relationship exists
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $team->teamMembers());
    }

    public function test_team_has_channels_relationship()
    {
        $team = Team::factory()->create();
        $channel1 = Channel::factory()->create(['team_id' => $team->id]);
        $channel2 = Channel::factory()->create(['team_id' => $team->id]);

        $this->assertTrue($team->channels->contains($channel1));
        $this->assertTrue($team->channels->contains($channel2));
        $this->assertEquals(2, $team->channels->count());
    }

    public function test_team_has_conversations_relationship()
    {
        $team = Team::factory()->create();
        $conversation1 = Conversation::factory()->create(['team_id' => $team->id]);
        $conversation2 = Conversation::factory()->create(['team_id' => $team->id]);

        $this->assertTrue($team->conversations->contains($conversation1));
        $this->assertTrue($team->conversations->contains($conversation2));
        $this->assertEquals(2, $team->conversations->count());
    }

    public function test_team_casts_are_applied()
    {
        $team = Team::create([
            'name' => 'Test Team',
            'description' => 'A test team',
            'slug' => 'test-team',
            'owner_id' => User::factory()->create()->id,
            'is_private' => true,
        ]);

        $this->assertIsBool($team->is_private);
        $this->assertTrue($team->is_private);
    }

    public function test_team_members_pivot_has_correct_attributes()
    {
        $team = Team::factory()->create();
        $member = User::factory()->create();
        
        $team->members()->attach($member->id, [
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        $pivot = $team->members()->where('user_id', $member->id)->first()->pivot;
        
        $this->assertEquals('admin', $pivot->role);
        $this->assertNotNull($pivot->joined_at);
    }
}
