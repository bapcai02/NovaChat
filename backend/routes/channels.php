<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel rooms (allow any authenticated user for now)
Broadcast::channel('chat.channel.{channelId}', function ($user, $channelId) {
    return !is_null($user);
});

// Direct message rooms (allow any authenticated user for now)
Broadcast::channel('chat.dm.{conversationId}', function ($user, $conversationId) {
    return !is_null($user);
});

// Team presence / status (allow any authenticated user for now)
Broadcast::channel('team.{teamId}', function ($user, $teamId) {
    return !is_null($user);
});

// Backward compatibility: simple private room
Broadcast::channel('chat.{roomId}', function ($user, $roomId) {
    return !is_null($user);
});

// User status channel
Broadcast::channel('user.status.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});






