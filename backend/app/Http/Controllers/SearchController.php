<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(private SearchService $search)
    {
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
        if (isset($validated['type'])) { $filters['type'] = $validated['type']; }
        if (isset($validated['time'])) { $filters['time'] = $validated['time']; }
        if (isset($validated['channel_id'])) { $filters['channel_id'] = $validated['channel_id']; }
        $results = $this->search->search($validated['q'], $filters);
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function searchMessages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
            'time' => 'nullable|string|in:all,today,week,month,year',
            'channel_id' => 'nullable|integer|exists:channels,id',
        ]);
        $filters = [];
        if (isset($validated['time'])) { $filters['time'] = $validated['time']; }
        if (isset($validated['channel_id'])) { $filters['channel_id'] = $validated['channel_id']; }
        $results = $this->search->searchMessages($validated['q'], $filters);
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function searchChannels(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
        ]);
        $results = $this->search->searchChannels($validated['q']);
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
        ]);
        $results = $this->search->searchUsers($validated['q']);
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function searchFiles(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
        ]);
        $results = $this->search->searchFiles($validated['q']);
        return response()->json(['success' => true, 'data' => $results]);
    }
}


