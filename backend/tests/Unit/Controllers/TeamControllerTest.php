<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\TeamController;
use App\Services\TeamService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class TeamControllerTest extends TestCase
{
    use RefreshDatabase;

    private TeamService $teamService;
    private TeamController $teamController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teamService = Mockery::mock(TeamService::class);
        $this->teamController = new TeamController($this->teamService);
    }

    public function test_index_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $teams = [
            ['id' => 1, 'name' => 'Team 1', 'description' => 'First team'],
            ['id' => 2, 'name' => 'Team 2', 'description' => 'Second team'],
        ];

        $this->teamService
            ->shouldReceive('getTeamsForUser')
            ->with($user->id)
            ->once()
            ->andReturn(['success' => true, 'data' => $teams]);

        $response = $this->teamController->index();

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($teams, $responseData['data']);
    }

    public function test_index_failure()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->teamService
            ->shouldReceive('getTeamsForUser')
            ->with($user->id)
            ->once()
            ->andReturn(['success' => false, 'message' => 'Database error']);

        $response = $this->teamController->index();

        $this->assertEquals(500, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('Database error', $responseData['message']);
    }

    public function test_store_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $teamData = ['name' => 'New Team', 'description' => 'A new team'];
        $createdTeam = ['id' => 1, 'name' => 'New Team', 'description' => 'A new team'];

        $this->teamService
            ->shouldReceive('createTeam')
            ->with($teamData, $user->id)
            ->once()
            ->andReturn(['success' => true, 'data' => $createdTeam]);

        $request = $this->createMockTeamRequest($teamData);
        $response = $this->teamController->store($request);

        $this->assertEquals(201, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($createdTeam, $responseData['data']);
    }

    public function test_store_failure()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $teamData = ['name' => 'New Team', 'description' => 'A new team'];

        $this->teamService
            ->shouldReceive('createTeam')
            ->with($teamData, $user->id)
            ->once()
            ->andReturn(['success' => false, 'message' => 'Validation failed']);

        $request = $this->createMockTeamRequest($teamData);
        $response = $this->teamController->store($request);

        $this->assertEquals(500, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('Validation failed', $responseData['message']);
    }

    public function test_add_member_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->teamService
            ->shouldReceive('addMember')
            ->with(1, 2, $user->id)
            ->once()
            ->andReturn(['success' => true, 'message' => 'Member added successfully']);

        $request = $this->createMockAddMemberRequest(['user_id' => 2]);
        $response = $this->teamController->addMember('1', $request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Member added successfully', $responseData['message']);
    }

    public function test_remove_member_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->teamService
            ->shouldReceive('removeMember')
            ->with(1, 2, $user->id)
            ->once()
            ->andReturn(['success' => true, 'message' => 'Member removed successfully']);

        $response = $this->teamController->removeMember('1', '2');

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Member removed successfully', $responseData['message']);
    }

    private function createMockTeamRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\TeamRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }

    private function createMockAddMemberRequest(array $data)
    {
        $request = Mockery::mock('Illuminate\Http\Request');
        $request->shouldReceive('validate')->andReturn($data);
        $request->user_id = $data['user_id'];
        return $request;
    }

    private function createMockRemoveMemberRequest(array $data)
    {
        $request = Mockery::mock('Illuminate\Http\Request');
        $request->shouldReceive('validate')->andReturn($data);
        $request->user_id = $data['user_id'];
        return $request;
    }
}
