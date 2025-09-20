<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\WebSocket\ChatServer;
use App\WebSocket\RedisBridge;
use Illuminate\Console\Command;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;

class WebSocketServe extends Command
{
    protected $signature = 'websocket:serve {--port=7001}';

    protected $description = 'Start the Ratchet WebSocket server';

    public function handle(): int
    {
        $port = (int) $this->option('port');

        $chat = new ChatServer;
        // Boot Redis bridge for pub/sub
        $redisUrl = config('database.redis.default.url') ?? sprintf('redis://%s:%s', config('database.redis.default.host', '127.0.0.1'), config('database.redis.default.port', 6379));
        $pattern = config('broadcasting.connections.redis.channel_pattern', 'ws:*');

        // Start Ratchet server
        $server = IoServer::factory(new HttpServer(new WsServer($chat)), $port);

        // Start Redis bridge (non-blocking)
        (new RedisBridge($chat))->start((string) $redisUrl, (string) $pattern);

        $this->info("WebSocket server listening on :{$port}");
        $server->run();

        return self::SUCCESS;
    }
}
