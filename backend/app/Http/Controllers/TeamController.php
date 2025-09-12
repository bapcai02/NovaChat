<?php

namespace App\Http\Controllers;

use App\Services\TeamService;
use App\Http\Requests\TeamRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TeamController extends Controller
{
    private TeamService $teams;

    public function __construct(TeamService $teams)
    {
        $this->teams = $teams;
    }

    public function index(): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () {
            $userId = (int) Auth::id();
            $result = $this->teams->getTeamsForUser($userId);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to retrieve teams',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->successResponse($result['data'] ?? null, 'Teams retrieved successfully');
        }, 'Teams retrieved', 'Failed to retrieve teams');
    }

    public function store(TeamRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $user) {
            $validated = $request->validated();
            $result = $this->teams->createTeam($validated, (int)$user->id);
            
            if (!$result['success']) {
                return $this->errorResponse(
                    $result['message'] ?? 'Failed to create team',
                    $result['errors'] ?? null,
                    $result['code'] ?? 500
                );
            }
            
            return $this->createdResponse($result['data'] ?? null, $result['message'] ?? 'Team created successfully');
        }, 'Team created', 'Failed to create team');
    }
}


