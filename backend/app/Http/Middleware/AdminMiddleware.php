<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!in_array(auth()->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Forbidden - Admin access required'], 403);
        }

        return $next($request);
    }
}
