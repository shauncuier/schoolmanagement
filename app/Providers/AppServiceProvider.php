<?php

namespace App\Providers;

use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerAuthAuditing();
    }

    /**
     * Write audit-trail entries for authentication events.
     */
    private function registerAuthAuditing(): void
    {
        Event::listen(Login::class, function (Login $event) {
            app(ActivityLogger::class)->log('auth.login', 'Signed in', null, [], $event->user);
        });

        Event::listen(Logout::class, function (Logout $event) {
            app(ActivityLogger::class)->log('auth.logout', 'Signed out', null, [], $event->user);
        });

        Event::listen(Failed::class, function (Failed $event) {
            app(ActivityLogger::class)->log('auth.failed', 'Failed sign-in attempt', null, [
                'email' => $event->credentials['email'] ?? null,
            ]);
        });
    }
}
