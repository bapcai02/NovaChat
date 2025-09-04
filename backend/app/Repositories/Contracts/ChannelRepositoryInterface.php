<?php

namespace App\Repositories\Contracts;

interface ChannelRepositoryInterface
{
    public function getAll(): array;
    public function getById(int $id): ?array;
    public function create(array $data, int $createdBy): array;
}


