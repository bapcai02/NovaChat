<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            $teams = DB::table('teams')
                ->select('teams.id', 'teams.name', 'teams.display_name', 'teams.description', 'teams.avatar', 'teams.is_public', 'teams.is_archived', 'teams.owner_id')
                ->join('team_members', 'team_members.team_id', '=', 'teams.id')
                ->where('team_members.user_id', $userId)
                ->orderBy('teams.name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $teams,
            ]);
        } catch (\Throwable $e) {
            Log::error('TeamController@index failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to load teams'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'display_name' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'members' => 'sometimes|array',
            'members.*' => 'integer|exists:users,id',
        ]);

        try {
            $userId = Auth::id();

            $teamId = DB::table('teams')->insertGetId([
                'name' => $data['name'],
                'display_name' => $data['display_name'] ?? $data['name'],
                'description' => $data['description'] ?? null,
                'avatar' => null,
                'domain' => null,
                'settings' => json_encode([]),
                'is_public' => false,
                'is_archived' => false,
                'owner_id' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('team_members')->insert([
                'team_id' => $teamId,
                'user_id' => $userId,
                'role' => 'owner',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Optional additional members
            $memberIds = collect($data['members'] ?? [])
                ->filter(fn ($id) => (int)$id !== (int)$userId)
                ->unique()
                ->values();

            if ($memberIds->isNotEmpty()) {
                $rows = $memberIds->map(fn ($id) => [
                    'team_id' => $teamId,
                    'user_id' => $id,
                    'role' => 'member',
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->all();
                DB::table('team_members')->insert($rows);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $teamId,
                    'name' => $data['name'],
                    'display_name' => $data['display_name'] ?? $data['name'],
                    'description' => $data['description'] ?? null,
                    'members_added' => $memberIds->values(),
                ],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('TeamController@store failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to create team'], 500);
        }
    }
}


