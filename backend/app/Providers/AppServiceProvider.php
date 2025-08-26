<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Domain\User\Repositories\UserRepository;
use App\Domain\Channel\Repositories\ChannelRepositoryInterface;
use App\Domain\Channel\Repositories\ChannelRepository;
use App\Domain\Message\Repositories\ConversationRepositoryInterface;
use App\Domain\Message\Repositories\ConversationRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(ChannelRepositoryInterface::class, ChannelRepository::class);
        $this->app->bind(ConversationRepositoryInterface::class, ConversationRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
