<?php

namespace App\Domain\User\Services;

use App\Domain\User\Entities\User;
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Domain\User\Events\UserRegistered;
use App\Domain\User\Events\UserProfileUpdated;
use App\Shared\Events\EventDispatcherInterface;

class UserService
{
    private UserRepositoryInterface $userRepository;
    private EventDispatcherInterface $eventDispatcher;

    public function __construct(
        UserRepositoryInterface $userRepository,
        EventDispatcherInterface $eventDispatcher
    ) {
        $this->userRepository = $userRepository;
        $this->eventDispatcher = $eventDispatcher;
    }

    public function registerUser(string $name, string $email, string $password, ?string $username = null): User
    {
        // Check if email already exists
        if ($this->userRepository->findByEmail($email)) {
            throw new \InvalidArgumentException('Email already exists');
        }

        // Check if username already exists
        if ($username && $this->userRepository->findByUsername($username)) {
            throw new \InvalidArgumentException('Username already exists');
        }

        $user = new User();
        $user->name = $name;
        $user->email = $email;
        $user->password = bcrypt($password);
        $user->username = $username;

        $this->userRepository->save($user);

        // Dispatch event
        $this->eventDispatcher->dispatch(new UserRegistered($user));

        return $user;
    }

    public function updateProfile(User $user, array $data): User
    {
        $originalData = [
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
        ];

        // Update fields
        if (isset($data['name'])) {
            $user->name = $data['name'];
        }

        if (isset($data['email']) && $data['email'] !== $user->email) {
            if ($this->userRepository->findByEmail($data['email'])) {
                throw new \InvalidArgumentException('Email already exists');
            }
            $user->email = $data['email'];
        }

        if (isset($data['username']) && $data['username'] !== $user->username) {
            if ($this->userRepository->findByUsername($data['username'])) {
                throw new \InvalidArgumentException('Username already exists');
            }
            $user->username = $data['username'];
        }

        $this->userRepository->save($user);

        // Dispatch event
        $this->eventDispatcher->dispatch(new UserProfileUpdated($user, $originalData));

        return $user;
    }

    public function updateLastSeen(User $user): void
    {
        $user->last_seen_at = now();
        $this->userRepository->save($user);
    }

    public function markOnline(User $user): void
    {
        $user->is_online = true;
        $user->last_seen_at = now();
        $this->userRepository->save($user);
    }

    public function markOffline(User $user): void
    {
        $user->is_online = false;
        $user->last_seen_at = now();
        $this->userRepository->save($user);
    }

    public function searchUsers(string $query, int $perPage = 15): array
    {
        return $this->userRepository->search($query, $perPage)->toArray();
    }

    public function getOnlineUsers(): array
    {
        return $this->userRepository->findOnlineUsers();
    }
}
