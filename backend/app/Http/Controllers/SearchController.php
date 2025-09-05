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
        return $this->executeInTransactionWithResponse(function () use ($request) {
            $validated = $request->validated();
            $filters = [];
            if (isset($validated['type'])) { $filters['type'] = $validated['type']; }
            if (isset($validated['time'])) { $filters['time'] = $validated['time']; }
            if (isset($validated['channel_id'])) { $filters['channel_id'] = $validated['channel_id']; }
            $results = $this->search->search($validated['q'], $filters);
            return $this->successResponse($results, 'Search completed successfully');
        }, 'Search completed', 'Search failed');
    }

    public function searchMessages(SearchMessagesRequest $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request) {
            $validated = $request->validated();
            $filters = [];
            if (isset($validated['time'])) { $filters['time'] = $validated['time']; }
            if (isset($validated['channel_id'])) { $filters['channel_id'] = $validated['channel_id']; }
            $results = $this->search->searchMessages($validated['q'], $filters);
            return $this->successResponse($results, 'Message search completed successfully');
        }, 'Message search completed', 'Message search failed');
    }

    public function searchChannels(SearchBasicRequest $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request) {
            $validated = $request->validated();
            $results = $this->search->searchChannels($validated['q']);
            return $this->successResponse($results, 'Channel search completed successfully');
        }, 'Channel search completed', 'Channel search failed');
    }

    public function searchUsers(SearchBasicRequest $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request) {
            $validated = $request->validated();
            $results = $this->search->searchUsers($validated['q']);
            return $this->successResponse($results, 'User search completed successfully');
        }, 'User search completed', 'User search failed');
    }

    public function searchFiles(SearchBasicRequest $request): JsonResponse
    {
        return $this->executeInTransactionWithResponse(function () use ($request) {
            $validated = $request->validated();
            $results = $this->search->searchFiles($validated['q']);
            return $this->successResponse($results, 'File search completed successfully');
        }, 'File search completed', 'File search failed');
    }
}


