<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\TeamService;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Mockery;

class TeamServiceTest extends TestCase
{
    private TeamRepositoryInterface $teamRepository;
    private TeamService $teamService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teamRepository = Mockery::mock(TeamRepositoryInterface::class);
        $this->teamService = new TeamService($this->teamRepository);
    }

    public function test_get_teams_for_user_success()
    {
        $teams = [
            ['id' => 1, 'name' => 'Team 1', 'description' => 'First team'],
            ['id' => 2, 'name' => 'Team 2', 'description' => 'Second team'],
        ];

        $this->teamRepository
            ->shouldReceive('getTeamsForUser')
            ->with(1)
            ->once()
            ->andReturn($teams);

        $result = $this->teamService->getTeamsForUser(1);

        $this->assertTrue($result['success']);
        $this->assertEquals($teams, $result['data']);
    }

    public function test_create_team_success()
    {
        $data = ['name' => 'New Team', 'description' => 'A new team'];
        $createdTeam = ['id' => 1, 'name' => 'New Team', 'description' => 'A new team'];

        $this->teamRepository
            ->shouldReceive('create')
            ->with($data, 1)
            ->once()
            ->andReturn($createdTeam);

        $result = $this->teamService->createTeam($data, 1);

        $this->assertTrue($result['success']);
        $this->assertEquals($createdTeam, $result['data']);
    }

    public function test_add_member_success()
    {
        $this->teamRepository
            ->shouldReceive('addMember')
            ->with(1, 2)
            ->once()
            ->andReturn(true);

        $result = $this->teamService->addMember(1, 2, 1);

        $this->assertTrue($result['success']);
        $this->assertEquals('Member added successfully', $result['message']);
    }

    public function test_add_member_failure()
    {
        $this->teamRepository
            ->shouldReceive('addMember')
            ->with(1, 2)
            ->once()
            ->andReturn(false);

        $result = $this->teamService->addMember(1, 2, 1);

        $this->assertFalse($result['success']);
        $this->assertEquals('Failed to add member', $result['message']);
    }

    public function test_add_member_handles_exception()
    {
        $this->teamRepository
            ->shouldReceive('addMember')
            ->with(1, 2)
            ->once()
            ->andThrow(new \Exception('Database error'));

        $result = $this->teamService->addMember(1, 2, 1);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Failed to add member: Database error', $result['message']);
    }

    public function test_remove_member_success()
    {
        $this->teamRepository
            ->shouldReceive('removeMember')
            ->with(1, 2)
            ->once()
            ->andReturn(true);

        $result = $this->teamService->removeMember(1, 2, 1);

        $this->assertTrue($result['success']);
        $this->assertEquals('Member removed successfully', $result['message']);
    }

    public function test_remove_member_failure()
    {
        $this->teamRepository
            ->shouldReceive('removeMember')
            ->with(1, 2)
            ->once()
            ->andReturn(false);

        $result = $this->teamService->removeMember(1, 2, 1);

        $this->assertFalse($result['success']);
        $this->assertEquals('Failed to remove member', $result['message']);
    }

    public function test_remove_member_handles_exception()
    {
        $this->teamRepository
            ->shouldReceive('removeMember')
            ->with(1, 2)
            ->once()
            ->andThrow(new \Exception('Database error'));

        $result = $this->teamService->removeMember(1, 2, 1);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Failed to remove member: Database error', $result['message']);
    }
}
