<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class LogService
{
    /**
     * Generic log method
     */
    public static function log(string $channel, string $level, string $message, array $context = []): void
    {
        $context = array_merge([
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ], $context);

        Log::channel($channel)->{$level}($message, $context);
    }

    /**
     * Log authentication events
     */
    public static function auth(string $action, array $data = []): void
    {
        $context = array_merge([
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ], $data);

        Log::channel('auth')->info("Auth: {$action}", $context);
    }

    /**
     * Log API requests and responses
     */
    public static function api(string $method, string $endpoint, int $statusCode, float $responseTime, array $data = []): void
    {
        $context = array_merge([
            'method' => $method,
            'endpoint' => $endpoint,
            'status_code' => $statusCode,
            'response_time' => $responseTime,
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'timestamp' => now()->toISOString(),
        ], $data);

        $level = $statusCode >= 400 ? 'error' : 'info';
        Log::channel('api')->{$level}("API: {$method} {$endpoint} - {$statusCode}", $context);
    }

    /**
     * Log chat events
     */
    public static function chat(string $action, array $data = []): void
    {
        $context = array_merge([
            'user_id' => Auth::id(),
            'timestamp' => now()->toISOString(),
        ], $data);

        Log::channel('chat')->info("Chat: {$action}", $context);
    }

    /**
     * Log WebSocket events
     */
    public static function websocket(string $action, array $data = []): void
    {
        $context = array_merge([
            'user_id' => Auth::id(),
            'timestamp' => now()->toISOString(),
        ], $data);

        Log::channel('websocket')->info("WebSocket: {$action}", $context);
    }

    /**
     * Log security events
     */
    public static function security(string $action, array $data = []): void
    {
        $context = array_merge([
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ], $data);

        Log::channel('security')->warning("Security: {$action}", $context);
    }

    /**
     * Log performance metrics
     */
    public static function performance(string $action, float $duration, array $data = []): void
    {
        $context = array_merge([
            'duration' => $duration,
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true),
            'timestamp' => now()->toISOString(),
        ], $data);

        Log::channel('performance')->info("Performance: {$action}", $context);
    }

    /**
     * Log database queries
     */
    public static function database(string $action, array $data = []): void
    {
        $context = array_merge([
            'user_id' => Auth::id(),
            'timestamp' => now()->toISOString(),
        ], $data);

        Log::channel('database')->info("Database: {$action}", $context);
    }

    /**
     * Log custom events
     */
    public static function custom(string $channel, string $level, string $message, array $data = []): void
    {
        $context = array_merge([
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'timestamp' => now()->toISOString(),
        ], $data);

        Log::channel($channel)->{$level}($message, $context);
    }

    /**
     * Log errors with context
     */
    public static function error(string $message, \Throwable $exception = null, array $data = []): void
    {
        $context = array_merge([
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ], $data);

        if ($exception) {
            $context['exception'] = [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ];
        }

        Log::error($message, $context);
    }

    /**
     * Log with structured data
     */
    public static function structured(string $channel, string $level, string $message, array $context = []): void
    {
        $structuredContext = array_merge([
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
            'request_id' => request()->header('X-Request-ID', uniqid()),
        ], $context);

        Log::channel($channel)->{$level}($message, $structuredContext);
    }

    /**
     * Get logs from a specific channel
     */
    public static function getLogs(string $channel, int $lines = 100, string $level = null, string $search = null): array
    {
        $logPath = storage_path("logs/{$channel}-" . now()->format('Y-m-d') . ".log");
        
        if (!file_exists($logPath)) {
            // Try without date suffix
            $logPath = storage_path("logs/{$channel}.log");
            if (!file_exists($logPath)) {
                return [];
            }
        }

        $command = "tail -n {$lines} " . escapeshellarg($logPath);
        
        if ($level) {
            $command .= " | grep -i '{$level}'";
        }
        
        if ($search) {
            $command .= " | grep -i " . escapeshellarg($search);
        }
        
        $logs = shell_exec($command);
        
        if (!$logs) {
            return [];
        }

        $logLines = explode("\n", trim($logs));
        $parsedLogs = [];

        foreach ($logLines as $line) {
            if (empty($line)) continue;
            
            // Parse Laravel log format: [timestamp] level.message context
            if (preg_match('/^\[([^\]]+)\]\s+(\w+)\.(\w+):\s+(.+?)\s+(\{.*\})?$/', $line, $matches)) {
                $timestamp = $matches[1];
                $logLevel = strtolower($matches[3]);
                $message = $matches[4];
                $context = isset($matches[5]) ? json_decode($matches[5], true) : [];

                $parsedLogs[] = [
                    'timestamp' => $timestamp,
                    'level' => $logLevel,
                    'message' => $message,
                    'context' => $context,
                ];
            }
        }

        return array_reverse($parsedLogs); // Most recent first
    }

    /**
     * Get log statistics
     */
    public static function getStats(): array
    {
        $channels = ['api', 'auth', 'chat', 'security', 'performance', 'database'];
        $stats = [
            'total_logs' => 0,
            'error_count' => 0,
            'warning_count' => 0,
            'info_count' => 0,
            'channels' => [],
        ];

        foreach ($channels as $channel) {
            $logPath = storage_path("logs/{$channel}-" . now()->format('Y-m-d') . ".log");
            
            if (!file_exists($logPath)) {
                $logPath = storage_path("logs/{$channel}.log");
                if (!file_exists($logPath)) {
                    continue;
                }
            }

            $totalLines = (int) shell_exec("wc -l < " . escapeshellarg($logPath));
            $errorCount = (int) shell_exec("grep -c 'ERROR' " . escapeshellarg($logPath));
            $warningCount = (int) shell_exec("grep -c 'WARNING' " . escapeshellarg($logPath));
            $infoCount = (int) shell_exec("grep -c 'INFO' " . escapeshellarg($logPath));

            $stats['total_logs'] += $totalLines;
            $stats['error_count'] += $errorCount;
            $stats['warning_count'] += $warningCount;
            $stats['info_count'] += $infoCount;
            $stats['channels'][$channel] = $totalLines;
        }

        return $stats;
    }

    /**
     * Get log health score
     */
    public static function getLogScore(): array
    {
        $stats = self::getStats();
        
        $score = 100;
        $issues = [];
        $recommendations = [];

        // Deduct points for errors
        if ($stats['error_count'] > 0) {
            $errorRate = $stats['error_count'] / max($stats['total_logs'], 1);
            if ($errorRate > 0.1) {
                $score -= 30;
                $issues[] = "High error rate: " . round($errorRate * 100, 2) . "%";
            } elseif ($errorRate > 0.05) {
                $score -= 15;
                $issues[] = "Moderate error rate: " . round($errorRate * 100, 2) . "%";
            }
        }

        // Check for warnings
        if ($stats['warning_count'] > 50) {
            $score -= 10;
            $issues[] = "High number of warnings: {$stats['warning_count']}";
        }

        // Determine health status
        if ($score >= 90) {
            $healthStatus = 'excellent';
        } elseif ($score >= 80) {
            $healthStatus = 'good';
        } elseif ($score >= 60) {
            $healthStatus = 'warning';
        } else {
            $healthStatus = 'critical';
        }

        // Add recommendations
        if ($stats['error_count'] > 0) {
            $recommendations[] = "Review and fix error logs";
        }
        if ($stats['warning_count'] > 20) {
            $recommendations[] = "Address warning messages";
        }
        if (empty($recommendations)) {
            $recommendations[] = "Logs look healthy! Keep up the good work.";
        }

        return [
            'score' => $score,
            'health_status' => $healthStatus,
            'issues' => $issues,
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Clean up old log files
     */
    public static function cleanupLogs(int $days = 30): array
    {
        $logPath = storage_path('logs');
        $files = File::allFiles($logPath);
        $deletedFiles = [];
        $spaceFreed = 0;

        foreach ($files as $file) {
            if (now()->subDays($days)->greaterThan($file->getMTime())) {
                $spaceFreed += $file->getSize();
                File::delete($file->getPathname());
                $deletedFiles[] = $file->getFilename();
            }
        }

        return [
            'deleted_files' => $deletedFiles,
            'space_freed' => self::formatBytes($spaceFreed),
        ];
    }

    /**
     * Format bytes to human readable format
     */
    private static function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
