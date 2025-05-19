<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

//===========================================================================//
//                        ROUTE SERVICE PROVIDER                             //
//===========================================================================//
//  Configura los grupos de rutas para la API y la web.                      //
//  Define los prefijos y middlewares para cada grupo de rutas.              //
//===========================================================================//

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Ruta HOME por defecto.
     * @var string
     */
    public const HOME = '/';

    /**
     * Registra las rutas de la aplicación.
     *
     * @return void
     */
    public function boot(): void
    {
        $this->routes(function () {
            //==============================//
            // RUTAS API (prefijo /api)     //
            //==============================//
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            //==============================//
            // RUTAS WEB                    //
            //==============================//
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
