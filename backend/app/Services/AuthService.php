<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthService
{
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

        $userId = DB::table('users')->insertGetId([
            'name' => $input['name'],
            'email' => $input['email'],
            'username' => $input['username'],
            'password' => Hash::make($input['password']),
            'is_online' => true,
            'last_seen_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user = DB::table('users')->find($userId);
        // Use Passport token via Eloquent model if available
        $eloUser = \App\Models\User::find($userId);
        $token = $eloUser ? $eloUser->createToken('auth_token')->accessToken : null;

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
        $eloUser = \App\Models\User::where('email', $input['email'])->first();
        if (!$eloUser) {
            return [false, 404, ['message' => 'User not found']];
        }
        $eloUser->update(['is_online' => true, 'last_seen_at' => now()]);
        $token = $eloUser->createToken('auth_token')->accessToken;
        return [true, 200, [
            'user' => $eloUser->only(['id','name','email','username','avatar','is_online','last_seen_at']),
            'token' => $token,
            'token_type' => 'Bearer',
            'message' => 'Login successful',
        ]];
    }

    public function logout(): array
    {
        $eloUser = Auth::user();
        if ($eloUser) {
            $eloUser->update(['is_online' => false, 'last_seen_at' => now()]);
            $eloUser->tokens()->each(function ($token) { $token->revoke(); });
        }
        return [true, 200, ['message' => 'Logged out successfully']];
    }

    public function refresh(): array
    {
        $eloUser = Auth::user();
        if (!$eloUser) {
            return [false, 401, ['message' => 'User not authenticated']];
        }
        request()->user()->token()->revoke();
        $token = $eloUser->createToken('auth_token')->accessToken;
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


