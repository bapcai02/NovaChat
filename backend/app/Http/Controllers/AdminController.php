<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    protected $users;

    public function __construct(UserRepositoryInterface $users)
    {
        $this->users = $users;
    }

    /**
     * Get all users with pagination and filters
     */
    public function getUsers(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $page = (int) $request->get('page', 1);
            $limit = (int) $request->get('limit', 20);
            $search = $request->get('search', '');
            $role = $request->get('role', 'all');
            $status = $request->get('status', 'all');

            $query = User::query();

            // Apply search filter
            if (! empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            }

            // Apply role filter
            if ($role !== 'all') {
                $query->where('role', $role);
            }

            // Apply status filter
            if ($status !== 'all') {
                $query->where('status', $status);
            }

            // Get paginated results
            $users = $query->orderBy('created_at', 'desc')
                ->paginate($limit, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function getStats(): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $stats = [
                'total_users' => User::count(),
                'online_users' => User::where('is_online', true)->count(),
                'admins' => User::whereIn('role', ['super_admin', 'admin'])->count(),
                'suspended' => User::whereIn('status', ['suspended', 'banned'])->count(),
                'verified_users' => User::where('is_verified', true)->count(),
                'premium_users' => User::where('is_premium', true)->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single user details
     */
    public function getUser(int $id): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $targetUser = User::find($id);
            if (! $targetUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $targetUser,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $targetUser = User::find($id);
            if (! $targetUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,'.$id,
                'username' => 'sometimes|string|max:255|unique:users,username,'.$id,
                'role' => 'sometimes|in:super_admin,admin,moderator,user,guest',
                'status' => 'sometimes|in:active,inactive,suspended,banned',
                'is_verified' => 'sometimes|boolean',
                'is_premium' => 'sometimes|boolean',
                'phone' => 'sometimes|nullable|string|max:20',
                'bio' => 'sometimes|nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $request->only([
                'name', 'email', 'username', 'role', 'status',
                'is_verified', 'is_premium', 'phone', 'bio',
            ]);

            $targetUser->update($data);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $targetUser->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete user
     */
    public function deleteUser(int $id): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $targetUser = User::find($id);
            if (! $targetUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Prevent deleting yourself
            if ($targetUser->id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete yourself',
                ], 400);
            }

            $targetUser->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get reports and analytics data
     */
    public function getReports(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $period = $request->get('period', '7d');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            // Calculate date range based on period
            switch ($period) {
                case '7d':
                    $startDate = now()->subDays(7);
                    $endDate = now();

                    break;
                case '30d':
                    $startDate = now()->subDays(30);
                    $endDate = now();

                    break;
                case '90d':
                    $startDate = now()->subDays(90);
                    $endDate = now();

                    break;
                case '1y':
                    $startDate = now()->subYear();
                    $endDate = now();

                    break;
                case 'custom':
                    $startDate = $startDate ? \Carbon\Carbon::parse($startDate) : now()->subDays(7);
                    $endDate = $endDate ? \Carbon\Carbon::parse($endDate) : now();

                    break;
            }

            // Get basic statistics
            $totalUsers = User::count();
            $newUsers = User::whereBetween('created_at', [$startDate, $endDate])->count();
            $activeUsers = User::where('is_online', true)->count();

            // Get message statistics
            $totalMessages = \App\Models\Message::whereBetween('created_at', [$startDate, $endDate])->count();
            $totalBookmarks = \App\Models\Bookmark::whereBetween('created_at', [$startDate, $endDate])->count();

            // Calculate engagement (simplified)
            $userEngagement = $activeUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 1) : 0;

            // Get top users by message count
            $topUsers = User::withCount(['messages' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
                ->withCount(['bookmarks' => function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }])
                ->orderBy('messages_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'messageCount' => $user->messages_count,
                        'bookmarkCount' => $user->bookmarks_count,
                    ];
                });

            // Get daily statistics
            $dailyStats = [];
            $currentDate = $startDate->copy();
            while ($currentDate->lte($endDate)) {
                $dayUsers = User::whereDate('created_at', $currentDate)->count();
                $dayMessages = \App\Models\Message::whereDate('created_at', $currentDate)->count();
                $dayBookmarks = \App\Models\Bookmark::whereDate('created_at', $currentDate)->count();

                $dailyStats[] = [
                    'date' => $currentDate->format('Y-m-d'),
                    'users' => $dayUsers,
                    'messages' => $dayMessages,
                    'bookmarks' => $dayBookmarks,
                ];

                $currentDate->addDay();
            }

            $reportData = [
                'period' => $period,
                'totalUsers' => $totalUsers,
                'newUsers' => $newUsers,
                'activeUsers' => $activeUsers,
                'totalMessages' => $totalMessages,
                'totalBookmarks' => $totalBookmarks,
                'userEngagement' => $userEngagement,
                'averageSessionTime' => 24.5, // Mock data for now
                'topUsers' => $topUsers,
                'dailyStats' => $dailyStats,
            ];

            return response()->json([
                'success' => true,
                'data' => $reportData,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reports',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create new user
     */
    public function createUser(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:8',
                'username' => 'nullable|string|max:255|unique:users',
                'role' => 'required|in:super_admin,admin,moderator,user,guest',
                'status' => 'sometimes|in:active,inactive,suspended,banned',
                'phone' => 'nullable|string|max:20',
                'bio' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $request->only([
                'name', 'email', 'username', 'role', 'status', 'phone', 'bio',
            ]);
            $data['password'] = Hash::make($request->password);
            $data['status'] = $data['status'] ?? 'active';

            $newUser = User::create($data);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $newUser,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all messages with pagination and filters
     */
    public function getMessages(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 20);
            $search = $request->get('search');
            $userId = $request->get('user_id');

            $query = \App\Models\Message::with(['user', 'room'])
                ->orderBy('created_at', 'desc');

            if ($search) {
                $query->where('content', 'like', "%{$search}%");
            }

            if ($userId) {
                $query->where('user_id', $userId);
            }

            $total = $query->count();
            $messages = $query->skip(($page - 1) * $limit)
                ->take($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $messages,
                'pagination' => [
                    'current_page' => $page,
                    'last_page' => ceil($total / $limit),
                    'per_page' => $limit,
                    'total' => $total,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve messages',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a message
     */
    public function deleteMessage($id): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $message = \App\Models\Message::findOrFail($id);
            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete message',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all bookmarks with pagination
     */
    public function getBookmarks(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 20);
            $userId = $request->get('user_id');

            $query = \App\Models\Bookmark::with(['user', 'message.user'])
                ->orderBy('created_at', 'desc');

            if ($userId) {
                $query->where('user_id', $userId);
            }

            $total = $query->count();
            $bookmarks = $query->skip(($page - 1) * $limit)
                ->take($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bookmarks,
                'pagination' => [
                    'current_page' => $page,
                    'last_page' => ceil($total / $limit),
                    'per_page' => $limit,
                    'total' => $total,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve bookmarks',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a bookmark
     */
    public function deleteBookmark($id): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $bookmark = \App\Models\Bookmark::findOrFail($id);
            $bookmark->delete();

            return response()->json([
                'success' => true,
                'message' => 'Bookmark deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete bookmark',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ban/Unban a user
     */
    public function toggleUserBan(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $targetUser = User::findOrFail($id);
            $action = $request->get('action'); // 'ban' or 'unban'
            $reason = $request->get('reason', '');

            if ($action === 'ban') {
                $targetUser->update([
                    'status' => 'banned',
                    'banned_at' => now(),
                    'ban_reason' => $reason,
                ]);
                $message = 'User banned successfully';
            } elseif ($action === 'unban') {
                $targetUser->update([
                    'status' => 'active',
                    'banned_at' => null,
                    'ban_reason' => null,
                ]);
                $message = 'User unbanned successfully';
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid action. Use "ban" or "unban"',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $targetUser,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get system logs
     */
    public function getLogs(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 50);
            $level = $request->get('level');
            $date = $request->get('date');

            // Read Laravel log file
            $logFile = storage_path('logs/laravel.log');
            $logs = [];

            if (file_exists($logFile)) {
                $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                $totalLines = count($lines);

                // Filter by level if specified
                if ($level) {
                    $lines = array_filter($lines, function ($line) use ($level) {
                        return strpos($line, ".{$level}:") !== false;
                    });
                }

                // Filter by date if specified
                if ($date) {
                    $lines = array_filter($lines, function ($line) use ($date) {
                        return strpos($line, $date) !== false;
                    });
                }

                $filteredLines = array_values($lines);
                $total = count($filteredLines);

                // Paginate
                $offset = ($page - 1) * $limit;
                $paginatedLines = array_slice($filteredLines, $offset, $limit);

                $logs = array_map(function ($line) {
                    return [
                        'content' => $line,
                        'timestamp' => substr($line, 0, 19), // Extract timestamp
                    ];
                }, $paginatedLines);
            }

            return response()->json([
                'success' => true,
                'data' => $logs,
                'pagination' => [
                    'current_page' => $page,
                    'last_page' => ceil($total / $limit),
                    'per_page' => $limit,
                    'total' => $total,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
