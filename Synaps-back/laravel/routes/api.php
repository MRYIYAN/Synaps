<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FolderNoteController;
use App\Http\Controllers\NoteController;
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
Route::get( '/hello', function (Request $request): \Illuminate\Http\JsonResponse {
    return response()->json([
        'message' => 'Hola desde Laravel y Bienvenido a Synaps, el back esta funcionando',
    ] );
} );

//---------------------------------------------------------------------------//
//  Rutas protegidas con el middleware auth.bearer                           //
//---------------------------------------------------------------------------//

Route::middleware( ['auth.bearer'] )->group( function () {
    Route::get( '/api/login-check', [AuthController::class, 'loginCheck'] );
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

//---------------------------------------------------------------------------//
//  Ruta para la gestión de notas y carpetas                                 //
//---------------------------------------------------------------------------//

/**
 * Maneja la creación de nuevas notas.
 *
 * @see NoteController::addNote()
 */
Route::post( '/addNote', [NoteController::class, 'addNote'] );

/**
 * Maneja el registro de carpetas de notas.
 *
 * @see FolderNoteController::addFolder()
 */
Route::post( '/addFolder', [FolderNoteController::class, 'addFolder'] );

// GET /api/getNotes
Route::get( 'getNotes', [NoteController::class, 'getNotes'] );

/**
 * Maneja el registro de carpetas de notas.
 *
 * @see FolderNoteController::searchNotes()
 */
Route::post( '/searchNotes', [NoteController::class, 'searchNotes'] );

/**
 * Lee una nota concreta.
 *
 * @see NoteController::readNote()
 */
Route::get( '/readNote', [NoteController::class, 'readNote'] );