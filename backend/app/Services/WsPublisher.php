<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Redis;

class WsPublisher
{
    public function publish(string $channel, array $data): void
    {
        // Publish to Redis channel using a unified payload
        $payload = json_encode(['channel' => $channel, 'data' => $data], JSON_UNESCAPED_UNICODE);
        Redis::publish('ws:messages', $payload);
    }
}


