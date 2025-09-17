<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Carbon\Carbon;

class UserPresenceService
{
    private const STREAM_NAME = 'user_presence';
    private const CONSUMER_GROUP = 'user_presence_consumers';
    private const CONSUMER_NAME = 'laravel_worker';

    public function __construct()
    {
        $this->ensureConsumerGroupExists();
    }

    /**
     * Ensure consumer group exists
     */
    private function ensureConsumerGroupExists(): void
    {
        try {
            Redis::xgroup('CREATE', self::STREAM_NAME, self::CONSUMER_GROUP, '0', 'MKSTREAM');
        } catch (\Exception $e) {
            // Consumer group already exists, ignore error
            if (!str_contains($e->getMessage(), 'BUSYGROUP')) {
                Log::error('Error creating consumer group: ' . $e->getMessage());
            }
        }
    }

    /**
     * Consume events from Redis Stream
     */
    public function consumeEvents(int $count = 10, int $block = 1000): array
    {
        try {
            $events = Redis::xreadgroup(
                self::CONSUMER_GROUP,
                self::CONSUMER_NAME,
                [self::STREAM_NAME => '>'],
                $count,
                $block
            );

            if (empty($events)) {
                return [];
            }

            $processedEvents = [];
            foreach ($events[self::STREAM_NAME] as $streamId => $eventData) {
                $processedEvents[] = $this->processEvent($streamId, $eventData);
            }

            return $processedEvents;
        } catch (\Exception $e) {
            Log::error('Error consuming events from Redis Stream: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Process individual event
     */
    private function processEvent(string $streamId, array $eventData): array
    {
        try {
            $event = $eventData['event'] ?? null;
            $userId = (int) ($eventData['user_id'] ?? 0);
            $timestamp = $eventData['timestamp'] ?? now()->toISOString();

            if (!$event || !$userId) {
                Log::warning('Invalid event data', ['streamId' => $streamId, 'eventData' => $eventData]);
                return ['streamId' => $streamId, 'status' => 'skipped', 'reason' => 'invalid_data'];
            }

            switch ($event) {
                case 'user_connected':
                    $this->handleUserConnected($userId, $timestamp);
                    break;
                case 'user_disconnected':
                    $this->handleUserDisconnected($userId, $timestamp);
                    break;
                default:
                    Log::warning('Unknown event type', ['event' => $event, 'userId' => $userId]);
                    return ['streamId' => $streamId, 'status' => 'skipped', 'reason' => 'unknown_event'];
            }

            // Acknowledge the event
            Redis::xack(self::STREAM_NAME, self::CONSUMER_GROUP, $streamId);

            return [
                'streamId' => $streamId,
                'status' => 'processed',
                'event' => $event,
                'userId' => $userId
            ];
        } catch (\Exception $e) {
            Log::error('Error processing event', [
                'streamId' => $streamId,
                'eventData' => $eventData,
                'error' => $e->getMessage()
            ]);
            return ['streamId' => $streamId, 'status' => 'error', 'error' => $e->getMessage()];
        }
    }

    /**
     * Handle user connected event
     */
    private function handleUserConnected(int $userId, string $timestamp): void
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                Log::warning('User not found for connected event', ['userId' => $userId]);
                return;
            }

            // Update user status
            $user->update([
                'is_online' => true,
                'last_seen_at' => Carbon::parse($timestamp)
            ]);

            Log::info('User connected', [
                'userId' => $userId,
                'userName' => $user->name,
                'timestamp' => $timestamp
            ]);
        } catch (\Exception $e) {
            Log::error('Error handling user connected', [
                'userId' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle user disconnected event
     */
    private function handleUserDisconnected(int $userId, string $timestamp): void
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                Log::warning('User not found for disconnected event', ['userId' => $userId]);
                return;
            }

            // Update user status
            $user->update([
                'is_online' => false,
                'last_seen_at' => Carbon::parse($timestamp)
            ]);

            Log::info('User disconnected', [
                'userId' => $userId,
                'userName' => $user->name,
                'timestamp' => $timestamp
            ]);
        } catch (\Exception $e) {
            Log::error('Error handling user disconnected', [
                'userId' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get user status
     */
    public function getUserStatus(int $userId): ?array
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                return null;
            }

            return [
                'user_id' => $user->id,
                'is_online' => (bool) $user->is_online,
                'last_seen_at' => $user->last_seen_at
            ];
        } catch (\Exception $e) {
            Log::error('Error getting user status', [
                'userId' => $userId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get multiple users status
     */
    public function getUsersStatus(array $userIds): array
    {
        try {
            $users = User::whereIn('id', $userIds)->get();
            
            return $users->map(function ($user) {
                return [
                    'user_id' => $user->id,
                    'is_online' => (bool) $user->is_online,
                    'last_seen_at' => $user->last_seen_at
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Error getting users status', [
                'userIds' => $userIds,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}
