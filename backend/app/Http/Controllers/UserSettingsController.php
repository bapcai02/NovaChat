<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSettingsController extends Controller
{
    public function getProfile(Request $request)
    {
        $user = $request->user();
        return response()->json(['data' => $user]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:50',
            'avatar' => 'sometimes|url'
        ]);

        $user->fill($data);
        $user->save();

        return response()->json(['data' => $user]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();
        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return response()->json(['message' => 'Password changed']);
    }

    public function updatePreferences(Request $request)
    {
        $request->validate([
            'language' => 'required|in:EN,VI',
        ]);

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


