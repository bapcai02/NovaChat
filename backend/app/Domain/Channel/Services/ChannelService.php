<?php

namespace App\Domain\Channel\Services;

use App\Domain\Channel\Entities\Channel;
use App\Domain\Channel\Entities\ChannelMember;
use App\Domain\Channel\Repositories\ChannelRepository;
use App\Domain\User\Repositories\UserRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChannelService
{
    protected ChannelRepository $channelRepository;
    protected UserRepository $userRepository;

    public function __construct(ChannelRepository $channelRepository, UserRepository $userRepository)
    {
        $this->channelRepository = $channelRepository;
        $this->userRepository = $userRepository;
    }

    /**
     * Get all channels for a user
     */
    public function getChannelsForUser(int $userId): Collection
    {
        return $this->channelRepository->getChannelsForUser($userId);
    }

    /**
     * Create a new channel
     */
    public function createChannel(int $creatorId, array $channelData): ?Channel
    {
        try {
            DB::beginTransaction();

            // Create the channel
            $channel = $this->channelRepository->create([
                'name' => $channelData['name'],
                'description' => $channelData['description'] ?? null,
                'type' => $channelData['type'],
                'topic' => $channelData['topic'] ?? null,
                'created_by' => $creatorId,
                'permissions' => json_encode($channelData['permissions'] ?? [
                    'read' => true,
                    'write' => true,
                    'admin' => false
                ])
            ]);

            // Add creator as admin member
            $this->channelRepository->addMember($channel->id, $creatorId, [
                'role' => 'admin',
                'joined_at' => now()
            ]);

            // Add other members if specified
            if (!empty($channelData['members'])) {
                foreach ($channelData['members'] as $memberId) {
                    if ($memberId != $creatorId) {
                        $this->channelRepository->addMember($channel->id, $memberId, [
                            'role' => 'member',
                            'joined_at' => now()
                        ]);
                    }
                }
            }

            DB::commit();
            return $channel;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create channel: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get channel with members
     */
    public function getChannelWithMembers(string $channelId, int $userId): ?Channel
    {
        $channel = $this->channelRepository->findById($channelId);
        
        if (!$channel) {
            return null;
        }

        // Check if user has access to this channel
        $isMember = $this->channelRepository->isUserMember($channelId, $userId);
        
        if (!$isMember && $channel->type === 'private') {
            return null;
        }

        // Load members
        $channel->load(['members.user', 'creator']);
        
        return $channel;
    }

    /**
     * Update a channel
     */
    public function updateChannel(string $channelId, int $userId, array $updateData): ?Channel
    {
        $channel = $this->channelRepository->findById($channelId);
        
        if (!$channel) {
            return null;
        }

        // Check if user has admin permissions
        $isAdmin = $this->channelRepository->isUserAdmin($channelId, $userId);
        
        if (!$isAdmin) {
            return null;
        }

        try {
            $updateFields = [];
            
            if (isset($updateData['name'])) {
                $updateFields['name'] = $updateData['name'];
            }
            
            if (isset($updateData['description'])) {
                $updateFields['description'] = $updateData['description'];
            }
            
            if (isset($updateData['topic'])) {
                $updateFields['topic'] = $updateData['topic'];
            }
            
            if (isset($updateData['permissions'])) {
                $updateFields['permissions'] = json_encode($updateData['permissions']);
            }

            $updatedChannel = $this->channelRepository->update($channelId, $updateFields);
            
            return $updatedChannel;
        } catch (\Exception $e) {
            Log::error('Failed to update channel: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete a channel
     */
    public function deleteChannel(string $channelId, int $userId): bool
    {
        $channel = $this->channelRepository->findById($channelId);
        
        if (!$channel) {
            return false;
        }

        // Check if user is the creator or has admin permissions
        $isCreator = $channel->created_by === $userId;
        $isAdmin = $this->channelRepository->isUserAdmin($channelId, $userId);
        
        if (!$isCreator && !$isAdmin) {
            return false;
        }

        try {
            DB::beginTransaction();
            
            // Delete all channel members
            $this->channelRepository->deleteAllMembers($channelId);
            
            // Delete the channel
            $deleted = $this->channelRepository->delete($channelId);
            
            DB::commit();
            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete channel: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Join a channel
     */
    public function joinChannel(string $channelId, int $userId): bool
    {
        $channel = $this->channelRepository->findById($channelId);
        
        if (!$channel) {
            return false;
        }

        // Check if user is already a member
        $isMember = $this->channelRepository->isUserMember($channelId, $userId);
        
        if ($isMember) {
            return true; // Already a member
        }

        // For private channels, user must be invited
        if ($channel->type === 'private') {
            $isInvited = $this->channelRepository->isUserInvited($channelId, $userId);
            
            if (!$isInvited) {
                return false;
            }
        }

        try {
            $this->channelRepository->addMember($channelId, $userId, [
                'role' => 'member',
                'joined_at' => now()
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to join channel: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Leave a channel
     */
    public function leaveChannel(string $channelId, int $userId): bool
    {
        $channel = $this->channelRepository->findById($channelId);
        
        if (!$channel) {
            return false;
        }

        // Check if user is a member
        $isMember = $this->channelRepository->isUserMember($channelId, $userId);
        
        if (!$isMember) {
            return false;
        }

        // Creator cannot leave the channel (must delete it instead)
        if ($channel->created_by === $userId) {
            return false;
        }

        try {
            $this->channelRepository->removeMember($channelId, $userId);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to leave channel: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Add members to channel
     */
    public function addMembersToChannel(string $channelId, int $adminId, array $memberIds): bool
    {
        $channel = $this->channelRepository->findById($channelId);
        
        if (!$channel) {
            return false;
        }

        // Check if user has admin permissions
        $isAdmin = $this->channelRepository->isUserAdmin($channelId, $adminId);
        
        if (!$isAdmin) {
            return false;
        }

        try {
            DB::beginTransaction();
            
            foreach ($memberIds as $memberId) {
                // Check if user is already a member
                $isMember = $this->channelRepository->isUserMember($channelId, $memberId);
                
                if (!$isMember) {
                    $this->channelRepository->addMember($channelId, $memberId, [
                        'role' => 'member',
                        'joined_at' => now()
                    ]);
                }
            }
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add members to channel: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Remove members from channel
     */
    public function removeMembersFromChannel(string $channelId, int $adminId, array $memberIds): bool
    {
        $channel = $this->channelRepository->findById($channelId);
        
        if (!$channel) {
            return false;
        }

        // Check if user has admin permissions
        $isAdmin = $this->channelRepository->isUserAdmin($channelId, $adminId);
        
        if (!$isAdmin) {
            return false;
        }

        try {
            DB::beginTransaction();
            
            foreach ($memberIds as $memberId) {
                // Cannot remove the creator
                if ($channel->created_by === $memberId) {
                    continue;
                }
                
                // Cannot remove yourself (admin)
                if ($adminId === $memberId) {
                    continue;
                }
                
                $this->channelRepository->removeMember($channelId, $memberId);
            }
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to remove members from channel: ' . $e->getMessage());
            return false;
        }
    }
}
