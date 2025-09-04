<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserStatusController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;

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

// Public routes (no authentication required) - with rate limiting
Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

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
    Route::get('channels', [ChannelController::class, 'index']);
    Route::post('channels', [ChannelController::class, 'store']);

    // Teams
    Route::get('teams', [TeamController::class, 'index']);
    Route::post('teams', [TeamController::class, 'store']);

    // Conversations
    Route::get('conversations', [ConversationController::class, 'index']);
    Route::post('conversations', [ConversationController::class, 'store']);
    Route::get('conversations/{conversationId}', [ConversationController::class, 'show']);
    Route::get('conversations/{conversationId}/messages', [ConversationController::class, 'getMessages']);
    Route::post('conversations/{conversationId}/members', [ConversationController::class, 'addMember']);
    Route::delete('conversations/{conversationId}/members/{userId}', [ConversationController::class, 'removeMember']);

    // Users & legacy list endpoints will be re-added with new controllers
    Route::get('users', [UserController::class, 'index']);

    // Thread replies
    Route::get('messages/{messageId}/replies', [\App\Http\Controllers\ThreadController::class, 'index']);
    Route::post('messages/{messageId}/replies', [\App\Http\Controllers\ThreadController::class, 'store']);

    // Search
    Route::get('search', [SearchController::class, 'search']);
    Route::get('search/messages', [SearchController::class, 'searchMessages']);
    Route::get('search/channels', [SearchController::class, 'searchChannels']);
    Route::get('search/users', [SearchController::class, 'searchUsers']);
    Route::get('search/files', [SearchController::class, 'searchFiles']);

    // Realtime chat message - with rate limiting
    Route::middleware('throttle:messages')->group(function () {
        Route::post('messages', [MessageController::class, 'store']);
        Route::get('messages/{roomId}', [MessageController::class, 'index']);
        
        // Message reactions
        Route::post('messages/{messageId}/reactions', [MessageController::class, 'addReaction']);
        Route::delete('messages/{messageId}/reactions/{emoji}', [MessageController::class, 'removeReaction']);
        
        // Message editing
        Route::put('messages/{messageId}', [MessageController::class, 'edit']);
        
        // Message bookmarks
        Route::post('messages/{messageId}/bookmark', [MessageController::class, 'bookmark']);
        Route::delete('messages/{messageId}/bookmark', [MessageController::class, 'removeBookmark']);
        Route::get('messages/{messageId}/bookmark', [MessageController::class, 'isBookmarked']);
        Route::get('bookmarks', [MessageController::class, 'getBookmarks']);
    });

    // User status and typing
    Route::post('user/status', [UserStatusController::class, 'updateStatus']);
    Route::post('user/typing/start', [UserStatusController::class, 'startTyping']);
    Route::post('user/typing/stop', [UserStatusController::class, 'stopTyping']);
    Route::get('user/online', [UserStatusController::class, 'getOnlineUsers']);

});

// Test routes removed to prevent rate limiting issues
