<?php

namespace App\Application\Services;

use App\Domain\Team\Repositories\TeamRepositoryInterface;
use App\Domain\User\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeamApplicationService
{
    private TeamRepositoryInterface $teamRepository;
    private UserRepositoryInterface $userRepository;

    public function __construct(TeamRepositoryInterface $teamRepository, UserRepositoryInterface $userRepository)
    {
        $this->teamRepository = $teamRepository;
        $this->userRepository = $userRepository;
    }

    /**
     * Get teams for authenticated user
     */
    public function getTeamsForUser(int $userId): array
    {
        try {
            $teams = $this->teamRepository->getTeamsForUser($userId);

            return [
                'success' => true,
                'data' => $teams,
            ];
        } catch (\Throwable $e) {
            Log::error('TeamApplicationService@getTeamsForUser failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to load teams',
            ];
        }
    }

    /**
     * Create a new team
     */
    public function createTeam(array $data, int $userId): array
    {
        try {
            $team = $this->teamRepository->create($data, $userId);

            return [
                'success' => true,
                'message' => 'Team created successfully',
                'data' => [
                    'id' => $team->getId(),
                    'name' => $team->getName(),
                    'description' => $team->getDescription(),
                    'created_at' => $team->getCreatedAt(),
                    'updated_at' => $team->getUpdatedAt(),
                ],
            ];
        } catch (\Throwable $e) {
            Log::error('TeamApplicationService@createTeam failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to create team',
            ];
        }
    }

    /**
     * Add member to team
     */
    public function addMemberToTeam(int $teamId, int $userId, string $role = 'member'): array
    {
        try {
            // Check if team exists
            $team = $this->teamRepository->findById($teamId);
            if (!$team) {
                return ['success' => false, 'message' => 'Team not found'];
            }

            // Check if user exists
            $user = $this->userRepository->findById($userId);
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }

            // Check if user is already a member
            if ($this->teamRepository->isMember($teamId, $userId)) {
                return ['success' => false, 'message' => 'User is already a member of this team'];
            }

            // Add member
            $success = $this->teamRepository->addMember($teamId, $userId, $role);

            if ($success) {
                return [
                    'success' => true,
                    'message' => 'Member added successfully',
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to add member',
                ];
            }
        } catch (\Throwable $e) {
            Log::error('TeamApplicationService@addMemberToTeam failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to add member',
            ];
        }
    }

    /**
     * Remove member from team
     */
    public function removeMemberFromTeam(int $teamId, int $userId): array
    {
        try {
            $success = $this->teamRepository->removeMember($teamId, $userId);

            if ($success) {
                return [
                    'success' => true,
                    'message' => 'Member removed successfully',
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Member not found',
                ];
            }
        } catch (\Throwable $e) {
            Log::error('TeamApplicationService@removeMemberFromTeam failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to remove member',
            ];
        }
    }
}
