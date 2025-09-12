<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\ChannelRepositoryInterface as AppChannelRepositoryInterface;
use App\Repositories\Eloquent\EloquentChannelRepository;
use App\Repositories\Contracts\ConversationRepositoryInterface as AppConversationRepositoryInterface;
use App\Repositories\Eloquent\EloquentConversationRepository;
use App\Repositories\Contracts\MessageRepositoryInterface as AppMessageRepositoryInterface;
use App\Repositories\Eloquent\EloquentMessageRepository;
use App\Repositories\Contracts\TeamRepositoryInterface as AppTeamRepositoryInterface;
use App\Repositories\Eloquent\EloquentTeamRepository;
use App\Repositories\Contracts\SearchRepositoryInterface as AppSearchRepositoryInterface;
use App\Repositories\Eloquent\EloquentSearchRepository;
use App\Repositories\Contracts\ThreadRepositoryInterface as AppThreadRepositoryInterface;
use App\Repositories\Eloquent\EloquentThreadRepository;
use App\Domain\User\Repositories\UserRepositoryInterface as DomainUserRepositoryInterface;
use App\Infrastructure\Repositories\UserRepository as InfraUserRepository;
use App\Repositories\Contracts\UserRepositoryInterface as AppUserRepositoryInterface;
use App\Repositories\Eloquent\EloquentUserRepository;
use App\Domain\Channel\Repositories\ChannelRepositoryInterface;
use App\Domain\Channel\Repositories\ChannelRepository;
use App\Domain\Message\Repositories\ConversationRepositoryInterface;
use App\Domain\Message\Repositories\ConversationRepository;
use App\Domain\Message\Repositories\ThreadRepositoryInterface;
use App\Domain\Message\Repositories\ThreadRepository;
use App\Domain\Message\Repositories\MessageRepositoryInterface;
use App\Infrastructure\Repositories\MessageRepository;
use App\Domain\Team\Repositories\TeamRepositoryInterface;
use App\Infrastructure\Repositories\TeamRepository;
use App\Domain\Search\Repositories\SearchRepositoryInterface;
use App\Domain\Search\Repositories\SearchRepository;
use App\Repositories\Contracts\UserSessionRepositoryInterface;
use App\Repositories\Eloquent\EloquentUserSessionRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Keep old DDD binding until migration ends
        $this->app->bind(DomainUserRepositoryInterface::class, InfraUserRepository::class);
        // New Repository pattern bindings
        $this->app->bind(AppUserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(AppChannelRepositoryInterface::class, EloquentChannelRepository::class);
        $this->app->bind(AppConversationRepositoryInterface::class, EloquentConversationRepository::class);
        $this->app->bind(AppMessageRepositoryInterface::class, EloquentMessageRepository::class);
        $this->app->bind(AppTeamRepositoryInterface::class, EloquentTeamRepository::class);
        $this->app->bind(AppSearchRepositoryInterface::class, EloquentSearchRepository::class);
        $this->app->bind(AppThreadRepositoryInterface::class, EloquentThreadRepository::class);
        $this->app->bind(ChannelRepositoryInterface::class, ChannelRepository::class);
        $this->app->bind(ConversationRepositoryInterface::class, ConversationRepository::class);
        $this->app->bind(ThreadRepositoryInterface::class, ThreadRepository::class);
        $this->app->bind(MessageRepositoryInterface::class, MessageRepository::class);
        $this->app->bind(TeamRepositoryInterface::class, TeamRepository::class);
        $this->app->bind(SearchRepositoryInterface::class, SearchRepository::class);
        $this->app->bind(UserSessionRepositoryInterface::class, EloquentUserSessionRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
