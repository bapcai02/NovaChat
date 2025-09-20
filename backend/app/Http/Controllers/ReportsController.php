<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportsController extends Controller
{
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
}
