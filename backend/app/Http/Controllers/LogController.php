<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Services\LogService;

class LogController extends Controller
{
    protected $logService;

    public function __construct()
    {
        // LogService methods are static, no need to inject
    }

    public function index(Request $request)
    {
        $channel = $request->get('channel', 'api');
        $lines = $request->get('lines', 100);
        $level = $request->get('level');
        $search = $request->get('search');
        $user = auth()->user();
        
        // Check if user can access this channel
        if (!$this->canAccessChannel($user, $channel)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied for this log channel'
            ], 403);
        }
        
        try {
            $logs = LogService::getLogs($channel, $lines, $level, $search);
            
            // Filter logs for non-admin users
            if ($user->role !== 'admin') {
                $logs = $this->filterLogsForUser($logs, $user->id);
            }
            
            return response()->json([
                'success' => true,
                'channel' => $channel,
                'lines' => $lines,
                'level' => $level,
                'search' => $search,
                'logs' => $logs,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve logs: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function channels()
    {
        $user = auth()->user();
        $logPath = storage_path('logs');
        $files = File::allFiles($logPath);
        
        $channels = [];
        foreach ($files as $file) {
            $name = $file->getFilename();
            if (str_ends_with($name, '.log')) {
                $channel = str_replace('.log', '', $name);
                
                // Check if user can access this channel
                if ($this->canAccessChannel($user, $channel)) {
                    $channels[] = [
                        'name' => $channel,
                        'size' => $this->formatBytes($file->getSize()),
                        'modified' => date('Y-m-d H:i:s', $file->getMTime()),
                    ];
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'channels' => $channels
        ]);
    }
    
    public function stats(Request $request)
    {
        $user = auth()->user();
        
        // Only admin can view stats
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin access required'
            ], 403);
        }
        
        try {
            $stats = LogService::getStats();
            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve stats: ' . $e->getMessage()
            ], 500);
        }
    }

    public function score()
    {
        $user = auth()->user();
        
        // Only admin can view score
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin access required'
            ], 403);
        }
        
        try {
            $score = LogService::getLogScore();
            return response()->json([
                'success' => true,
                'score' => $score
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve score: ' . $e->getMessage()
            ], 500);
        }
    }

    public function export(Request $request)
    {
        $channel = $request->get('channel', 'api');
        $lines = $request->get('lines', 1000);
        $user = auth()->user();
        
        // Check if user can access this channel
        if (!$this->canAccessChannel($user, $channel)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied for this log channel'
            ], 403);
        }
        
        try {
            $logs = LogService::getLogs($channel, $lines);
            
            // Filter logs for non-admin users
            if ($user->role !== 'admin') {
                $logs = $this->filterLogsForUser($logs, $user->id);
            }
            
            $content = '';
            foreach ($logs as $log) {
                $content .= $log['timestamp'] . ' [' . $log['level'] . '] ' . $log['message'] . "\n";
            }
            
            return response($content)
                ->header('Content-Type', 'text/plain')
                ->header('Content-Disposition', 'attachment; filename="' . $channel . '-logs-' . date('Y-m-d') . '.txt"');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export logs: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cleanup(Request $request)
    {
        $user = auth()->user();
        
        // Only admin can cleanup logs
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin access required'
            ], 403);
        }
        
        try {
            $days = $request->get('days', 30);
            LogService::cleanupLogs($days);
            
            return response()->json([
                'success' => true,
                'message' => "Logs older than {$days} days have been cleaned up"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cleanup logs: ' . $e->getMessage()
            ], 500);
        }
    }
    
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    private function canAccessChannel($user, $channel)
    {
        if (!$user) {
            return false;
        }

        // Admin can access all channels
        if ($user->role === 'admin') {
            return true;
        }

        // Regular users can only access basic channels
        $allowedChannels = ['api', 'auth', 'chat'];
        return in_array($channel, $allowedChannels);
    }

    private function filterLogsForUser($logs, $userId)
    {
        return array_filter($logs, function($log) use ($userId) {
            // Only show logs related to this user
            return isset($log['user_id']) && $log['user_id'] == $userId;
        });
    }
}
