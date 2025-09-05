<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    private UserService $users;

    public function __construct(UserService $users)
    {
        $this->users = $users;
    }

    public function index(): JsonResponse
    {
        $data = $this->users->getAllUsers(100);
        return response()->json(['data' => $data]);
    }
}


