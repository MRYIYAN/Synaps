<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Session\Middleware\StartSession;

/**
 * Define las rutas de la API para la aplicación.
 */

//---------------------------------------------------------------------------//
//  Ruta de prueba para verificar el estado del backend.                     //
//---------------------------------------------------------------------------//

/**
 * Devuelve un mensaje de bienvenida desde el backend.
 *
 * @param Request $request La solicitud HTTP.
 * @return \Illuminate\Http\JsonResponse Respuesta JSON con el mensaje de bienvenida.
 */
Route::get( '/hello', function( Request $request ): \Illuminate\Http\JsonResponse {
    return response()->json( [
        'message' => 'Hola desde Laravel y Bienvenido a Synaps, el back esta funcionando',
    ] );
} );

//---------------------------------------------------------------------------//
// Ejecución del Middleware para la autorización del usuario                 //
//---------------------------------------------------------------------------//

Route::middleware( ['api', 'keycloak.jwt'] )->group( function() {

    // Login-check: authvalida el token y devuelve datos del usuario
    Route::get( '/login-check', [AuthController::class, 'loginCheck'] );
} );

//---------------------------------------------------------------------------//
//  Ruta para la autenticación de usuarios.                                  //
//---------------------------------------------------------------------------//

/**
 * Maneja la autenticación de usuarios.
 *
 * @see AuthController::login()
 */
Route::post( '/login', [AuthController::class, 'login'] )
    ->middleware( ['api', StartSession::class] );

/**
 * Maneja el registro de nuevos usuarios.
 *
 * @see AuthController::register()
 */
Route::post( '/register', [AuthController::class, 'register'] );