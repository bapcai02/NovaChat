<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChannelController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no authentication required)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// Protected routes (require authentication)
Route::middleware('auth:api')->group(function () {
    
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
    });
    
    // User routes
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'update']);
        Route::get('/search', [UserController::class, 'search']);
        Route::get('/online', [UserController::class, 'online']);
        Route::put('/status', [UserController::class, 'updateStatus']);
        Route::get('/{id}', [UserController::class, 'show']);
    });

    // Channel routes
    Route::prefix('channels')->group(function () {
        Route::get('/', [ChannelController::class, 'index']);
        Route::post('/', [ChannelController::class, 'store']);
        Route::get('/{id}', [ChannelController::class, 'show']);
        Route::put('/{id}', [ChannelController::class, 'update']);
        Route::delete('/{id}', [ChannelController::class, 'destroy']);
        Route::post('/{id}/join', [ChannelController::class, 'join']);
        Route::post('/{id}/leave', [ChannelController::class, 'leave']);
        Route::post('/{id}/members', [ChannelController::class, 'addMembers']);
        Route::delete('/{id}/members', [ChannelController::class, 'removeMembers']);
    });

    // Message routes
    Route::prefix('channels/{channelId}/messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::post('/', [MessageController::class, 'store']);
        Route::get('/{messageId}', [MessageController::class, 'show']);
        Route::put('/{messageId}', [MessageController::class, 'update']);
        Route::delete('/{messageId}', [MessageController::class, 'destroy']);
        Route::post('/{messageId}/reactions', [MessageController::class, 'addReaction']);
        Route::delete('/{messageId}/reactions', [MessageController::class, 'removeReaction']);
        Route::post('/{messageId}/read', [MessageController::class, 'markAsRead']);
    });
});
