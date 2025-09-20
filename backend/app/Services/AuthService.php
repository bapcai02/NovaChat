<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    private UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function register(array $input): array
    {
        // Check if user already exists
        if ($this->userRepository->findByEmail($input['email'])) {
            return [false, 422, ['errors' => ['email' => ['Email already exists']], 'message' => 'Validation failed']];
        }

        if ($this->userRepository->findByUsername($input['username'])) {
            return [false, 422, ['errors' => ['username' => ['Username already exists']], 'message' => 'Validation failed']];
        }

        // Create user data
        $userData = [
            'name' => $input['name'],
            'email' => $input['email'],
            'username' => $input['username'],
            'password' => Hash::make($input['password']),
            'is_online' => true,
            'last_seen_at' => now(),
        ];

        $user = $this->userRepository->create($userData);
        $token = $user->createToken('auth_token')->accessToken;

        return [true, 201, [
            'user' => $user->only(['id', 'name', 'email', 'username', 'avatar', 'is_online', 'last_seen_at']),
            'token' => $token,
            'token_type' => 'Bearer',
            'message' => 'User registered successfully',
        ]];
    }

    public function login(array $input): array
    {
        if (! Auth::attempt(['email' => $input['email'], 'password' => $input['password']])) {
            return [false, 401, ['message' => 'Invalid credentials']];
        }

        $user = $this->userRepository->findByEmail($input['email']);
        if (! $user) {
            return [false, 404, ['message' => 'User not found']];
        }

        $this->userRepository->update($user->id, [
            'is_online' => true,
            'last_seen_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->accessToken;

        return [true, 200, [
            'user' => $user->only(['id', 'name', 'email', 'username', 'avatar', 'is_online', 'last_seen_at']),
            'token' => $token,
            'token_type' => 'Bearer',
            'message' => 'Login successful',
        ]];
    }

    public function logout(): array
    {
        $user = Auth::user();
        if ($user) {
            $this->userRepository->update($user->id, [
                'is_online' => false,
                'last_seen_at' => now(),
            ]);
            $user->tokens()->each(function ($token) {
                $token->revoke();
            });
        }

        return [true, 200, ['message' => 'Logged out successfully']];
    }

    public function refresh(): array
    {
        $user = Auth::user();
        if (! $user) {
            return [false, 401, ['message' => 'User not authenticated']];
        }

        request()->user()->token()->revoke();
        $token = $user->createToken('auth_token')->accessToken;

        return [true, 200, [
            'token' => $token,
            'token_type' => 'Bearer',
            'message' => 'Token refreshed successfully',
        ]];
    }

    public function me(): array
    {
        return [true, 200, ['user' => Auth::user(), 'message' => 'User retrieved successfully']];
    }
}
