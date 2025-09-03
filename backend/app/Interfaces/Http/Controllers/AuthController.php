<?php

namespace App\Interfaces\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Application\Services\AuthApplicationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Interfaces\Request\AuthRequest;

class AuthController extends Controller
{
    private AuthApplicationService $authApp;

    public function __construct(AuthApplicationService $authApp)
    {
        $this->authApp = $authApp;
    }

    public function register(AuthRequest $request): JsonResponse
    {
        [$ok, $code, $payload] = $this->authApp->register($request->validated());
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

    public function login(AuthRequest $request): JsonResponse
    {
        [$ok, $code, $payload] = $this->authApp->login($request->validated());
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


