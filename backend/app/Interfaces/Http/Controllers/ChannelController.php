<?php

namespace App\Interfaces\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Application\Services\ChannelApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChannelController extends Controller
{
    private ChannelApplicationService $channelApp;

    public function __construct(ChannelApplicationService $channelApp)
    {
        $this->channelApp = $channelApp;
    }

    public function index(): JsonResponse
    {
        $channels = $this->channelApp->getAllChannels();

        return response()->json([
            'success' => true,
            'data' => $channels,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $channel = $this->channelApp->getChannelById($id);

        if (!$channel) {
            return response()->json([
                'success' => false,
                'message' => 'Channel not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $channel,
        ]);
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

        try {
            $channel = $this->channelApp->createChannel($validated, $user->id);

            return response()->json([
                'success' => true,
                'data' => $channel,
                'message' => 'Channel created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create channel',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}


