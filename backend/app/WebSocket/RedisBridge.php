<?php

declare(strict_types=1);

namespace App\WebSocket;

use Clue\React\Redis\Factory as RedisFactory;
use React\EventLoop\Loop;

class RedisBridge
{
    public function __construct(private ChatServer $server)
    {
    }

    public function start(string $redisUrl = 'redis://127.0.0.1:6379', string $pattern = 'ws:*'): void
    {
        $factory = new RedisFactory(Loop::get());
        $client = $factory->createLazyClient($redisUrl);

        // Subscribe to pattern ws:* and forward messages
        $client->psubscribe($pattern);
        $client->on('pmessage', function ($pattern, $channel, $payload) {
            $data = json_decode((string) $payload, true);
            $targetChannel = $data['channel'] ?? $channel;
            $message = $data['data'] ?? $data;
            $this->server->publish((string) $targetChannel, (array) $message);
        });
    }
}


