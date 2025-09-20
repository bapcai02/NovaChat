<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdatePreferencesRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\UserSessionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UserSettingsController extends Controller
{
    private UserRepositoryInterface $users;

    private UserSessionService $userSessions;

    public function __construct(UserRepositoryInterface $users, UserSessionService $userSessions)
    {
        $this->users = $users;
        $this->userSessions = $userSessions;
    }

    public function getProfile(Request $request)
    {
        $user = $request->user();

        return response()->json(['data' => $user]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $data = $request->validated();
        $userId = (int) ($data['id'] ?? 0);
        if ($userId <= 0) {
            return response()->json(['message' => 'Invalid user id'], 422);
        }

        try {
            // Handle avatar upload if a file is provided
            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $data['avatar'] = Storage::url($path);
            }

            $updated = $this->users->update($userId, $data) ?: $this->users->findById($userId);

            return response()->json(['data' => $updated]);
        } catch (\Throwable $e) {
            Log::error('updateProfile failed', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Failed to update profile'], 500);
        }
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $userId = (int) $request->input('id');
        $user = $this->users->findById($userId);
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if (! Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        try {
            $user->password = Hash::make($request->input('new_password'));
            $this->users->save($user);

            return response()->json(['message' => 'Password changed']);
        } catch (\Throwable $e) {
            Log::error('changePassword failed', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Failed to change password'], 500);
        }
    }

    public function updatePreferences(UpdatePreferencesRequest $request)
    {
        try {
            $userId = (int) $request->input('id');
            DB::table('user_preferences')->updateOrInsert(
                ['user_id' => $userId],
                ['language' => $request->input('language'), 'updated_at' => now(), 'created_at' => now()]
            );

            return response()->json(['message' => 'Preferences updated']);
        } catch (\Throwable $e) {
            Log::error('updatePreferences failed', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Failed to update preferences'], 500);
        }
    }

    public function sessions(Request $request)
    {
        $sessions = $this->userSessions->listForUser($request->user()->id);

        return response()->json(['data' => $sessions]);
    }

    public function destroySession(Request $request, $id)
    {
        try {
            $this->userSessions->revoke($request->user()->id, (int) $id);

            return response()->json(['message' => 'Session revoked']);
        } catch (\Throwable $e) {
            Log::error('destroySession failed', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Failed to revoke session'], 500);
        }
    }
}
