<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\UserService;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;

class UserServiceTest extends TestCase
{
    private UserRepositoryInterface $userRepository;
    private UserService $userService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userRepository = Mockery::mock(UserRepositoryInterface::class);
        $this->userService = new UserService($this->userRepository);
    }

    public function test_get_all_users_success()
    {
        $users = [
            ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com'],
            ['id' => 2, 'name' => 'Jane Doe', 'email' => 'jane@example.com'],
        ];

        $paginator = Mockery::mock(LengthAwarePaginator::class);
        $paginator->shouldReceive('items')->andReturn($users);

        $this->userRepository
            ->shouldReceive('paginate')
            ->with(100)
            ->once()
            ->andReturn($paginator);

        $result = $this->userService->getAllUsers(100);

        $this->assertEquals($users, $result);
    }

    public function test_get_user_by_id_success()
    {
        $user = (object) ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com'];

        $this->userRepository
            ->shouldReceive('findById')
            ->with(1)
            ->once()
            ->andReturn($user);

        $result = $this->userService->getUserById(1);

        $this->assertEquals((array) $user, $result);
    }

    public function test_get_user_by_id_not_found()
    {
        $this->userRepository
            ->shouldReceive('findById')
            ->with(999)
            ->once()
            ->andReturn(null);

        $result = $this->userService->getUserById(999);

        $this->assertNull($result);
    }

    public function test_search_users_success()
    {
        $users = [
            ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com'],
        ];

        $paginator = Mockery::mock(LengthAwarePaginator::class);
        $paginator->shouldReceive('items')->andReturn($users);

        $this->userRepository
            ->shouldReceive('search')
            ->with('john', 20)
            ->once()
            ->andReturn($paginator);

        $result = $this->userService->searchUsers('john');

        $this->assertEquals($users, $result);
    }
}
