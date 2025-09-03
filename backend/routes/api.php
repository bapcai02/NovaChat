<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Interfaces\Http\Controllers\AuthController;
use App\Interfaces\Http\Controllers\ChannelController as InterfaceChannelController;
use App\Interfaces\Http\Controllers\ConversationController;
use App\Interfaces\Http\Controllers\UserController as InterfaceUserController;
use App\Interfaces\Http\Controllers\ChannelMessageController;
use App\Interfaces\Http\Controllers\ConversationMessageController;
use App\Interfaces\Http\Controllers\ThreadController;
use App\Interfaces\Http\Controllers\SearchController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserStatusController;
use App\Http\Controllers\TeamController;

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
    
    // Channels
    Route::get('channels', [InterfaceChannelController::class, 'index']);
    Route::post('channels', [InterfaceChannelController::class, 'store']);

    // Teams
    Route::get('teams', [TeamController::class, 'index']);
    Route::post('teams', [TeamController::class, 'store']);

    // Conversations (fake list)
    Route::get('conversations', [ConversationController::class, 'index']);

    // Users (fake list)
    Route::get('users', [InterfaceUserController::class, 'index']);

    // Messages (fake lists)
    Route::get('channels/{channelId}/messages', [ChannelMessageController::class, 'index']);
    Route::get('conversations/{conversationId}/messages', [ConversationMessageController::class, 'index']);

    // Thread replies
    Route::get('messages/{messageId}/replies', [ThreadController::class, 'index']);
    Route::post('messages/{messageId}/replies', [ThreadController::class, 'store']);

    // Search
    Route::get('search', [SearchController::class, 'search']);
    Route::get('search/messages', [SearchController::class, 'searchMessages']);
    Route::get('search/channels', [SearchController::class, 'searchChannels']);
    Route::get('search/users', [SearchController::class, 'searchUsers']);
    Route::get('search/files', [SearchController::class, 'searchFiles']);

    // Realtime chat message
    Route::post('messages', [MessageController::class, 'store']);
    Route::get('messages/{roomId}', [MessageController::class, 'index']);
    
    // Message reactions
    Route::post('messages/{messageId}/reactions', [MessageController::class, 'addReaction']);
    Route::delete('messages/{messageId}/reactions/{emoji}', [MessageController::class, 'removeReaction']);

    // User status and typing
    Route::post('user/status', [UserStatusController::class, 'updateStatus']);
    Route::post('user/typing/start', [UserStatusController::class, 'startTyping']);
    Route::post('user/typing/stop', [UserStatusController::class, 'stopTyping']);
    Route::get('user/online', [UserStatusController::class, 'getOnlineUsers']);

});

// Test route for messages (temporary)
Route::get('/test/messages/{roomId}', [MessageController::class, 'index']);
Route::post('/test/messages', [MessageController::class, 'store']);
