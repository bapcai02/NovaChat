<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\UserStatusController;
use App\Services\UserPresenceService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class UserStatusControllerTest extends TestCase
{
    use RefreshDatabase;

    private UserPresenceService $userPresenceService;
    private UserStatusController $userStatusController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userPresenceService = Mockery::mock(UserPresenceService::class);
        $this->userStatusController = new UserStatusController($this->userPresenceService);
    }

    public function test_get_user_status_success()
    {
        $user = User::factory()->create();
        $status = [
            'user_id' => $user->id,
            'status' => 'online',
            'last_seen' => now(),
        ];

        $this->userPresenceService
            ->shouldReceive('getUserStatus')
            ->with($user->id)
            ->once()
            ->andReturn($status);

        $response = $this->userStatusController->getUserStatus($user->id);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
        $this->assertEquals($status['user_id'], $responseData['data']['user_id']);
        $this->assertEquals($status['status'], $responseData['data']['status']);
    }

    public function test_get_user_status_not_found()
    {
        $this->userPresenceService
            ->shouldReceive('getUserStatus')
            ->with(999)
            ->once()
            ->andReturn(null);

        $response = $this->userStatusController->getUserStatus(999);

        $this->assertEquals(404, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('User not found', $responseData['message']);
    }

    public function test_update_user_status_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $statusData = [
            'status' => 'away',
            'status_message' => 'Be right back',
        ];

        $updatedStatus = [
            'user_id' => $user->id,
            'status' => 'away',
            'status_message' => 'Be right back',
        ];

        $this->userPresenceService
            ->shouldReceive('updateUserStatus')
            ->with($user->id, $statusData)
            ->once()
            ->andReturn(['success' => true, 'data' => $updatedStatus]);

        $request = $this->createMockRequest($statusData);
        $response = $this->userStatusController->updateUserStatus($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($updatedStatus, $responseData['data']);
    }

    public function test_update_user_status_unauthenticated()
    {
        $statusData = ['status' => 'away'];

        $request = $this->createMockRequest($statusData);
        $response = $this->userStatusController->updateUserStatus($request);

        $this->assertEquals(401, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('Unauthenticated', $responseData['message']);
    }

    public function test_set_online_status_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->userPresenceService
            ->shouldReceive('setUserOnline')
            ->with($user->id)
            ->once()
            ->andReturn(['success' => true, 'message' => 'Status updated to online']);

        $response = $this->userStatusController->setOnlineStatus();

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Status updated to online', $responseData['message']);
    }

    public function test_set_offline_status_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->userPresenceService
            ->shouldReceive('setUserOffline')
            ->with($user->id)
            ->once()
            ->andReturn(['success' => true, 'message' => 'Status updated to offline']);

        $response = $this->userStatusController->setOfflineStatus();

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Status updated to offline', $responseData['message']);
    }

    public function test_get_online_users_success()
    {
        $onlineUsers = [
            ['id' => 1, 'name' => 'User 1', 'status' => 'online'],
            ['id' => 2, 'name' => 'User 2', 'status' => 'online'],
        ];

        $this->userPresenceService
            ->shouldReceive('getOnlineUsers')
            ->once()
            ->andReturn(['success' => true, 'data' => $onlineUsers]);

        $response = $this->userStatusController->getOnlineUsers();

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($onlineUsers, $responseData['data']);
    }

    private function createMockRequest(array $data = [])
    {
        $request = Mockery::mock('Illuminate\Http\Request');
        $request->shouldReceive('all')->andReturn($data);
        $request->shouldReceive('input')->andReturnUsing(function ($key, $default = null) use ($data) {
            return $data[$key] ?? $default;
        });
        return $request;
    }
}
