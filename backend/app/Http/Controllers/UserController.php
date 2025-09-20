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
            $users = $this->users->getAllUsers(100);
            
            // Convert avatar to full URL for each user
            $formattedUsers = array_map(function ($user) {
                // Convert avatar to full URL
                $avatar = $user->avatar ?? null;
                if ($avatar) {
                    // Remove /storage/ prefix if it exists
                    if (strpos($avatar, '/storage/') === 0) {
                        $avatar = substr($avatar, 9); // Remove '/storage/' (9 characters)
                    }
                    $avatar = 'http://localhost:8000/storage/' . $avatar;
                }
                
                // Convert to array and update avatar
                $userArray = $user->toArray();
                $userArray['avatar'] = $avatar;
                return $userArray;
            }, $users);

            return $this->successResponse($formattedUsers, 'Users retrieved successfully');
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
                // Convert avatar to full URL
                $avatar = $user['avatar'] ?? null;
                if ($avatar) {
                    // Remove /storage/ prefix if it exists
                    if (strpos($avatar, '/storage/') === 0) {
                        $avatar = substr($avatar, 9); // Remove '/storage/' (9 characters)
                    }
                    $avatar = 'http://localhost:8000/storage/' . $avatar;
                }

                return [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'avatar' => $avatar,
                    'status' => $user['is_online'] ? 'online' : 'offline',
                ];
            }, $users);

            return $this->successResponse($formattedUsers, 'User search completed successfully');
        }, 'User search completed', 'User search failed');
    }
}
