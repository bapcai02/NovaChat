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
    Route::get('channels/{channelId}', [ChannelController::class, 'show']);
    Route::put('channels/{channelId}', [ChannelController::class, 'update']);
    Route::delete('channels/{channelId}', [ChannelController::class, 'destroy']);

    // Teams
    Route::get('teams', [TeamController::class, 'index']);
    Route::post('teams', [TeamController::class, 'store']);
    Route::get('teams/{teamId}', [TeamController::class, 'show']);
    Route::put('teams/{teamId}', [TeamController::class, 'update']);
    Route::delete('teams/{teamId}', [TeamController::class, 'destroy']);
    Route::get('teams/{teamId}/channels', [ChannelController::class, 'getTeamChannels']);
    Route::post('teams/{teamId}/channels', [ChannelController::class, 'store']);

    // Conversations
    Route::get('conversations', [ConversationController::class, 'index']);
    Route::post('conversations', [ConversationController::class, 'store']);
    Route::get('conversations/{conversationId}', [ConversationController::class, 'show']);
    Route::get('conversations/{conversationId}/messages', [ConversationController::class, 'getMessages']);
    Route::post('conversations/{conversationId}/messages', [MessageController::class, 'store']);
    Route::post('conversations/{conversationId}/members', [ConversationController::class, 'addMember']);
    Route::delete('conversations/{conversationId}/members/{userId}', [ConversationController::class, 'removeMember']);

    // Users & legacy list endpoints will be re-added with new controllers
    Route::get('users', [UserController::class, 'index']);

    // Thread replies
    Route::get('messages/{messageId}/replies', [\App\Http\Controllers\ThreadController::class, 'index']);
    Route::post('messages/{messageId}/replies', [\App\Http\Controllers\ThreadController::class, 'store']);
    Route::get('messages/{messageId}/thread', [\App\Http\Controllers\ThreadController::class, 'index']);
    Route::post('messages/{messageId}/thread', [\App\Http\Controllers\ThreadController::class, 'store']);

    // Search
    Route::get('search', [SearchController::class, 'search']);
    Route::get('search/messages', [SearchController::class, 'searchMessages']);
    Route::get('search/channels', [SearchController::class, 'searchChannels']);
    Route::get('search/users', [SearchController::class, 'searchUsers']);
    Route::get('search/conversations', [SearchController::class, 'searchConversations']);
    Route::get('search/files', [SearchController::class, 'searchFiles']);

    // Realtime chat message - with rate limiting
    Route::middleware('throttle:messages')->group(function () {
        Route::post('messages', [MessageController::class, 'store']);
        Route::get('messages/{roomId}', [MessageController::class, 'index']);
        
        // Message reactions
        Route::post('messages/{messageId}/reactions', [MessageController::class, 'addReaction']);
        Route::delete('messages/{messageId}/reactions', [MessageController::class, 'removeReaction']);
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

// WebSocket whisper handling
Route::post('/websocket/whisper', function (\Illuminate\Http\Request $request) {
    try {
        \Log::info('=== WebSocket whisper API route called ===');
        \Log::info('Request headers:', $request->headers->all());
        \Log::info('Request data:', $request->all());
        
        $data = $request->all();
        
        // Validate required fields
        if (!isset($data['conversation_id']) || !isset($data['content']) || !isset($data['sender_id'])) {
            \Log::warning('Missing required fields in WebSocket whisper request:', $data);
            return response()->json(['error' => 'Missing required fields'], 400);
        }
        
        \Log::info('Firing WebSocket whisper event with data:', $data);
        
        // Fire WebSocket whisper event
        event(new \App\Events\WebSocketWhisperEvent($data));
        
        \Log::info('WebSocket whisper event fired successfully');
        
        return response()->json(['success' => true]);
        
    } catch (\Exception $e) {
        \Log::error('WebSocket whisper error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'data' => $request->all()
        ]);
        
        return response()->json(['error' => 'Internal server error'], 500);
    }
})->middleware('auth:api');

// Test route without authentication
Route::post('/test/websocket/whisper', function (\Illuminate\Http\Request $request) {
    try {
        \Log::info('=== Test WebSocket whisper API route called ===');
        \Log::info('Request headers:', $request->headers->all());
        \Log::info('Request data:', $request->all());
        
        $data = $request->all();
        
        // Validate required fields
        if (!isset($data['conversation_id']) || !isset($data['content']) || !isset($data['sender_id'])) {
            \Log::warning('Missing required fields in test WebSocket whisper request:', $data);
            return response()->json(['error' => 'Missing required fields'], 400);
        }
        
        \Log::info('Firing test WebSocket whisper event with data:', $data);
        
        // Fire WebSocket whisper event
        event(new \App\Events\WebSocketWhisperEvent($data));
        
        \Log::info('Test WebSocket whisper event fired successfully');
        
        return response()->json(['success' => true, 'message' => 'Test WebSocket whisper event fired']);
        
    } catch (\Exception $e) {
        \Log::error('Test WebSocket whisper error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'data' => $request->all()
        ]);
        
        return response()->json(['error' => 'Internal server error', 'message' => $e->getMessage()], 500);
    }
});

