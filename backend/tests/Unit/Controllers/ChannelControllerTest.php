<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\ChannelController;
use App\Services\ChannelService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class ChannelControllerTest extends TestCase
{
    use RefreshDatabase;

    private ChannelService $channelService;
    private ChannelController $channelController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->channelService = Mockery::mock(ChannelService::class);
        $this->channelController = new ChannelController($this->channelService);
    }

    public function test_index_success()
    {
        $channels = [
            ['id' => 1, 'name' => 'General', 'team_id' => 1],
            ['id' => 2, 'name' => 'Random', 'team_id' => 1],
        ];

        $this->channelService
            ->shouldReceive('getAllChannels')
            ->once()
            ->andReturn($channels);

        $response = $this->channelController->index();

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($channels, $responseData['data']);
        $this->assertEquals('Channels retrieved successfully', $responseData['message']);
    }

    public function test_store_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $channelData = ['name' => 'New Channel', 'team_id' => 1, 'description' => 'A new channel'];
        $createdChannel = ['id' => 1, 'name' => 'New Channel', 'team_id' => 1];

        $this->channelService
            ->shouldReceive('createChannel')
            ->with($channelData, $user->id)
            ->once()
            ->andReturn($createdChannel);

        $request = $this->createMockChannelRequest($channelData);
        $response = $this->channelController->store($request);

        $this->assertEquals(201, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($createdChannel, $responseData['data']);
    }

    public function test_show_success()
    {
        $channel = ['id' => 1, 'name' => 'General', 'team_id' => 1];

        $this->channelService
            ->shouldReceive('getChannelById')
            ->with(1)
            ->once()
            ->andReturn($channel);

        $response = $this->channelController->show(1);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($channel, $responseData['data']);
    }

    public function test_show_not_found()
    {
        $this->channelService
            ->shouldReceive('getChannelById')
            ->with(999)
            ->once()
            ->andReturn(null);

        $response = $this->channelController->show(999);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertNull($responseData['data']);
    }

    public function test_update_success()
    {
        $channelData = ['name' => 'Updated Channel'];
        $updatedChannel = ['id' => 1, 'name' => 'Updated Channel', 'team_id' => 1];

        $this->channelService
            ->shouldReceive('updateChannel')
            ->with(1, $channelData)
            ->once()
            ->andReturn($updatedChannel);

        $request = $this->createMockChannelRequest($channelData);
        $response = $this->channelController->update($request, 1);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($updatedChannel, $responseData['data']);
    }

    public function test_destroy_success()
    {
        $this->channelService
            ->shouldReceive('deleteChannel')
            ->with(1)
            ->once()
            ->andReturn(true);

        $response = $this->channelController->destroy(1);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Channel deleted successfully', $responseData['message']);
    }

    public function test_get_channels_by_team_success()
    {
        $channels = [
            ['id' => 1, 'name' => 'General', 'team_id' => 1],
            ['id' => 2, 'name' => 'Random', 'team_id' => 1],
        ];

        $this->channelService
            ->shouldReceive('getChannelsByTeam')
            ->with(1)
            ->once()
            ->andReturn($channels);

        $response = $this->channelController->getTeamChannels(1);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($channels, $responseData['data']);
    }

    public function test_add_member_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->channelService
            ->shouldReceive('addMember')
            ->with(1, 1, 2, $user->id)
            ->once()
            ->andReturn(['success' => true, 'message' => 'Member added successfully']);

        $request = $this->createMockAddMemberRequest(['user_id' => 2]);
        $response = $this->channelController->addMember(1, 1, $request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Member added successfully', $responseData['message']);
    }

    public function test_remove_member_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->channelService
            ->shouldReceive('removeMember')
            ->with(1, 1, 2, $user->id)
            ->once()
            ->andReturn(['success' => true, 'message' => 'Member removed successfully']);

        $response = $this->channelController->removeMember('1', '1', '2');

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Member removed successfully', $responseData['message']);
    }

    private function createMockChannelRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\ChannelRequest');
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
