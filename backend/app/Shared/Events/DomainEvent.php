<?php

namespace App\Shared\Events;

interface DomainEvent
{
    public function getEventName(): string;
    public function getEventData(): array;
}
