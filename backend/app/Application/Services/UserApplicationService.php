<?php

namespace App\Application\Services;

use App\Domain\User\Services\UserService;
use App\Domain\User\Entities\User;
use App\Application\DTOs\UserDTO;
use App\Application\Commands\CreateUserCommand;
use App\Application\Commands\UpdateUserCommand;
use App\Application\Queries\GetUserQuery;
use App\Application\Queries\SearchUsersQuery;

class UserApplicationService
{
    public function __construct(
        private UserService $userService
    ) {}

    public function createUser(CreateUserCommand $command): UserDTO
    {
        $user = $this->userService->registerUser(
            $command->name,
            $command->email,
            $command->password,
            $command->username
        );

        return UserDTO::fromEntity($user);
    }

    public function updateUser(UpdateUserCommand $command): UserDTO
    {
        $user = $this->userService->updateProfile(
            $command->user,
            $command->data
        );

        return UserDTO::fromEntity($user);
    }

    public function getUser(GetUserQuery $query): ?UserDTO
    {
        $user = $this->userService->findById($query->userId);
        
        return $user ? UserDTO::fromEntity($user) : null;
    }

    public function searchUsers(SearchUsersQuery $query): array
    {
        $users = $this->userService->searchUsers($query->query, $query->perPage);
        
        return array_map(fn($user) => UserDTO::fromEntity($user), $users);
    }

    public function getOnlineUsers(): array
    {
        $users = $this->userService->getOnlineUsers();
        
        return array_map(fn($user) => UserDTO::fromEntity($user), $users);
    }
}
