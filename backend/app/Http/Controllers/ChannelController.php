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

    public function show(int $channelId): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($channelId) {
            $data = $this->channels->getChannelById($channelId);
            return $this->successResponse($data, 'Channel retrieved successfully');
        }, 'Channel retrieved', 'Failed to retrieve channel');
    }

    public function update(ChannelRequest $request, int $channelId): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request, $channelId) {
            $validated = $request->validated();
            $result = $this->channels->updateChannel($channelId, $validated);
            return $this->updatedResponse($result, 'Channel updated successfully');
        }, 'Channel updated', 'Failed to update channel');
    }

    public function destroy(int $channelId): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($channelId) {
            $this->channels->deleteChannel($channelId);
            return $this->deletedResponse('Channel deleted successfully');
        }, 'Channel deleted', 'Failed to delete channel');
    }

    public function getTeamChannels(int $teamId): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($teamId) {
            $data = $this->channels->getChannelsByTeam($teamId);
            return $this->successResponse($data, 'Team channels retrieved successfully');
        }, 'Team channels retrieved', 'Failed to retrieve team channels');
    }
}


