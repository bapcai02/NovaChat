<?php

namespace App\Application\Services;

use App\Domain\Search\Repositories\SearchRepositoryInterface;

class SearchApplicationService
{
    private SearchRepositoryInterface $searchRepository;

    public function __construct(SearchRepositoryInterface $searchRepository)
    {
        $this->searchRepository = $searchRepository;
    }

    public function search(string $query, array $filters = []): array
    {
        if (empty(trim($query))) {
            return [];
        }

        return $this->searchRepository->searchAll($query, $filters);
    }

    public function searchMessages(string $query, array $filters = []): array
    {
        if (empty(trim($query))) {
            return [];
        }

        return $this->searchRepository->searchMessages($query, $filters);
    }

    public function searchChannels(string $query, array $filters = []): array
    {
        if (empty(trim($query))) {
            return [];
        }

        return $this->searchRepository->searchChannels($query, $filters);
    }

    public function searchUsers(string $query, array $filters = []): array
    {
        if (empty(trim($query))) {
            return [];
        }

        return $this->searchRepository->searchUsers($query, $filters);
    }

    public function searchFiles(string $query, array $filters = []): array
    {
        if (empty(trim($query))) {
            return [];
        }

        return $this->searchRepository->searchFiles($query, $filters);
    }
}
