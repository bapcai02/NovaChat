<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\ChannelService;
use App\Repositories\Contracts\ChannelRepositoryInterface;
use Mockery;

class ChannelServiceTest extends TestCase
{
    private ChannelRepositoryInterface $channelRepository;
    private ChannelService $channelService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->channelRepository = Mockery::mock(ChannelRepositoryInterface::class);
        $this->channelService = new ChannelService($this->channelRepository);
    }

    public function test_get_all_channels_success()
    {
        $channels = [
            ['id' => 1, 'name' => 'General', 'team_id' => 1],
            ['id' => 2, 'name' => 'Random', 'team_id' => 1],
        ];

        $this->channelRepository
            ->shouldReceive('getAll')
            ->once()
            ->andReturn($channels);

        $result = $this->channelService->getAllChannels();

        $this->assertEquals($channels, $result);
    }

    public function test_get_channel_by_id_success()
    {
        $channel = ['id' => 1, 'name' => 'General', 'team_id' => 1];

        $this->channelRepository
            ->shouldReceive('getById')
            ->with(1)
            ->once()
            ->andReturn($channel);

        $result = $this->channelService->getChannelById(1);

        $this->assertEquals($channel, $result);
    }

    public function test_get_channel_by_id_not_found()
    {
        $this->channelRepository
            ->shouldReceive('getById')
            ->with(999)
            ->once()
            ->andReturn(null);

        $result = $this->channelService->getChannelById(999);

        $this->assertNull($result);
    }

    public function test_create_channel_success()
    {
        $data = ['name' => 'New Channel', 'team_id' => 1];
        $createdChannel = ['id' => 1, 'name' => 'New Channel', 'team_id' => 1];

        $this->channelRepository
            ->shouldReceive('create')
            ->with($data, 1)
            ->once()
            ->andReturn($createdChannel);

        $result = $this->channelService->createChannel($data, 1);

        $this->assertEquals($createdChannel, $result);
    }

    public function test_update_channel_success()
    {
        $data = ['name' => 'Updated Channel'];
        $updatedChannel = ['id' => 1, 'name' => 'Updated Channel', 'team_id' => 1];

        $this->channelRepository
            ->shouldReceive('update')
            ->with(1, $data)
            ->once()
            ->andReturn($updatedChannel);

        $result = $this->channelService->updateChannel(1, $data);

        $this->assertEquals($updatedChannel, $result);
    }

    public function test_delete_channel_success()
    {
        $this->channelRepository
            ->shouldReceive('delete')
            ->with(1)
            ->once()
            ->andReturn(true);

        $result = $this->channelService->deleteChannel(1);

        $this->assertTrue($result);
    }

    public function test_get_channels_by_team_success()
    {
        $channels = [
            ['id' => 1, 'name' => 'General', 'team_id' => 1],
            ['id' => 2, 'name' => 'Random', 'team_id' => 1],
        ];

        $this->channelRepository
            ->shouldReceive('getByTeam')
            ->with(1)
            ->once()
            ->andReturn($channels);

        $result = $this->channelService->getChannelsByTeam(1);

        $this->assertEquals($channels, $result);
    }

    public function test_add_member_success()
    {
        $this->channelRepository
            ->shouldReceive('addMember')
            ->with(1, 1, 2)
            ->once()
            ->andReturn(true);

        $result = $this->channelService->addMember(1, 1, 2, 1);

        $this->assertTrue($result['success']);
        $this->assertEquals('Member added successfully', $result['message']);
    }

    public function test_add_member_failure()
    {
        $this->channelRepository
            ->shouldReceive('addMember')
            ->with(1, 1, 2)
            ->once()
            ->andReturn(false);

        $result = $this->channelService->addMember(1, 1, 2, 1);

        $this->assertFalse($result['success']);
        $this->assertEquals('Failed to add member', $result['message']);
    }

    public function test_add_member_handles_exception()
    {
        $this->channelRepository
            ->shouldReceive('addMember')
            ->with(1, 1, 2)
            ->once()
            ->andThrow(new \Exception('Database error'));

        $result = $this->channelService->addMember(1, 1, 2, 1);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Failed to add member: Database error', $result['message']);
    }

    public function test_remove_member_success()
    {
        $this->channelRepository
            ->shouldReceive('removeMember')
            ->with(1, 1, 2)
            ->once()
            ->andReturn(true);

        $result = $this->channelService->removeMember(1, 1, 2, 1);

        $this->assertTrue($result['success']);
        $this->assertEquals('Member removed successfully', $result['message']);
    }

    public function test_remove_member_failure()
    {
        $this->channelRepository
            ->shouldReceive('removeMember')
            ->with(1, 1, 2)
            ->once()
            ->andReturn(false);

        $result = $this->channelService->removeMember(1, 1, 2, 1);

        $this->assertFalse($result['success']);
        $this->assertEquals('Failed to remove member', $result['message']);
    }

    public function test_remove_member_handles_exception()
    {
        $this->channelRepository
            ->shouldReceive('removeMember')
            ->with(1, 1, 2)
            ->once()
            ->andThrow(new \Exception('Database error'));

        $result = $this->channelService->removeMember(1, 1, 2, 1);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Failed to remove member: Database error', $result['message']);
    }
}
