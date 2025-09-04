<?php

namespace App\Domain\Message\Entities;

class Message
{
    private int $id;
    private int $userId;
    private string $content;
    private string $type;
    private ?int $channelId;
    private ?int $conversationId;
    private ?int $parentId;
    private ?string $metadata;
    private bool $isEdited;
    private ?string $editedAt;
    private bool $isPinned;
    private bool $isDeleted;
    private string $createdAt;
    private string $updatedAt;

    public function __construct(
        int $id,
        int $userId,
        string $content,
        string $type = 'text',
        ?int $channelId = null,
        ?int $conversationId = null,
        ?int $parentId = null,
        ?string $metadata = null,
        bool $isEdited = false,
        ?string $editedAt = null,
        bool $isPinned = false,
        bool $isDeleted = false,
        string $createdAt,
        string $updatedAt
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->content = $content;
        $this->type = $type;
        $this->channelId = $channelId;
        $this->conversationId = $conversationId;
        $this->parentId = $parentId;
        $this->metadata = $metadata;
        $this->isEdited = $isEdited;
        $this->editedAt = $editedAt;
        $this->isPinned = $isPinned;
        $this->isDeleted = $isDeleted;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

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
