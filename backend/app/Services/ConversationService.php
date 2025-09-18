<?php

namespace App\Services;

use App\Repositories\Contracts\ConversationRepositoryInterface;
use Illuminate\Support\Facades\Log;

class ConversationService
{
    private ConversationRepositoryInterface $conversations;

    public function __construct(ConversationRepositoryInterface $conversations)
    {
        $this->conversations = $conversations;
    }

    public function getUserConversations(int $userId): array
    {
        try {
            $conversations = $this->conversations->getUserConversations($userId);
            return ['success' => true, 'data' => $conversations];
        } catch (\Throwable $e) {
            Log::error('ConversationService@getUserConversations failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to load conversations'];
        }
    }

    public function createConversation(array $data): array
    {
        try {
            $conversation = $this->conversations->create($data);
            return ['success' => true, 'data' => $conversation];
        } catch (\Throwable $e) {
            Log::error('ConversationService@createConversation failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create conversation'];
        }
    }

    public function getConversation(string $conversationId, int $userId): array
    {
        try {
            $conversation = $this->conversations->findById((int)$conversationId);
            if (!$conversation) {
                return ['success' => false, 'message' => 'Conversation not found'];
            }

            // Check if user is member
            $isMember = $this->conversations->isMember($conversationId, $userId);
            if (!$isMember) {
                return ['success' => false, 'message' => 'Access denied'];
            }

            return ['success' => true, 'data' => $conversation];
        } catch (\Throwable $e) {
            Log::error('ConversationService@getConversation failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to load conversation'];
        }
    }

    public function getConversationMessages(string $conversationId, int $userId, int $limit = 50, ?int $beforeId = null): array
    {
        try {
            // Check if user is member
            $isMember = $this->conversations->isMember((int)$conversationId, $userId);
            if (!$isMember) {
                return ['success' => false, 'message' => 'Access denied'];
            }

            $messages = $this->conversations->getMessages((int)$conversationId, $limit, $beforeId, $userId);
            
            // Get unique users from messages
            $users = [];
            $userIds = [];
            foreach ($messages as $message) {
                if (isset($message['sender']['id']) && !in_array($message['sender']['id'], $userIds)) {
                    $userIds[] = $message['sender']['id'];
                    $users[] = $message['sender'];
                }
            }
            
            return [
                'success' => true, 
                'data' => [
                    'messages' => $messages,
                    'users' => $users
                ]
            ];
        } catch (\Throwable $e) {
            Log::error('ConversationService@getConversationMessages failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to load messages'];
        }
    }

    public function getMembers(string $conversationId, int $userId): array
    {
        try {
            // Check if user is member
            $isMember = $this->conversations->isMember((int)$conversationId, $userId);
            if (!$isMember) {
                return ['success' => false, 'message' => 'Access denied'];
            }

            $members = $this->conversations->getMembers((int)$conversationId);
            
            return [
                'success' => true, 
                'data' => $members
            ];
        } catch (\Throwable $e) {
            Log::error('ConversationService@getMembers failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to get members'];
        }
    }

    public function addMember(string $conversationId, int $userId, int $requesterId): array
    {
        try {
            // Check if requester has permission
            $canManage = $this->conversations->canManageMembers((int)$conversationId, $requesterId);
            if (!$canManage) {
                return ['success' => false, 'message' => 'Permission denied'];
            }

            $result = $this->conversations->addMember((int)$conversationId, $userId);
            return ['success' => $result, 'message' => $result ? 'Member added successfully' : 'Failed to add member'];
        } catch (\Throwable $e) {
            Log::error('ConversationService@addMember failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to add member'];
        }
    }

    public function removeMember(string $conversationId, int $userId, int $requesterId): array
    {
        try {
            // Check if requester has permission
            $canManage = $this->conversations->canManageMembers((int)$conversationId, $requesterId);
            if (!$canManage) {
                return ['success' => false, 'message' => 'Permission denied'];
            }

            $result = $this->conversations->removeMember((int)$conversationId, $userId);
            return ['success' => $result, 'message' => $result ? 'Member removed successfully' : 'Failed to remove member'];
        } catch (\Throwable $e) {
            Log::error('ConversationService@removeMember failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to remove member'];
        }
    }

    public function pinConversation(string $conversationId, int $userId): array
    {
        try {
            // Check if user is member
            $isMember = $this->conversations->isMember((int)$conversationId, $userId);
            if (!$isMember) {
                return ['success' => false, 'message' => 'Access denied'];
            }

            $result = $this->conversations->pinConversation((int)$conversationId);
            
            if ($result) {
                // Get updated conversation data
                $conversation = $this->conversations->findById((int)$conversationId);
                return [
                    'success' => true, 
                    'data' => $conversation,
                    'message' => 'Conversation pinned successfully'
                ];
            }
            
            return [
                'success' => false, 
                'message' => 'Failed to pin conversation'
            ];
        } catch (\Throwable $e) {
            Log::error('ConversationService@pinConversation failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to pin conversation'];
        }
    }

    public function unpinConversation(string $conversationId, int $userId): array
    {
        try {
            // Check if user is member
            $isMember = $this->conversations->isMember((int)$conversationId, $userId);
            if (!$isMember) {
                return ['success' => false, 'message' => 'Access denied'];
            }

            $result = $this->conversations->unpinConversation((int)$conversationId);
            
            if ($result) {
                // Get updated conversation data
                $conversation = $this->conversations->findById((int)$conversationId);
                return [
                    'success' => true, 
                    'data' => $conversation,
                    'message' => 'Conversation unpinned successfully'
                ];
            }
            
            return [
                'success' => false, 
                'message' => 'Failed to unpin conversation'
            ];
        } catch (\Throwable $e) {
            Log::error('ConversationService@unpinConversation failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to unpin conversation'];
        }
    }

    public function muteConversation(string $conversationId, int $userId): array
    {
        try {
            $isMember = $this->conversations->isMember((int)$conversationId, $userId);
            if (!$isMember) {
                return ['success' => false, 'message' => 'Access denied'];
            }

            \App\Models\ConversationMute::updateOrCreate(
                ['conversation_id' => (int)$conversationId, 'user_id' => $userId],
                ['muted_at' => now()]
            );
            return ['success' => true, 'message' => 'Conversation muted'];
        } catch (\Throwable $e) {
            Log::error('ConversationService@muteConversation failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to mute conversation'];
        }
    }

    public function unmuteConversation(string $conversationId, int $userId): array
    {
        try {
            $isMember = $this->conversations->isMember((int)$conversationId, $userId);
            if (!$isMember) {
                return ['success' => false, 'message' => 'Access denied'];
            }

            \App\Models\ConversationMute::where('conversation_id', (int)$conversationId)
                ->where('user_id', $userId)
                ->delete();
            return ['success' => true, 'message' => 'Conversation unmuted'];
        } catch (\Throwable $e) {
            Log::error('ConversationService@unmuteConversation failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to unmute conversation'];
        }
    }

    public function getMentions(int $userId, int $page = 1, int $limit = 20): array
    {
        try {
            $result = $this->conversations->getMentions($userId, $page, $limit);
            return ['success' => true, 'data' => $result['data'], 'pagination' => $result['pagination']];
        } catch (\Throwable $e) {
            Log::error('ConversationService@getMentions failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to load mentions'];
        }
    }
}