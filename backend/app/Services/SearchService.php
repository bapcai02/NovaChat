<?php

namespace App\Services;

use App\Repositories\Contracts\SearchRepositoryInterface;

class SearchService
{
    private SearchRepositoryInterface $search;

    public function __construct(SearchRepositoryInterface $search)
    {
        $this->search = $search;
    }

    public function search(string $query, array $filters = []): array
    {
        if (trim($query) === '') { return []; }
        return $this->search->searchAll($query, $filters);
    }

    public function searchMessages(string $query, array $filters = []): array
    {
        if (trim($query) === '') { return []; }
        return $this->search->searchMessages($query, $filters);
    }

    public function searchChannels(string $query, array $filters = []): array
    {
        if (trim($query) === '') { return []; }
        return $this->search->searchChannels($query, $filters);
    }

    public function searchUsers(string $query, array $filters = []): array
    {
        if (trim($query) === '') { return []; }
        return $this->search->searchUsers($query, $filters);
    }

    public function searchFiles(string $query, array $filters = []): array
    {
        if (trim($query) === '') { return []; }
        return $this->search->searchFiles($query, $filters);
    }
}


