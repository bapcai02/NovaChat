<?php

namespace App\Application\Services;

use App\Domain\User\Entities\User;
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Domain\User\Services\UserService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthApplicationService
{
    public function __construct(
        protected UserRepositoryInterface $users,
        protected UserService $userService
    ) {}

    public function register(array $input): array
    {
        $validator = Validator::make($input, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:50|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return [false, 422, ['errors' => $validator->errors(), 'message' => 'Validation failed']];
        }

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'username' => $input['username'],
            'password' => Hash::make($input['password']),
            'is_online' => true,
            'last_seen_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->accessToken;

        return [true, 201, [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'message' => 'User registered successfully',
        ]];
    }

    public function login(array $input): array
    {
        $validator = Validator::make($input, [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return [false, 422, ['errors' => $validator->errors(), 'message' => 'Validation failed']];
        }

        if (!Auth::attempt(['email' => $input['email'], 'password' => $input['password']])) {
            return [false, 401, ['message' => 'Invalid credentials']];
        }

        $user = $this->users->findByEmail($input['email']);
        if (!$user) {
            return [false, 404, ['message' => 'User not found']];
        }

        $this->userService->updateUserStatus($user->id, 'online');
        $this->userService->updateLastSeen($user->id);

        $token = $user->createToken('auth_token')->accessToken;

        return [true, 200, [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'message' => 'Login successful',
        ]];
    }

    public function logout(): array
    {
        $user = Auth::user();
        if ($user) {
            $this->userService->updateUserStatus($user->id, 'offline');
            $this->userService->updateLastSeen($user->id);
            $user->tokens()->each(function ($token) {
                $token->revoke();
            });
        }

        return [true, 200, ['message' => 'Logged out successfully']];
    }

    public function refresh(): array
    {
        $user = Auth::user();
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


