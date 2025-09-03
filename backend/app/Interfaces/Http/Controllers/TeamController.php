<?php

namespace App\Interfaces\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Application\Services\TeamApplicationService;
use App\Http\Controllers\Controller;
use App\Interfaces\Request\TeamRequest;

class TeamController extends Controller
{
    private TeamApplicationService $teamService;

    public function __construct(TeamApplicationService $teamService)
    {
        $this->teamService = $teamService;
    }

    public function index(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $result = $this->teamService->getTeamsForUser($userId);

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 500);
        }
    }

    public function store(TeamRequest $request): JsonResponse
    {
        $data = $request->validated();

        $userId = Auth::id();
        $result = $this->teamService->createTeam($data, $userId);

        if ($result['success']) {
            return response()->json($result, 201);
        } else {
            return response()->json($result, 500);
        }
    }
}
