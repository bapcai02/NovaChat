<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\AdminController;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class AdminControllerTest extends TestCase
{
    use RefreshDatabase;

    private UserRepositoryInterface $userRepository;
    private AdminController $adminController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userRepository = Mockery::mock(UserRepositoryInterface::class);
        $this->adminController = new AdminController($this->userRepository);
    }

    public function test_get_users_success()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        // Create some test users
        User::factory()->count(2)->create();

        $request = $this->createMockRequest();
        $response = $this->adminController->getUsers($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_get_users_unauthorized()
    {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user);

        $request = $this->createMockRequest();
        $response = $this->adminController->getUsers($request);

        $this->assertEquals(403, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Unauthorized', $responseData['message']);
    }

    public function test_get_users_unauthenticated()
    {
        $request = $this->createMockRequest();
        $response = $this->adminController->getUsers($request);

        $this->assertEquals(403, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Unauthorized', $responseData['message']);
    }

    public function test_create_user_success()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'user',
            'status' => 'active',
        ];

        $request = $this->createMockRequest($userData);
        $response = $this->adminController->createUser($request);

        // Debug: Check what status code we actually get
        $responseData = json_decode($response->getContent(), true);
        if ($response->getStatusCode() !== 201) {
            $this->fail('Expected 201 but got ' . $response->getStatusCode() . '. Response: ' . json_encode($responseData));
        }

        $this->assertEquals(201, $response->getStatusCode());
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_create_user_validation_error()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $userData = [
            'name' => '',
            'email' => 'invalid-email',
        ];

        $request = $this->createMockRequest($userData);
        $response = $this->adminController->createUser($request);

        $this->assertEquals(422, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertArrayHasKey('errors', $responseData);
    }

    public function test_update_user_success()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $this->actingAs($admin);

        $userData = [
            'name' => 'Updated User',
            'email' => 'updated@example.com',
        ];

        $request = $this->createMockRequest($userData);
        $response = $this->adminController->updateUser($request, $user->id);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_delete_user_success()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $this->actingAs($admin);

        $response = $this->adminController->deleteUser($user->id);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('User deleted successfully', $responseData['message']);
    }

    private function createMockRequest(array $data = [])
    {
        $request = Mockery::mock('Illuminate\Http\Request');
        $request->shouldReceive('all')->andReturn($data);
        $request->shouldReceive('input')->andReturnUsing(function ($key, $default = null) use ($data) {
            return $data[$key] ?? $default;
        });
        $request->shouldReceive('query')->andReturnUsing(function ($key, $default = null) use ($data) {
            return $data[$key] ?? $default;
        });
        $request->shouldReceive('get')->andReturnUsing(function ($key, $default = null) use ($data) {
            return $data[$key] ?? $default;
        });
        $request->shouldReceive('only')->andReturnUsing(function ($keys) use ($data) {
            if (is_array($keys)) {
                return array_intersect_key($data, array_flip($keys));
            }
            return $data[$keys] ?? null;
        });
        return $request;
    }
}
