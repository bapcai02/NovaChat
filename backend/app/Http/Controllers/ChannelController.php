<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChannelRequest;
use App\Services\ChannelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChannelController extends Controller
{
    private ChannelService $channels;

    public function __construct(ChannelService $channels)
    {
        $this->channels = $channels;
    }

    public function index(): JsonResponse
    {
        $data = $this->channels->getAllChannels();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(ChannelRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $validated = $request->validated();
        $result = $this->channels->createChannel($validated, (int) $user->id);
        return response()->json(['success' => true, 'data' => $result], 201);
    }
}


