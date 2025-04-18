<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

/**
 * Configura y crea una instancia de la aplicación Laravel.
 *
 * @return Application La instancia configurada de la aplicación.
 */
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php', // Ruta para las rutas web.
        commands: __DIR__.'/../routes/console.php', // Ruta para los comandos de consola.
        health: '/up', // Ruta para la verificación de estado de la aplicación.
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Configuración de middlewares.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Configuración de manejo de excepciones.
    })->create();
