<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register broadcasting auth route under API middleware so CORS + Bearer token works
        Broadcast::routes([
            'middleware' => ['api', 'auth:api'],
        ]);

        require base_path('routes/channels.php');
    }
}
