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
use App\Http\Controllers\UnreadController;

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
    
    // Teams
    Route::prefix('teams')->group(function () {
        Route::get('/', [TeamController::class, 'index']);
        Route::post('/', [TeamController::class, 'store']);
        Route::get('/{teamId}', [TeamController::class, 'show']);
        Route::put('/{teamId}', [TeamController::class, 'update']);
        Route::delete('/{teamId}', [TeamController::class, 'destroy']);
        Route::get('/{teamId}/channels', [ChannelController::class, 'getTeamChannels']);
        Route::post('/{teamId}/channels', [ChannelController::class, 'store']);
        
        // Team members management
        Route::post('/{teamId}/members', [TeamController::class, 'addMember']);
        Route::delete('/{teamId}/members/{userId}', [TeamController::class, 'removeMember']);
        
        // Channel members management
        Route::post('/{teamId}/channels/{channelId}/members', [ChannelController::class, 'addMember']);
        Route::delete('/{teamId}/channels/{channelId}/members/{userId}', [ChannelController::class, 'removeMember']);
    });

    // Channels
    Route::prefix('channels')->group(function () {
        Route::get('/', [ChannelController::class, 'index']);
        Route::post('/', [ChannelController::class, 'store']);
        Route::get('/{channelId}', [ChannelController::class, 'show']);
        Route::put('/{channelId}', [ChannelController::class, 'update']);
        Route::delete('/{channelId}', [ChannelController::class, 'destroy']);
    });

    // Conversations
    Route::prefix('conversations')->group(function () {
        // Basic CRUD
        Route::get('/', [ConversationController::class, 'index']);
        Route::post('/', [ConversationController::class, 'store']);
        
        // Unread messages (must be before {conversationId} routes)
        Route::get('/unread', [UnreadController::class, 'getUnreadCounts']);
        
        // Conversation specific routes
        Route::get('/{conversationId}', [ConversationController::class, 'show']);
        Route::get('/{conversationId}/messages', [ConversationController::class, 'getMessages']);
        Route::post('/{conversationId}/messages', [MessageController::class, 'store']);

        // Mentions (for current user)
        Route::get('/mentions/list', [ConversationController::class, 'getMentions']);
        Route::get('/mentions/count', [ConversationController::class, 'getMentionsCount']);
        
        // Members management
        Route::get('/{conversationId}/members', [ConversationController::class, 'getMembers']);
        Route::post('/{conversationId}/members', [ConversationController::class, 'addMember']);
        Route::delete('/{conversationId}/members/{userId}', [ConversationController::class, 'removeMember']);
        
        // Read status
        Route::post('/{conversationId}/read', [UnreadController::class, 'markConversationAsRead']);
        Route::get('/{conversationId}/unread', [UnreadController::class, 'getConversationUnreadCount']);
        
        // Pin/Unpin conversation
        Route::post('/{conversationId}/pin', [ConversationController::class, 'pinConversation']);
        Route::post('/{conversationId}/unpin', [ConversationController::class, 'unpinConversation']);

        // Mute/Unmute conversation
        Route::post('/{conversationId}/mute', [ConversationController::class, 'muteConversation']);
        Route::post('/{conversationId}/unmute', [ConversationController::class, 'unmuteConversation']);
    });

    // Messages
    Route::middleware('throttle:messages')->prefix('messages')->group(function () {
        Route::post('/', [MessageController::class, 'store']);
        Route::get('/{roomId}', [MessageController::class, 'index']);
        Route::put('/{messageId}', [MessageController::class, 'edit']);
        Route::delete('/{messageId}', [MessageController::class, 'destroy']);
        Route::get('/{messageId}/readers', [MessageController::class, 'readers']);
        Route::get('/{messageId}/versions', [MessageController::class, 'versions']);
        Route::post('/{messageId}/versions/{versionId}/restore', [MessageController::class, 'restoreVersion']);
        
        // Message reactions
        Route::post('/{messageId}/reactions', [MessageController::class, 'addReaction']);
        Route::delete('/{messageId}/reactions', [MessageController::class, 'removeReaction']);
        Route::delete('/{messageId}/reactions/{emoji}', [MessageController::class, 'removeReaction']);
        
        // Message bookmarks
        Route::post('/{messageId}/bookmark', [MessageController::class, 'bookmark']);
        Route::delete('/{messageId}/bookmark', [MessageController::class, 'removeBookmark']);
        Route::get('/{messageId}/bookmark', [MessageController::class, 'isBookmarked']);
        
        // Thread replies
        Route::get('/{messageId}/replies', [\App\Http\Controllers\ThreadController::class, 'index']);
        Route::post('/{messageId}/replies', [\App\Http\Controllers\ThreadController::class, 'store']);
        Route::get('/{messageId}/thread', [\App\Http\Controllers\ThreadController::class, 'index']);
        Route::post('/{messageId}/thread', [\App\Http\Controllers\ThreadController::class, 'store']);
    });

    // Bookmarks
    Route::get('bookmarks', [MessageController::class, 'getBookmarks']);

    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/search', [UserController::class, 'search']);
        Route::post('/status', [UserStatusController::class, 'getUsersStatus']);
        Route::get('/me/status', [UserStatusController::class, 'getCurrentUserStatus']);
        Route::get('/{userId}/status', [UserStatusController::class, 'getUserStatus']);
    });

    // Admin routes (protected + throttled)
    Route::middleware(['auth:api','throttle:admin'])->prefix('admin')->group(function () {
        // User management
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'getUsers']);
        Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'getStats']);
        Route::get('/reports', [\App\Http\Controllers\ReportsController::class, 'getReports']);
        Route::get('/users/{id}', [\App\Http\Controllers\AdminController::class, 'getUser']);
        Route::put('/users/{id}', [\App\Http\Controllers\AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [\App\Http\Controllers\AdminController::class, 'deleteUser']);
        Route::post('/users', [\App\Http\Controllers\AdminController::class, 'createUser']);
        Route::post('/users/{id}/ban', [\App\Http\Controllers\AdminController::class, 'toggleUserBan']);
        
        // Message management
        Route::get('/messages', [\App\Http\Controllers\AdminController::class, 'getMessages']);
        Route::delete('/messages/{id}', [\App\Http\Controllers\AdminController::class, 'deleteMessage']);
        
        // Bookmark management
        Route::get('/bookmarks', [\App\Http\Controllers\AdminController::class, 'getBookmarks']);
        Route::delete('/bookmarks/{id}', [\App\Http\Controllers\AdminController::class, 'deleteBookmark']);
        
        // System logs
        Route::get('/logs', [\App\Http\Controllers\AdminController::class, 'getLogs']);
    });

    // User settings (protected)
    Route::middleware('auth:api')->group(function () {
        Route::get('/user/profile', [\App\Http\Controllers\UserSettingsController::class, 'getProfile']);
        Route::put('/user/profile', [\App\Http\Controllers\UserSettingsController::class, 'updateProfile']);
        Route::post('/user/change-password', [\App\Http\Controllers\UserSettingsController::class, 'changePassword']);
        Route::put('/user/preferences', [\App\Http\Controllers\UserSettingsController::class, 'updatePreferences']);
        Route::get('/user/sessions', [\App\Http\Controllers\UserSettingsController::class, 'sessions']);
        Route::delete('/user/sessions/{id}', [\App\Http\Controllers\UserSettingsController::class, 'destroySession']);
    });

    // User status and typing
    Route::prefix('user')->group(function () {
        Route::post('/status', [UserStatusController::class, 'updateStatus']);
        Route::post('/typing/start', [UserStatusController::class, 'startTyping']);
        Route::post('/typing/stop', [UserStatusController::class, 'stopTyping']);
    });

    // Search
    Route::prefix('search')->group(function () {
        Route::get('/', [SearchController::class, 'search']);
        Route::get('/messages', [SearchController::class, 'searchMessages']);
        Route::get('/channels', [SearchController::class, 'searchChannels']);
        Route::get('/users', [SearchController::class, 'searchUsers']);
        Route::get('/conversations', [SearchController::class, 'searchConversations']);
        Route::get('/files', [SearchController::class, 'searchFiles']);
    });

    // User status routes
    Route::prefix('users')->group(function () {
        Route::get('/status', [App\Http\Controllers\UserStatusController::class, 'getUsersStatus']);
        Route::get('/me/status', [App\Http\Controllers\UserStatusController::class, 'getCurrentUserStatus']);
        Route::get('/{userId}/status', [App\Http\Controllers\UserStatusController::class, 'getUserStatus']);
        Route::get('/online', [App\Http\Controllers\UserStatusController::class, 'getOnlineUsers']);
    });

});

