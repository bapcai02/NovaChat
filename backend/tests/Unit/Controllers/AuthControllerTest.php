<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\AuthController;
use App\Services\AuthService;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private $authService;
    private $authController;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->authService = Mockery::mock(AuthService::class);
        $this->authController = new AuthController($this->authService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_register_success()
    {
        $user = User::factory()->create();
        
        $this->authService
            ->shouldReceive('register')
            ->with(Mockery::type('array'))
            ->andReturn([
                true,
                201,
                [
                    'user' => $user->only(['id', 'name', 'email', 'username', 'avatar', 'is_online', 'last_seen_at']),
                    'token' => 'fake-token',
                    'token_type' => 'Bearer',
                    'message' => 'User registered successfully',
                ]
            ]);

        $requestData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'username' => 'johndoe',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $request = $this->createMockRequest($requestData);
        $response = $this->authController->register($request);

        $this->assertEquals(201, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
        $this->assertArrayHasKey('user', $responseData['data']);
        $this->assertArrayHasKey('token', $responseData['data']);
    }

    public function test_register_validation_error()
    {
        $this->authService
            ->shouldReceive('register')
            ->with(Mockery::type('array'))
            ->andReturn([
                false,
                422,
                [
                    'message' => 'Validation failed',
                    'errors' => [
                        'email' => ['Email already exists']
                    ]
                ]
            ]);

        $requestData = [
            'name' => 'John Doe',
            'email' => 'existing@example.com',
            'username' => 'johndoe',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $request = $this->createMockRequest($requestData);
        $response = $this->authController->register($request);

        $this->assertEquals(422, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertArrayHasKey('errors', $responseData);
    }

    public function test_login_success()
    {
        $user = User::factory()->create();
        
        $this->authService
            ->shouldReceive('login')
            ->with(Mockery::type('array'))
            ->andReturn([
                true,
                200,
                [
                    'user' => $user->only(['id', 'name', 'email', 'username', 'avatar', 'is_online', 'last_seen_at']),
                    'token' => 'fake-token',
                    'token_type' => 'Bearer',
                    'message' => 'Login successful',
                ]
            ]);

        $requestData = [
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $request = $this->createMockLoginRequest($requestData);
        $response = $this->authController->login($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
        $this->assertArrayHasKey('user', $responseData['data']);
        $this->assertArrayHasKey('token', $responseData['data']);
    }

    public function test_login_invalid_credentials()
    {
        $this->authService
            ->shouldReceive('login')
            ->with(Mockery::type('array'))
            ->andReturn([
                false,
                401,
                [
                    'message' => 'Invalid credentials'
                ]
            ]);

        $requestData = [
            'email' => 'john@example.com',
            'password' => 'wrongpassword',
        ];

        $request = $this->createMockLoginRequest($requestData);
        $response = $this->authController->login($request);

        $this->assertEquals(401, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertArrayHasKey('message', $responseData);
    }

    public function test_logout_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->authService
            ->shouldReceive('logout')
            ->andReturn([
                true,
                200,
                ['message' => 'Logout successful']
            ]);

        $request = Mockery::mock('Illuminate\Http\Request');
        $response = $this->authController->logout($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('message', $responseData);
    }

    public function test_me_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->authService
            ->shouldReceive('me')
            ->andReturn([
                true,
                200,
                ['user' => $user->only(['id', 'name', 'email', 'username', 'avatar', 'is_online', 'last_seen_at'])]
            ]);

        $request = Mockery::mock('Illuminate\Http\Request');
        $response = $this->authController->me($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
        $this->assertEquals($user->id, $responseData['data']['id']);
    }

    private function createMockRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\RegisterRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }

    private function createMockLoginRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\LoginRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }
}
