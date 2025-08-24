<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Channel\Entities\Channel;
use App\Domain\Channel\Entities\ChannelMember;
use App\Domain\User\Entities\User;
use App\Domain\Channel\Services\ChannelService;
use App\Domain\User\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ChannelController extends Controller
{
    protected ChannelService $channelService;
    protected UserService $userService;

    public function __construct(ChannelService $channelService, UserService $userService)
    {
        $this->channelService = $channelService;
        $this->userService = $userService;
    }

    /**
     * Get all channels for the authenticated user
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            $channels = $this->channelService->getChannelsForUser($user->id);
            
            return response()->json([
                'success' => true,
                'data' => $channels,
                'message' => 'Channels retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve channels',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new channel
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:50|unique:channels,name',
                'description' => 'nullable|string|max:500',
                'type' => 'required|in:public,private',
                'topic' => 'nullable|string|max:100',
                'members' => 'array',
                'members.*' => 'exists:users,id',
                'permissions' => 'array',
                'permissions.read' => 'boolean',
                'permissions.write' => 'boolean',
                'permissions.admin' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $channelData = $request->only(['name', 'description', 'type', 'topic', 'members', 'permissions']);
            
            $channel = $this->channelService->createChannel($user->id, $channelData);
            
            return response()->json([
                'success' => true,
                'data' => $channel,
                'message' => 'Channel created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create channel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific channel
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $channel = $this->channelService->getChannelWithMembers($id, $user->id);
            
            if (!$channel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Channel not found or access denied'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $channel,
                'message' => 'Channel retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve channel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a channel
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:50|unique:channels,name,' . $id,
                'description' => 'nullable|string|max:500',
                'topic' => 'nullable|string|max:100',
                'permissions' => 'array',
                'permissions.read' => 'boolean',
                'permissions.write' => 'boolean',
                'permissions.admin' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $updateData = $request->only(['name', 'description', 'topic', 'permissions']);
            
            $channel = $this->channelService->updateChannel($id, $user->id, $updateData);
            
            if (!$channel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Channel not found or access denied'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $channel,
                'message' => 'Channel updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update channel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a channel
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $deleted = $this->channelService->deleteChannel($id, $user->id);
            
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Channel not found or access denied'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Channel deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete channel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Join a channel
     */
    public function join(Request $request, string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $joined = $this->channelService->joinChannel($id, $user->id);
            
            if (!$joined) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to join channel'
                ], 400);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Successfully joined channel'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to join channel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Leave a channel
     */
    public function leave(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $left = $this->channelService->leaveChannel($id, $user->id);
            
            if (!$left) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to leave channel'
                ], 400);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Successfully left channel'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to leave channel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add members to channel
     */
    public function addMembers(Request $request, string $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'members' => 'required|array',
                'members.*' => 'exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $members = $request->input('members');
            
            $added = $this->channelService->addMembersToChannel($id, $user->id, $members);
            
            if (!$added) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to add members to channel'
                ], 400);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Members added successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove members from channel
     */
    public function removeMembers(Request $request, string $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'members' => 'required|array',
                'members.*' => 'exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $members = $request->input('members');
            
            $removed = $this->channelService->removeMembersFromChannel($id, $user->id, $members);
            
            if (!$removed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to remove members from channel'
                ], 400);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Members removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove members',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
