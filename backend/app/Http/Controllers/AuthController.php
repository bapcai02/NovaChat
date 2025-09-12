<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    private AuthService $authApp;

    public function __construct(AuthService $authApp)
    {
        $this->authApp = $authApp;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request) {
            $validated = $request->validated();
            [$ok, $code, $payload] = $this->authApp->register($validated);
            
            if (!$ok) {
                return $this->errorResponse(
                    $payload['message'] ?? 'Registration failed',
                    $payload['errors'] ?? null,
                    $code
                );
            }
            
            return $this->createdResponse([
                'user' => $payload['user'] ?? null,
                'token' => $payload['token'] ?? null,
                'token_type' => $payload['token_type'] ?? 'Bearer'
            ], $payload['message'] ?? 'User registered successfully');
        }, 'Registration completed', 'Registration failed');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request) {
            $validated = $request->validated();
            [$ok, $code, $payload] = $this->authApp->login($validated);
            
            if (!$ok) {
                return $this->errorResponse(
                    $payload['message'] ?? 'Login failed',
                    $payload['errors'] ?? null,
                    $code
                );
            }
            
            return $this->successResponse([
                'user' => $payload['user'] ?? null,
                'token' => $payload['token'] ?? null,
                'token_type' => $payload['token_type'] ?? 'Bearer'
            ], $payload['message'] ?? 'Login successful');
        }, 'Login completed', 'Login failed');
    }

    public function logout(Request $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () {
            [$ok, $code, $payload] = $this->authApp->logout();
            
            if (!$ok) {
                return $this->errorResponse(
                    $payload['message'] ?? 'Logout failed',
                    null,
                    $code
                );
            }
            
            return $this->successResponse(null, $payload['message'] ?? 'Logout successful');
        }, 'Logout completed', 'Logout failed');
    }

    public function refresh(Request $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () {
            [$ok, $code, $payload] = $this->authApp->refresh();
            
            if (!$ok) {
                return $this->errorResponse(
                    $payload['message'] ?? 'Token refresh failed',
                    null,
                    $code
                );
            }
            
            return $this->successResponse([
                'token' => $payload['token'] ?? null,
                'token_type' => $payload['token_type'] ?? 'Bearer'
            ], $payload['message'] ?? 'Token refreshed successfully');
        }, 'Token refresh completed', 'Token refresh failed');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () {
            [$ok, $code, $payload] = $this->authApp->me();
            
            if (!$ok) {
                return $this->errorResponse(
                    $payload['message'] ?? 'Failed to get user info',
                    null,
                    $code
                );
            }
            
            return $this->successResponse(
                $payload['user'] ?? null,
                $payload['message'] ?? 'User info retrieved successfully'
            );
        }, 'User info retrieved', 'Failed to get user info');
    }
}


