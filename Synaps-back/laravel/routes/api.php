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

        /**
         * PUT /vaults/{id}
         * Actualiza un vault existente del usuario autenticado.
         *
         * @see VaultController::update()
         */
        Route::put( '/vaults/{id}', [VaultController::class, 'update'] );

        /**
         * POST /vaults/{id}/verify-pin
         * Verifica el PIN de un vault privado.
         *
         * @see VaultController::verifyPin()
         */
        Route::post( '/vaults/{id}/verify-pin', [VaultController::class, 'verifyPin'] );

        //=======================//
        // NOTES API            //
        //=======================//

        /**
         * GET /readNote
         * Lee una nota concreta por su identificador.
         *
         * @see NoteController::readNote()
         */
        Route::get( '/readNote', [NoteController::class, 'readNote'] );

        /**
         * POST /addNote
         * Crea una nueva nota.
         *
         * @see NoteController::addNote()
         */
        Route::post( '/addNote', [NoteController::class, 'addNote'] );

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
         * POST /renameNote
         * Renombra una nota existente.
         *
         * @see NoteController::renameNote()
         */
        Route::post( '/renameNote', [NoteController::class, 'renameNote'] );

        /**
         * POST /searchNotes
         * Busca notas por término o filtro.
         *
         * @see NoteController::searchNotes()
         */
        Route::post( '/searchNotes', [NoteController::class, 'searchNotes'] );

        /**
         * PATCH /notes/{note_id2}
         * Guarda los cambios de una nota.
         *
         * @see NoteController::saveNote()
         * @param string $note_id2
         */
        Route::patch( '/notes/{note_id2}', [NoteController::class, 'saveNote'] );

        /**
         * POST /uploadFile
         * Sube un archivo y crea una nota a partir de él.
         *
         * @see NoteController::uploadFile()
         */
        Route::post( '/uploadFile', [NoteController::class, 'uploadFile'] );

        /**
         * GET /galaxyGraph
         * Devuelve la estructura gráfica de las notas.
         *
         * @see NoteController::galaxyGraph()
         */
        Route::get( '/galaxyGraph', [NoteController::class, 'galaxyGraph'] );

        //=======================//
        // FOLDERS API          //
        //=======================//

        /**
         * POST /addFolder
         * Crea una nueva carpeta de notas.
         *
         * @see FolderNoteController::addFolder()
         */
        Route::post( '/addFolder', [FolderNoteController::class, 'addFolder'] );

        /**
         * GET /getFolders
         * Obtiene las carpetas de un vault específico.
         *
         * @see FolderNoteController::getFolders()
         */
        Route::get( '/getFolders', [FolderNoteController::class, 'getFolders'] );

        /**
         * POST /deleteFolder
         * Crea una nueva carpeta de notas.
         *
         * @see FolderNoteController::deleteFolder()
         */
        Route::post( '/deleteFolder', [FolderNoteController::class, 'deleteFolder'] );

        /**
         * POST /renameFolder
         * Renombra una carpeta existente.
         *
         * @see FolderNoteController::renameFolder()
         */
        Route::post( '/renameFolder', [FolderNoteController::class, 'renameFolder'] );

        //=======================//
        // USER API             //
        //=======================//

        /**
         * GET /user
         * Obtiene la información del usuario autenticado.
         *
         * @see UserController::getUser()
         */
        Route::get( '/user', [UserController::class, 'getUser'] );

        /**
         * PUT /user
         * Actualiza la información del usuario autenticado.
         *
         * @see UserController::updateUser()
         */
        Route::put( '/user', [UserController::class, 'updateUser'] );
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
//  AUTENTICACIÓN (RUTAS PÚBLICAS)                                          //
//===========================================================================//