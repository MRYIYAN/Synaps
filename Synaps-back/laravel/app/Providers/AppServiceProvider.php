<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\AuthenticateWithBearerToken;

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
        // Registro manual del middleware si no lo reconoce Laravel
        app('router')->aliasMiddleware('auth.bearer', AuthenticateWithBearerToken::class);
    }
}
