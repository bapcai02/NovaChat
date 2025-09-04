<?php

namespace App\Domain\Message\Entities;

class Bookmark
{
    private int $id;
    private int $userId;
    private int $messageId;
    private ?string $note;
    private ?array $tags;
    private string $createdAt;
    private string $updatedAt;

    public function __construct(
        int $id,
        int $userId,
        int $messageId,
        ?string $note = null,
        ?array $tags = null,
        string $createdAt,
        string $updatedAt
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->messageId = $messageId;
        $this->note = $note;
        $this->tags = $tags;
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

    public function getMessageId(): int
    {
        return $this->messageId;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function getTags(): ?array
    {
        return $this->tags;
    }

    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): string
    {
        return $this->updatedAt;
    }

    public function hasTag(string $tag): bool
    {
        return in_array($tag, $this->tags ?? []);
    }

    public function addTag(string $tag): void
    {
        if (!$this->hasTag($tag)) {
            $this->tags = array_merge($this->tags ?? [], [$tag]);
        }
    }

    public function removeTag(string $tag): void
    {
        if ($this->tags) {
            $this->tags = array_values(array_filter($this->tags, fn($t) => $t !== $tag));
        }
    }
}
