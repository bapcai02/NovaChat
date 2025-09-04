<?php

namespace App\Domain\Team\Entities;

class Team
{
    private int $id;
    private string $name;
    private ?string $description;
    private ?string $avatar;
    private ?string $domain;
    private ?string $settings;
    private bool $isPublic;
    private bool $isArchived;
    private int $createdBy;
    private string $createdAt;
    private string $updatedAt;

    public function __construct(
        int $id,
        string $name,
        ?string $description = null,
        ?string $avatar = null,
        ?string $domain = null,
        ?string $settings = null,
        bool $isPublic = false,
        bool $isArchived = false,
        int $createdBy,
        string $createdAt,
        string $updatedAt
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->avatar = $avatar;
        $this->domain = $domain;
        $this->settings = $settings;
        $this->isPublic = $isPublic;
        $this->isArchived = $isArchived;
        $this->createdBy = $createdBy;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

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
