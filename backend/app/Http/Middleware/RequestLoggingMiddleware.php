<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\LogService;
use Illuminate\Support\Facades\Log;

class RequestLoggingMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        
        // Log request
        LogService::api(
            $request->method(),
            $request->path(),
            0, // Will be updated after response
            0, // Will be updated after response
            [
                'request_id' => $request->header('X-Request-ID', uniqid()),
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
                'query_params' => $request->query(),
                'request_size' => strlen($request->getContent()),
            ]
        );

        $response = $next($request);

        // Calculate response time
        $responseTime = microtime(true) - $startTime;

        // Log response
        LogService::api(
            $request->method(),
            $request->path(),
            $response->getStatusCode(),
            $responseTime,
            [
                'request_id' => $request->header('X-Request-ID', uniqid()),
                'response_size' => strlen($response->getContent()),
                'memory_usage' => memory_get_usage(true),
            ]
        );

        return $response;
    }
}
