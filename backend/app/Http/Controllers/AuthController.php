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
        $validated = $request->validated();
        [$ok, $code, $payload] = $this->authApp->register($validated);
        return response()->json([
            'success' => $ok,
            'data' => $ok ? [
                'user' => $payload['user'] ?? null,
                'token' => $payload['token'] ?? null,
                'token_type' => $payload['token_type'] ?? 'Bearer'
            ] : ($payload['errors'] ?? null),
            'message' => $payload['message'] ?? ''
        ], $code);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        [$ok, $code, $payload] = $this->authApp->login($validated);
        return response()->json([
            'success' => $ok,
            'data' => $ok ? [
                'user' => $payload['user'] ?? null,
                'token' => $payload['token'] ?? null,
                'token_type' => $payload['token_type'] ?? 'Bearer'
            ] : ($payload['errors'] ?? null),
            'message' => $payload['message'] ?? ''
        ], $code);
    }

    public function logout(Request $request): JsonResponse
    {
        [$ok, $code, $payload] = $this->authApp->logout();
        return response()->json([
            'success' => $ok,
            'message' => $payload['message'] ?? ''
        ], $code);
    }

    public function refresh(Request $request): JsonResponse
    {
        [$ok, $code, $payload] = $this->authApp->refresh();
        return response()->json([
            'success' => $ok,
            'data' => [
                'token' => $payload['token'] ?? null,
                'token_type' => $payload['token_type'] ?? 'Bearer'
            ],
            'message' => $payload['message'] ?? ''
        ], $code);
    }

    public function me(Request $request): JsonResponse
    {
        [$ok, $code, $payload] = $this->authApp->me();
        return response()->json([
            'success' => $ok,
            'data' => $payload['user'] ?? null,
            'message' => $payload['message'] ?? ''
        ], $code);
    }
}


