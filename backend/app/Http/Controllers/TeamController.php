<?php

namespace App\Http\Controllers;

use App\Services\TeamService;
use App\Http\Requests\TeamRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TeamController extends Controller
{
    public function __construct(private TeamService $teams)
    {
    }

    public function index(): JsonResponse
    {
        $userId = (int) Auth::id();
        $result = $this->teams->getTeamsForUser($userId);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function store(TeamRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $validated = $request->validated();
        $result = $this->teams->createTeam($validated, (int)$user->id);
        return response()->json($result, $result['success'] ? 201 : 500);
    }
}


