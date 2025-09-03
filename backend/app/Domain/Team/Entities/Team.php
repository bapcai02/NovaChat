<?php

namespace App\Domain\Team\Entities;

class Team
{
    public function __construct(
        private int $id,
        private string $name,
        private ?string $description = null,
        private ?string $avatar = null,
        private ?string $domain = null,
        private ?string $settings = null,
        private bool $isPublic = false,
        private bool $isArchived = false,
        private int $createdBy,
        private string $createdAt,
        private string $updatedAt
    ) {}

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function getDomain(): ?string
    {
        return $this->domain;
    }

    public function getSettings(): ?string
    {
        return $this->settings;
    }

    public function isPublic(): bool
    {
        return $this->isPublic;
    }

    public function isArchived(): bool
    {
        return $this->isArchived;
    }

    public function getCreatedBy(): int
    {
        return $this->createdBy;
    }

    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): string
    {
        return $this->updatedAt;
    }

}