// WebSocket client message handling (no auth required)
Route::post('/websocket/client-message', function (\Illuminate\Http\Request $request) {
    try {
        \Log::info('=== WebSocket client message API route called ===');
        \Log::info('Request headers:', $request->headers->all());
        \Log::info('Request data:', $request->all());
        
        $data = $request->all();
        
        // Validate required fields
        if (!isset($data['conversation_id']) || !isset($data['content']) || !isset($data['sender_id'])) {
            \Log::warning('Missing required fields in WebSocket client message request:', $data);
            return response()->json(['error' => 'Missing required fields'], 400);
        }
        
        \Log::info('Firing WebSocket client message event with data:', $data);
        
        // Fire WebSocket client message event
        event(new \App\Events\WebSocketClientMessageEvent($data));
        
        \Log::info('WebSocket client message event fired successfully');
        
        return response()->json(['success' => true]);
        
    } catch (\Exception $e) {
        \Log::error('WebSocket client message error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'data' => $request->all()
        ]);
        
        return response()->json(['error' => 'Internal server error'], 500);
    }
});

// WebSocket server message handling (no auth required)
Route::post('/websocket/server-message', function (\Illuminate\Http\Request $request) {
    try {
        \Log::info('=== WebSocket server message API route called ===');
        \Log::info('Request headers:', $request->headers->all());
        \Log::info('Request data:', $request->all());
        
        $data = $request->all();
        
        \Log::info('Firing WebSocket server message event with data:', $data);
        
        // Fire WebSocket server message event
        event(new \App\Events\WebSocketServerMessageEvent($data));
        
        \Log::info('WebSocket server message event fired successfully');
        
        return response()->json(['success' => true]);
        
    } catch (\Exception $e) {
        \Log::error('WebSocket server message error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'data' => $request->all()
        ]);
        
        return response()->json(['error' => 'Internal server error'], 500);
    }
});

// Test WebSocket client message
Route::post('/test/websocket-client', function (\Illuminate\Http\Request $request) {
    try {
        \Log::info('=== Test WebSocket client message ===');
        
        $data = [
            'event' => 'client-send-message',
            'data' => [
                'conversation_id' => 1,
                'content' => 'Test message from API',
                'type' => 'text',
                'sender_id' => 1
            ],
            'channel' => 'private-chat.dm.1'
        ];
        
        \Log::info('Sending test message to WebSocket:', $data);
        
        // Fire the event
        event(new \App\Events\WebSocketServerMessageEvent($data));
        
        return response()->json(['success' => true, 'message' => 'Test message sent']);
        
    } catch (\Exception $e) {
        \Log::error('Test WebSocket client error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json(['error' => 'Internal server error'], 500);
    }
});

// Test routes removed to prevent rate limiting issues

// Broadcasting authentication for WebSocket
Route::post('/broadcasting/auth', function (Request $request) {
    // Simple auth for WebSocket - just return success for now
    return response()->json(['status' => 'success']);
});

// Handle WebSocket client messages
Route::post('/websocket/client-message', function (Request $request) {
    try {
        Log::info('=== Received WebSocket client message via API ===');
        Log::info('Request data:', $request->all());
        
        $conversationId = $request->input('conversation_id');
        $content = $request->input('content');
        $type = $request->input('type', 'text');
        $senderId = $request->input('sender_id');
        
        if (!$conversationId || !$content || !$senderId) {
            return response()->json(['error' => 'Missing required fields'], 400);
        }
        
        $messageService = app(\App\Services\MessageService::class);
        
        $messageData = [
            'user_id' => $senderId,
            'conversation_id' => $conversationId,
            'content' => $content,
            'type' => $type,
            'metadata' => []
        ];
        
        $result = $messageService->storeMessage($messageData);
        
        if ($result['success']) {
            Log::info('Message created successfully via API:', $result['data']);
            
            // Broadcast the message
            broadcast(new \App\Events\MessageSent($result['data']))->toOthers();
            Log::info('Message broadcasted to other clients via API');
            
            return response()->json(['success' => true, 'data' => $result['data']]);
        } else {
            Log::error('Failed to create message via API:', $result);
            return response()->json(['error' => 'Failed to create message'], 500);
        }
    } catch (\Exception $e) {
        Log::error('Error processing WebSocket client message via API:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'Internal server error'], 500);
    }
});
