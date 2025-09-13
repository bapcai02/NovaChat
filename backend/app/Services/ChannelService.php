<?php

namespace App\Services;

use App\Repositories\Contracts\ChannelRepositoryInterface;

class ChannelService
{
    private ChannelRepositoryInterface $channels;

    public function __construct(ChannelRepositoryInterface $channels)
    {
        $this->channels = $channels;
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

    public function updateChannel(int $id, array $data): array
    {
        return $this->channels->update($id, $data);
    }

    public function deleteChannel(int $id): bool
    {
        return $this->channels->delete($id);
    }

    public function getChannelsByTeam(int $teamId): array
    {
        return $this->channels->getByTeam($teamId);
    }

    public function addMember(int $teamId, int $channelId, int $userId, int $addedBy): array
    {
        try {
            $result = $this->channels->addMember($teamId, $channelId, $userId);
            if ($result) {
                return ['success' => true, 'message' => 'Member added successfully'];
            }
            return ['success' => false, 'message' => 'Failed to add member'];
        } catch (\Exception $e) {
            \Log::error('Failed to add member to channel', [
                'team_id' => $teamId,
                'channel_id' => $channelId,
                'user_id' => $userId,
                'added_by' => $addedBy,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'message' => 'Failed to add member: ' . $e->getMessage()];
        }
    }

    public function removeMember(int $teamId, int $channelId, int $userId, int $removedBy): array
    {
        try {
            $result = $this->channels->removeMember($teamId, $channelId, $userId);
            if ($result) {
                return ['success' => true, 'message' => 'Member removed successfully'];
            }
            return ['success' => false, 'message' => 'Failed to remove member'];
        } catch (\Exception $e) {
            \Log::error('Failed to remove member from channel', [
                'team_id' => $teamId,
                'channel_id' => $channelId,
                'user_id' => $userId,
                'removed_by' => $removedBy,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'message' => 'Failed to remove member: ' . $e->getMessage()];
        }
    }
}


