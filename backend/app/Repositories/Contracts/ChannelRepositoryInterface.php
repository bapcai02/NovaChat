<?php

namespace App\Repositories\Contracts;

interface ChannelRepositoryInterface
{
    public function getAll(): array;
    public function getById(int $id): ?array;
    public function create(array $data, int $createdBy): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): bool;
    public function getByTeam(int $teamId): array;
}


