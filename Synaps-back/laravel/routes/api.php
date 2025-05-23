<?php

//===========================================================================//
//                                RUTAS DE LA API                            //
//===========================================================================//

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VaultController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FolderNoteController;
use App\Http\Controllers\NoteController;
use Illuminate\Session\Middleware\StartSession;

//===========================================================================//
//  RUTA DE PRUEBA PARA VERIFICAR EL ESTADO DEL BACKEND                      //
//===========================================================================//

/**
 * GET /hello
 * Devuelve un mensaje de bienvenida desde el backend.
 *
 * @param Request $request
 * @return \Illuminate\Http\JsonResponse
 */
Route::get( '/hello', function( Request $request ): \Illuminate\Http\JsonResponse {
    return response()->json( [
        'message' => 'Hola desde Laravel y Bienvenido a Synaps, el back esta funcionando',
    ] );
} );

//===========================================================================//
//  RUTAS PROTEGIDAS POR BEARER TOKEN                                        //
//===========================================================================//
try
{
    Route::middleware( ['auth.bearer'] )->group(function() {
        //=======================//
        // VAULTS API           //
        //=======================//

        /**
         * GET /vaults
         * Lista todos los vaults del usuario autenticado.
         *
         * @see VaultController::index()
         */
        Route::get( '/vaults', [VaultController::class, 'index'] );

        /**
         * POST /vaults
         * Crea un nuevo vault para el usuario autenticado.
         *
         * @see VaultController::store()
         */
        Route::post( '/vaults', [VaultController::class, 'store'] );
    } );
}
catch( Exception $e )
{
    dd( 'Error al registrar rutas vaults: ' . $e->getMessage());
}

//===========================================================================//
//  AUTENTICACIÓN                                                            //
//===========================================================================//

/**
 * POST /login
 * Inicia sesión de usuario.
 *
 * @see AuthController::login()
 * @middleware api, StartSession
 */
Route::post( '/login', [AuthController::class, 'login'] )->middleware( ['api', StartSession::class] );

/**
 * POST /register
 * Registra un nuevo usuario.
 *
 * @see AuthController::register()
 */
Route::post( '/register', [AuthController::class, 'register'] );

//===========================================================================//
//  GESTIÓN DE NOTAS Y CARPETAS                                              //
//===========================================================================//

/**
 * POST /addNote
 * Crea una nueva nota.
 *
 * @see NoteController::addNote()
 */
Route::post( '/addNote', [NoteController::class, 'addNote'] );

/**
 * POST /addFolder
 * Crea una nueva carpeta de notas.
 *
 * @see FolderNoteController::addFolder()
 */
Route::post( '/addFolder', [FolderNoteController::class, 'addFolder'] );

/**
 * POST /deleteFolder
 * Crea una nueva carpeta de notas.
 *
 * @see FolderNoteController::deleteFolder()
 */
Route::post( '/deleteFolder', [FolderNoteController::class, 'deleteFolder'] );

/**
 * GET /getNotes
 * Recupera todas las notas del usuario.
 *
 * @see NoteController::getNotes()
 */
Route::get( '/getNotes', [NoteController::class, 'getNotes'] );

/**
 * POST /deleteNote
 * Elimina una nota.
 *
 * @see NoteController::deleteNote()
 */
Route::post( '/deleteNote', [NoteController::class, 'deleteNote'] );

/**
 * POST /searchNotes
 * Busca notas por término o filtro.
 *
 * @see NoteController::searchNotes()
 */
Route::post( '/searchNotes', [NoteController::class, 'searchNotes'] );

/**
 * GET /readNote
 * Lee una nota concreta por su identificador.
 *
 * @see NoteController::readNote()
 */
Route::get( '/readNote', [NoteController::class, 'readNote'] );

/**
 * PATCH /notes/{note_id2}
 * Guarda los cambios de una nota.
 *
 * @see NoteController::saveNote()
 * @param string $note_id2
 */
Route::patch( '/notes/{note_id2}', [NoteController::class, 'saveNote'] );

/**
 * GET /galaxyGraph
 * Devuelve la estructura gráfica de las notas.
 *
 * @see NoteController::galaxyGraph()
 */
Route::get( '/galaxyGraph', [NoteController::class, 'galaxyGraph'] );

//===========================================================================//