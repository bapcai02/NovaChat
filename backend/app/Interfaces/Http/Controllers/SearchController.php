<?php

namespace App\Interfaces\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Application\Services\SearchApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    private SearchApplicationService $searchApp;

    public function __construct(SearchApplicationService $searchApp)
    {
        $this->searchApp = $searchApp;
    }

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
            'type' => 'nullable|string|in:all,messages,channels,users,files',
            'time' => 'nullable|string|in:all,today,week,month,year',
            'channel_id' => 'nullable|integer|exists:channels,id',
        ]);

        $filters = [];
        if (isset($validated['type'])) {
            $filters['type'] = $validated['type'];
        }
        if (isset($validated['time'])) {
            $filters['time'] = $validated['time'];
        }
        if (isset($validated['channel_id'])) {
            $filters['channel_id'] = $validated['channel_id'];
        }

        $results = $this->searchApp->search($validated['q'], $filters);

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $validated['q'],
            'filters' => $filters,
            'total' => count($results),
        ]);
    }

    public function searchMessages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
            'time' => 'nullable|string|in:all,today,week,month,year',
            'channel_id' => 'nullable|integer|exists:channels,id',
        ]);

        $filters = [];
        if (isset($validated['time'])) {
            $filters['time'] = $validated['time'];
        }
        if (isset($validated['channel_id'])) {
            $filters['channel_id'] = $validated['channel_id'];
        }

        $results = $this->searchApp->searchMessages($validated['q'], $filters);

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $validated['q'],
            'filters' => $filters,
            'total' => count($results),
        ]);
    }

    public function searchChannels(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
        ]);

        $results = $this->searchApp->searchChannels($validated['q']);

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $validated['q'],
            'total' => count($results),
        ]);
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
        ]);

        $results = $this->searchApp->searchUsers($validated['q']);

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $validated['q'],
            'total' => count($results),
        ]);
    }

    public function searchFiles(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
        ]);

        $results = $this->searchApp->searchFiles($validated['q']);

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $validated['q'],
            'total' => count($results),
        ]);
    }
}
