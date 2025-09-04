<?php

namespace App\Http\Controllers;

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

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'username' => 'required|string|max:50',
            'password' => 'required|string|min:8|confirmed',
        ]);
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

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);
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


