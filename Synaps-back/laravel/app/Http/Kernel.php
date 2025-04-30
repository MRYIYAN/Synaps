<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * Middlewares globales de la aplicación.
     *
     * @var array
     */
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class, // Versión moderna de CORS
        \App\Http\Middleware\CorsMiddleware::class,
        \App\Http\Middleware\TrustProxies::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * Grupos de Middlewares de rutas.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * Middleware de rutas individuales.
     *
     * @var array
     */
    protected $routeMiddleware = [
            'auth'              => \App\Http\Middleware\Authenticate::class
        ,   'guest'             => \App\Http\Middleware\RedirectIfAuthenticated::class

        // Auth
        ,   'auth.basic'        => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class
        ,   'can'               => \Illuminate\Auth\Middleware\Authorize::class
        ,   'password.confirm'  => \Illuminate\Auth\Middleware\RequirePassword::class
        ,   'verified'          => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class

        // Routing
        ,   'bindings'          => \Illuminate\Routing\Middleware\SubstituteBindings::class
        ,   'signed'            => \Illuminate\Routing\Middleware\ValidateSignature::class
        ,   'throttle'          => \Illuminate\Routing\Middleware\ThrottleRequests::class

        // HTTP
        ,   'cache.headers'     => \Illuminate\Http\Middleware\SetCacheHeaders::class
        
    ];
}