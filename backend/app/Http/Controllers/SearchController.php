<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchBasicRequest;
use App\Http\Requests\SearchMessagesRequest;
use App\Http\Requests\SearchRequest;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    private SearchService $search;

    public function __construct(SearchService $search)
    {
        $this->search = $search;
    }

    public function search(SearchRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $filters = [];
        if (isset($validated['type'])) { $filters['type'] = $validated['type']; }
        if (isset($validated['time'])) { $filters['time'] = $validated['time']; }
        if (isset($validated['channel_id'])) { $filters['channel_id'] = $validated['channel_id']; }
        $results = $this->search->search($validated['q'], $filters);
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function searchMessages(SearchMessagesRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $filters = [];
        if (isset($validated['time'])) { $filters['time'] = $validated['time']; }
        if (isset($validated['channel_id'])) { $filters['channel_id'] = $validated['channel_id']; }
        $results = $this->search->searchMessages($validated['q'], $filters);
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function searchChannels(SearchBasicRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $results = $this->search->searchChannels($validated['q']);
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function searchUsers(SearchBasicRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $results = $this->search->searchUsers($validated['q']);
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function searchFiles(SearchBasicRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $results = $this->search->searchFiles($validated['q']);
        return response()->json(['success' => true, 'data' => $results]);
    }
}


