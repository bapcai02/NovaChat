<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function __construct(private UserService $users)
    {
    }

    public function index(): JsonResponse
    {
        $data = $this->users->getAllUsers(100);
        return response()->json(['data' => $data]);
    }
}


