<?php

namespace App\Services;

use App\Repositories\Contracts\ChannelRepositoryInterface;

class ChannelService
{
    public function __construct(private ChannelRepositoryInterface $channels)
    {
    }

    public function getAllChannels(): array
    {
        return $this->channels->getAll();
    }

    public function getChannelById(int $id): ?array
    {
        return $this->channels->getById($id);
    }

    public function createChannel(array $data, int $createdBy): array
    {
        return $this->channels->create($data, $createdBy);
    }
}


