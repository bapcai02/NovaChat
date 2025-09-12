<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdatePreferencesRequest;

class UserSettingsController extends Controller
{
    public function getProfile(Request $request)
    {
        $user = $request->user();
        return response()->json(['data' => $user]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();

        $data = $request->validated();

        // Handle avatar upload if a file is provided
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = Storage::url($path);
        }

        $user->fill($data);
        $user->save();

        return response()->json(['data' => $user]);
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return response()->json(['message' => 'Password changed']);
    }

    public function updatePreferences(UpdatePreferencesRequest $request)
    {
        $userId = $request->user()->id;
        DB::table('user_preferences')->updateOrInsert(
            ['user_id' => $userId],
            ['language' => $request->input('language'), 'updated_at' => now(), 'created_at' => now()]
        );

        return response()->json(['message' => 'Preferences updated']);
    }

    public function sessions(Request $request)
    {
        $sessions = DB::table('user_sessions')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('last_active')
            ->get();
        return response()->json(['data' => $sessions]);
    }

    public function destroySession(Request $request, $id)
    {
        DB::table('user_sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();
        return response()->json(['message' => 'Session revoked']);
    }
}


