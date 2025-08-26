<?php

namespace App\Domain\Channel\Repositories;

interface ChannelRepositoryInterface
{
    public function getAllChannels(): array;
    public function getChannelById(int $id): ?array;
    public function getChannelMembers(int $channelId): array;
    public function getLastMessage(int $channelId): ?array;
}
