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
        
        // Convert avatar to full URL
        if ($user && $user->avatar) {
            // Remove /storage/ prefix if it exists
            $avatarPath = $user->avatar;
            if (strpos($avatarPath, '/storage/') === 0) {
                $avatarPath = substr($avatarPath, 9); // Remove '/storage/' (9 characters)
            }
            $user->avatar = 'http://localhost:8000/storage/' . $avatarPath;
        }

        return response()->json(['data' => $user]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        // Get validated data
        $data = $request->validated();
        $user = $request->user();
        $userId = $user->id;

        try {
            // Filter out empty values and only keep fields that have actual values
            $updateData = array_filter($data, function($value) {
                return $value !== null && $value !== '';
            });

            // Handle avatar upload if a file is provided
            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $updateData['avatar'] = Storage::url($path);
            } elseif (isset($data['avatar']) && $data['avatar']) {
                // If no new file but avatar field exists in request, keep existing avatar
                $updateData['avatar'] = $data['avatar'];
            }

            // Only update if there's data to update
            if (empty($updateData)) {
                Log::info('No data to update, returning current user');
                return response()->json(['data' => $user]);
            }

            $updated = $this->users->update($userId, $updateData);
            
            if (!$updated) {
                Log::error('User update failed', ['userId' => $userId]);
                return response()->json(['message' => 'Failed to update profile'], 500);
            }

            // Get fresh user data
            $updated = $this->users->findById($userId);
            
            // Convert avatar to full URL
            if ($updated && $updated->avatar) {
                // Remove /storage/ prefix if it exists
                $avatarPath = $updated->avatar;
                if (strpos($avatarPath, '/storage/') === 0) {
                    $avatarPath = substr($avatarPath, 9); // Remove '/storage/' (9 characters)
                }
                $updated->avatar = 'http://localhost:8000/storage/' . $avatarPath;
            }
            
            Log::info('Profile updated successfully', ['user' => $updated]);

            return response()->json(['data' => $updated]);
        } catch (\Throwable $e) {
            Log::error('updateProfile failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

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
