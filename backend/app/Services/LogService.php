<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class LogService
{
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
}
