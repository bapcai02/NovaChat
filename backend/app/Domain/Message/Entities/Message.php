<?php

namespace App\Domain\Message\Entities;

class Message
{
    public function __construct(
        private int $id,
        private int $userId,
        private string $content,
        private string $type = 'text',
        private ?int $channelId = null,
        private ?int $conversationId = null,
        private ?int $parentId = null,
        private ?string $metadata = null,
        private bool $isEdited = false,
        private ?string $editedAt = null,
        private bool $isPinned = false,
        private bool $isDeleted = false,
        private string $createdAt,
        private string $updatedAt
    ) {}

    public function getId(): int
    {
        return $this->id;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getChannelId(): ?int
    {
        return $this->channelId;
    }

    public function getConversationId(): ?int
    {
        return $this->conversationId;
    }

    public function getParentId(): ?int
    {
        return $this->parentId;
    }

    public function getMetadata(): ?string
    {
        return $this->metadata;
    }

    public function isEdited(): bool
    {
        return $this->isEdited;
    }

    public function getEditedAt(): ?string
    {
        return $this->editedAt;
    }

    public function isPinned(): bool
    {
        return $this->isPinned;
    }

    public function isDeleted(): bool
    {
        return $this->isDeleted;
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
