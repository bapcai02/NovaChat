<?php

namespace App\Interfaces\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Application\Services\UserApplicationService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    private UserApplicationService $userApp;

    public function __construct(UserApplicationService $userApp)
    {
        $this->userApp = $userApp;
    }

    public function index(): JsonResponse
    {
        $users = $this->userApp->getAllUsers();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->userApp->getUserById($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }
}


