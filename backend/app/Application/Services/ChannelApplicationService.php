<?php

namespace App\Application\Services;

use App\Domain\Channel\Repositories\ChannelRepositoryInterface;

class ChannelApplicationService
{
    private ChannelRepositoryInterface $channelRepository;

    public function __construct(ChannelRepositoryInterface $channelRepository)
    {
        $this->channelRepository = $channelRepository;
    }

    public function getAllChannels(): array
    {
        return $this->channelRepository->getAllChannels();
    }

    public function getChannelById(int $id): ?array
    {
        return $this->channelRepository->getChannelById($id);
    }
}
