<?php

namespace App\Interfaces\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Application\Services\ChannelApplicationService;
use Illuminate\Http\JsonResponse;

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
}


