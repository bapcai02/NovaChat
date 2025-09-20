<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private UserService $users;

    public function __construct(UserService $users)
    {
        $this->users = $users;
    }

    public function index(): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () {
            $data = $this->users->getAllUsers(100);

            return $this->successResponse($data, 'Users retrieved successfully');
        }, 'Users retrieved', 'Failed to retrieve users');
    }

    public function search(Request $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request) {
            $keyword = $request->query('keyword', '');

            if (empty(trim($keyword))) {
                return $this->successResponse([], 'No search keyword provided');
            }

            $users = $this->users->searchUsers($keyword);

            // Format the response as requested
            $formattedUsers = array_map(function ($user) {
                return [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'avatar' => $user['avatar'] ?? null,
                    'status' => $user['is_online'] ? 'online' : 'offline',
                ];
            }, $users);

            return $this->successResponse($formattedUsers, 'User search completed successfully');
        }, 'User search completed', 'User search failed');
    }
}
