<?php

namespace App\Domain\User\Entities;

class UserDDD
{
    public function __construct(
        private int $id,
        private string $name,
        private string $email,
        private string $username,
        private ?string $emailVerifiedAt = null,
        private ?string $password = null,
        private ?string $avatar = null,
        private ?string $status = null,
        private ?string $statusMessage = null,
        private ?string $timezone = null,
        private ?string $language = null,
        private ?string $createdAt = null,
        private ?string $updatedAt = null
    ) {}

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getEmailVerifiedAt(): ?string
    {
        return $this->emailVerifiedAt;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function getStatusMessage(): ?string
    {
        return $this->statusMessage;
    }

    public function getTimezone(): ?string
    {
        return $this->timezone;
    }

    public function getLanguage(): ?string
    {
        return $this->language;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }
}
