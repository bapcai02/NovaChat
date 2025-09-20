<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\TeamMember;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TeamMemberTest extends TestCase
{
    use RefreshDatabase;

    public function test_team_member_belongs_to_team()
    {
        $team = Team::factory()->create();
        $teamMember = TeamMember::factory()->create(['team_id' => $team->id]);

        $this->assertInstanceOf(Team::class, $teamMember->team);
        $this->assertEquals($team->id, $teamMember->team->id);
    }

    public function test_team_member_belongs_to_user()
    {
        $user = User::factory()->create();
        $teamMember = TeamMember::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $teamMember->user);
        $this->assertEquals($user->id, $teamMember->user->id);
    }

    public function test_team_member_fillable_attributes()
    {
        $teamMember = new TeamMember();
        $fillable = $teamMember->getFillable();

        $this->assertContains('team_id', $fillable);
        $this->assertContains('user_id', $fillable);
        $this->assertContains('role', $fillable);
        $this->assertContains('joined_at', $fillable);
    }

    public function test_team_member_casts()
    {
        $teamMember = TeamMember::factory()->create([
            'joined_at' => now(),
        ]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $teamMember->joined_at);
    }

    public function test_team_member_unique_constraint()
    {
        $team = Team::factory()->create();
        $user = User::factory()->create();
        
        // Create first team member
        TeamMember::factory()->create([
            'team_id' => $team->id,
            'user_id' => $user->id,
        ]);

        // Try to create duplicate team member - should fail
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        TeamMember::factory()->create([
            'team_id' => $team->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_team_member_scope_where_role()
    {
        $team = Team::factory()->create();
        $admin = User::factory()->create();
        $member = User::factory()->create();
        
        TeamMember::factory()->create([
            'team_id' => $team->id,
            'user_id' => $admin->id,
            'role' => 'admin',
        ]);
        
        TeamMember::factory()->create([
            'team_id' => $team->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);

        $admins = TeamMember::where('role', 'admin')->get();
        $members = TeamMember::where('role', 'member')->get();

        $this->assertCount(1, $admins);
        $this->assertCount(1, $members);
        $this->assertEquals('admin', $admins->first()->role);
        $this->assertEquals('member', $members->first()->role);
    }
}
