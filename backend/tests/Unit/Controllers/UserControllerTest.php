<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\UserController;
use App\Services\UserService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Mockery;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private UserService $userService;
    private UserController $userController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userService = Mockery::mock(UserService::class);
        $this->userController = new UserController($this->userService);
    }

    public function test_index_success()
    {
        $users = [
            ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com'],
            ['id' => 2, 'name' => 'Jane Doe', 'email' => 'jane@example.com'],
        ];

        $this->userService
            ->shouldReceive('getAllUsers')
            ->with(100)
            ->once()
            ->andReturn($users);

        $response = $this->userController->index();

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($users, $responseData['data']);
        $this->assertEquals('Users retrieved successfully', $responseData['message']);
    }

    public function test_search_success()
    {
        $users = [
            ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com'],
        ];

        $this->userService
            ->shouldReceive('searchUsers')
            ->with('john')
            ->once()
            ->andReturn($users);

        $request = $this->createMockRequest(['keyword' => 'john']);
        $response = $this->userController->search($request);

        $this->assertEquals(500, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
    }

    public function test_search_empty_keyword()
    {
        $request = $this->createMockRequest(['keyword' => '']);
        $response = $this->userController->search($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals([], $responseData['data']);
        $this->assertEquals('No search keyword provided', $responseData['message']);
    }


    private function createMockRequest(array $query = [])
    {
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('query')->andReturnUsing(function ($key, $default = null) use ($query) {
            return $query[$key] ?? $default;
        });
        return $request;
    }
}
