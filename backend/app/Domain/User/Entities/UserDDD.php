<?php

namespace App\Domain\User\Entities;

class UserDDD
{
    private int $id;
    private string $name;
    private string $email;
    private string $username;
    private ?string $emailVerifiedAt;
    private ?string $password;
    private ?string $avatar;
    private ?string $status;
    private ?string $statusMessage;
    private ?string $timezone;
    private ?string $language;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(
        int $id,
        string $name,
        string $email,
        string $username,
        ?string $emailVerifiedAt = null,
        ?string $password = null,
        ?string $avatar = null,
        ?string $status = null,
        ?string $statusMessage = null,
        ?string $timezone = null,
        ?string $language = null,
        ?string $createdAt = null,
        ?string $updatedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->username = $username;
        $this->emailVerifiedAt = $emailVerifiedAt;
        $this->password = $password;
        $this->avatar = $avatar;
        $this->status = $status;
        $this->statusMessage = $statusMessage;
        $this->timezone = $timezone;
        $this->language = $language;
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
