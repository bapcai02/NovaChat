<?php

declare(strict_types=1);

namespace App\WebSocket;

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;
use SplObjectStorage;

class ChatServer implements MessageComponentInterface
{
    /** @var SplObjectStorage<ConnectionInterface, array<string,bool>> */
    private SplObjectStorage $connectionToChannels;

    /** @var array<string, SplObjectStorage<ConnectionInterface, bool>> */
    private array $channelToConnections;

    public function __construct()
    {
        $this->connectionToChannels = new SplObjectStorage();
        $this->channelToConnections = [];
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        $this->connectionToChannels[$conn] = [];
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {
        $payload = json_decode((string) $msg, true);
        if (!is_array($payload) || !isset($payload['action'])) {
            return;
        }

        switch ($payload['action']) {
            case 'subscribe':
                $channel = (string)($payload['channel'] ?? '');
                if ($channel === '') {
                    return;
                }
                $this->subscribe($from, $channel);
                $from->send(json_encode(['type' => 'subscribed', 'channel' => $channel], JSON_UNESCAPED_UNICODE));
                break;
            case 'unsubscribe':
                $channel = (string)($payload['channel'] ?? '');
                if ($channel === '') {
                    return;
                }
                $this->unsubscribe($from, $channel);
                $from->send(json_encode(['type' => 'unsubscribed', 'channel' => $channel], JSON_UNESCAPED_UNICODE));
                break;
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
        if (!isset($this->connectionToChannels[$conn])) {
            return;
        }
        $channels = array_keys($this->connectionToChannels[$conn]);
        foreach ($channels as $channel) {
            $this->unsubscribe($conn, $channel);
        }
        $this->connectionToChannels->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        $conn->close();
    }

    public function publish(string $channel, array $data): void
    {
        $frame = json_encode(['type' => 'message', 'channel' => $channel, 'data' => $data], JSON_UNESCAPED_UNICODE);
        $connections = $this->channelToConnections[$channel] ?? null;
        if (!$connections instanceof SplObjectStorage) {
            return;
        }
        foreach ($connections as $conn) {
            $conn->send($frame);
        }
    }

    private function subscribe(ConnectionInterface $conn, string $channel): void
    {
        $channels = $this->connectionToChannels[$conn] ?? [];
        $channels[$channel] = true;
        $this->connectionToChannels[$conn] = $channels;

        if (!isset($this->channelToConnections[$channel])) {
            $this->channelToConnections[$channel] = new SplObjectStorage();
        }
        $this->channelToConnections[$channel]->attach($conn, true);
    }

    private function unsubscribe(ConnectionInterface $conn, string $channel): void
    {
        if (isset($this->connectionToChannels[$conn][$channel])) {
            $channels = $this->connectionToChannels[$conn];
            unset($channels[$channel]);
            $this->connectionToChannels[$conn] = $channels;
        }

        if (isset($this->channelToConnections[$channel])) {
            $this->channelToConnections[$channel]->detach($conn);
            if (count($this->channelToConnections[$channel]) === 0) {
                unset($this->channelToConnections[$channel]);
            }
        }
    }
}


