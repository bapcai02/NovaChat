<?php

namespace App\Http\Controllers;

use App\Services\ChannelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChannelController extends Controller
{
    public function __construct(private ChannelService $channels)
    {
    }

    public function index(): JsonResponse
    {
        $data = $this->channels->getAllChannels();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:channels,name',
            'display_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_private' => 'boolean',
        ]);
        $result = $this->channels->createChannel($validated, (int) $user->id);
        return response()->json(['success' => true, 'data' => $result], 201);
    }
}


