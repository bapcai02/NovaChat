<?php

namespace App\Repositories\Contracts;

interface MessageRepositoryInterface
{
    public function findById(int $id): ?array;
    public function getForRoom(string $roomId, string $type = 'channel', int $limit = 50, ?int $beforeId = null, ?int $userId = null): array;
    public function create(array $data): object;
    public function addReaction(int $messageId, int $userId, string $emoji): array;
    public function removeReaction(int $messageId, int $userId, string $emoji): bool;
    public function isBookmarked(int $messageId, int $userId): bool;
    public function createBookmark(int $messageId, int $userId, ?string $note = null): array;
    public function removeBookmark(int $messageId, int $userId): bool;
    public function getUserBookmarks(int $userId): array;
    public function edit(int $messageId, string $content): array;
}


