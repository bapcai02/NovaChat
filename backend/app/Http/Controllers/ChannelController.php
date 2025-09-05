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
        return $this->executeInTransactionWithResponse(function () {
            $data = $this->channels->getAllChannels();
            return $this->successResponse($data, 'Channels retrieved successfully');
        }, 'Channels retrieved', 'Failed to retrieve channels');
    }

    public function store(ChannelRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated');
        }

        return $this->executeInTransactionWithResponse(function () use ($request, $user) {
            $validated = $request->validated();
            $result = $this->channels->createChannel($validated, (int) $user->id);
            return $this->createdResponse($result, 'Channel created successfully');
        }, 'Channel created', 'Failed to create channel');
    }
}


