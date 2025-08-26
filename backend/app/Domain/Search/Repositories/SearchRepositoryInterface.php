<?php

namespace App\Domain\Search\Repositories;

interface SearchRepositoryInterface
{
    public function searchMessages(string $query, array $filters = []): array;
    public function searchChannels(string $query, array $filters = []): array;
    public function searchUsers(string $query, array $filters = []): array;
    public function searchFiles(string $query, array $filters = []): array;
    public function searchAll(string $query, array $filters = []): array;
}
