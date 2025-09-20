<?php

namespace Tests\Unit\Services;

use App\Services\AuthService;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private $userRepository;
    private $authService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = Mockery::mock(UserRepositoryInterface::class);
        $this->authService = new AuthService($this->userRepository);
        
        // Mock Passport token creation
        $this->mock('Laravel\Passport\PersonalAccessTokenFactory', function ($mock) {
            $mock->shouldReceive('make')->andReturn((object) [
                'accessToken' => 'fake-token',
                'token' => (object) ['id' => 'fake-token-id']
            ]);
        });
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_register_success()
    {
        $input = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'username' => 'johndoe',
            'password' => 'password123',
        ];

        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'username' => 'johndoe',
        ]);

        $this->userRepository
            ->shouldReceive('findByEmail')
            ->with('john@example.com')
            ->andReturn(null);

        $this->userRepository
            ->shouldReceive('findByUsername')
            ->with('johndoe')
            ->andReturn(null);

        $this->userRepository
            ->shouldReceive('create')
            ->with(Mockery::on(function ($data) use ($input) {
                return $data['name'] === $input['name'] &&
                       $data['email'] === $input['email'] &&
                       $data['username'] === $input['username'] &&
                       isset($data['password']) &&
                       $data['is_online'] === true &&
                       isset($data['last_seen_at']);
            }))
            ->andReturn($user);

        $result = $this->authService->register($input);

        $this->assertTrue($result[0]);
        $this->assertEquals(201, $result[1]);
        $this->assertArrayHasKey('user', $result[2]);
        $this->assertArrayHasKey('token', $result[2]);
        $this->assertArrayHasKey('token_type', $result[2]);
        $this->assertEquals('Bearer', $result[2]['token_type']);
    }

    public function test_register_email_already_exists()
    {
        $input = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'username' => 'johndoe',
            'password' => 'password123',
        ];

        $existingUser = User::factory()->create(['email' => 'john@example.com']);

        $this->userRepository
            ->shouldReceive('findByEmail')
            ->with('john@example.com')
            ->andReturn($existingUser);

        $result = $this->authService->register($input);

        $this->assertFalse($result[0]);
        $this->assertEquals(422, $result[1]);
        $this->assertArrayHasKey('errors', $result[2]);
        $this->assertArrayHasKey('email', $result[2]['errors']);
    }

    public function test_register_username_already_exists()
    {
        $input = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'username' => 'johndoe',
            'password' => 'password123',
        ];

        $existingUser = User::factory()->create(['username' => 'johndoe']);

        $this->userRepository
            ->shouldReceive('findByEmail')
            ->with('john@example.com')
            ->andReturn(null);

        $this->userRepository
            ->shouldReceive('findByUsername')
            ->with('johndoe')
            ->andReturn($existingUser);

        $result = $this->authService->register($input);

        $this->assertFalse($result[0]);
        $this->assertEquals(422, $result[1]);
        $this->assertArrayHasKey('errors', $result[2]);
        $this->assertArrayHasKey('username', $result[2]['errors']);
    }

    public function test_login_success()
    {
        $input = [
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
        ]);

        $this->userRepository
            ->shouldReceive('findByEmail')
            ->with('john@example.com')
            ->andReturn($user);

        $this->userRepository
            ->shouldReceive('update')
            ->with($user->id, Mockery::type('array'))
            ->andReturn($user);

        $result = $this->authService->login($input);

        $this->assertTrue($result[0]);
        $this->assertEquals(200, $result[1]);
        $this->assertArrayHasKey('user', $result[2]);
        $this->assertArrayHasKey('token', $result[2]);
        $this->assertArrayHasKey('token_type', $result[2]);
    }

    public function test_login_invalid_credentials()
    {
        $input = [
            'email' => 'john@example.com',
            'password' => 'wrongpassword',
        ];

        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
        ]);

        $this->userRepository
            ->shouldReceive('findByEmail')
            ->with('john@example.com')
            ->andReturn($user);

        $result = $this->authService->login($input);

        $this->assertFalse($result[0]);
        $this->assertEquals(401, $result[1]);
        $this->assertArrayHasKey('message', $result[2]);
    }

    public function test_login_user_not_found()
    {
        $input = [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ];

        $this->userRepository
            ->shouldReceive('findByEmail')
            ->with('nonexistent@example.com')
            ->andReturn(null);

        $result = $this->authService->login($input);

        $this->assertFalse($result[0]);
        $this->assertEquals(401, $result[1]);
        $this->assertArrayHasKey('message', $result[2]);
    }
}
