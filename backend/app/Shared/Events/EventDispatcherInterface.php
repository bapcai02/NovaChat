<?php

namespace App\Shared\Events;

interface EventDispatcherInterface
{
    public function dispatch(object $event): void;
    public function listen(string $event, callable $listener): void;
    public function forget(string $event): void;
}
