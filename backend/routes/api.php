<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Interfaces\Http\Controllers\AuthController;
use App\Interfaces\Http\Controllers\ChannelController as InterfaceChannelController;
use App\Interfaces\Http\Controllers\ConversationController;
use App\Interfaces\Http\Controllers\UserController as InterfaceUserController;
use App\Interfaces\Http\Controllers\ChannelMessageController;
use App\Interfaces\Http\Controllers\ConversationMessageController;

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
    
    // Channels (fake list)
    Route::get('channels', [InterfaceChannelController::class, 'index']);

    // Conversations (fake list)
    Route::get('conversations', [ConversationController::class, 'index']);

    // Users (fake list)
    Route::get('users', [InterfaceUserController::class, 'index']);

    // Messages (fake lists)
    Route::get('channels/{channelId}/messages', [ChannelMessageController::class, 'index']);
    Route::get('conversations/{conversationId}/messages', [ConversationMessageController::class, 'index']);

});
