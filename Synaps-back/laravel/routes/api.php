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
 * Devuelve un mensaje de bienvenida desde el backend.
 *
 * @param Request $request La solicitud HTTP.
 * @return \Illuminate\Http\JsonResponse Respuesta JSON con el mensaje de bienvenida.
 */
Route::get( '/hello', function (Request $request): \Illuminate\Http\JsonResponse {
    return response()->json( [
        'message' => 'Hola desde Laravel y Bienvenido a Synaps, el back esta funcionando',
    ] );
} );

<<<<<<< HEAD
//===========================================================================//
//  RUTAS PROTEGIDAS POR BEARER TOKEN                                        //
//===========================================================================//
try {
    Route::middleware(['auth.bearer'])->group(function () {
        //=======================//
        // VAULTS API           //
        //=======================//
        Route::get('/vaults', [VaultController::class, 'index']);
        Route::post('/vaults', [VaultController::class, 'store']);
    });
} catch (\Throwable $e) {
    dd(' Error al registrar rutas vaults: ' . $e->getMessage());
}
=======
//---------------------------------------------------------------------------//
//  Rutas protegidas con el middleware auth.bearer                           //
//---------------------------------------------------------------------------//

Route::middleware( ['auth.bearer'] )->group(function () {
    Route::get( '/api/login-check', [AuthController::class, 'loginCheck'] );
} );

//---------------------------------------------------------------------------//
//  Ruta para la autenticación de usuarios.                                  //
//---------------------------------------------------------------------------//
>>>>>>> 9c98304 ([FEATURE] GVista de Galaxia conectada con la DB)

//===========================================================================//
//  AUTENTICACIÓN                                                            //
//===========================================================================//
/**
 * Maneja la autenticación de usuarios.
 *
 * @see AuthController::login()
 */
<<<<<<< HEAD
Route::post('/login', [AuthController::class, 'login'])->middleware(['api', StartSession::class]);
Route::post('/register', [AuthController::class, 'register']);
=======
Route::post( '/login', [AuthController::class, 'login'] )
    ->middleware( ['api', StartSession::class] );

/**
 * Maneja el registro de nuevos usuarios.
 *
 * @see AuthController::register()
 */
Route::post( '/register', [AuthController::class, 'register'] );
>>>>>>> 9c98304 ([FEATURE] GVista de Galaxia conectada con la DB)

//===========================================================================//
//  GESTIÓN DE NOTAS Y CARPETAS                                              //
//===========================================================================//
/**
 * Maneja la creación de nuevas notas.
 *
 * @see NoteController::addNote()
 */
<<<<<<< HEAD
Route::post('/addNote', [NoteController::class, 'addNote']);
Route::post('/addFolder', [FolderNoteController::class, 'addFolder']);
Route::get('/getNotes', [NoteController::class, 'getNotes']);
Route::post('/searchNotes', [NoteController::class, 'searchNotes']);
Route::get('/readNote', [NoteController::class, 'readNote']);
Route::patch('/notes/{note_id2}', [NoteController::class, 'saveNote']);
Route::get('/galaxyGraph', [NoteController::class, 'galaxyGraph']);

//===========================================================================//
=======
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

/**
 * Actualización por Redis de la nota.
 *
 * @see NoteController::saveNote()
 */
Route::patch( '/notes/{note_id2}', [NoteController::class, 'saveNote'] );

/**
 * Datos de la Vista de Galaxia.
 *
 * @see NoteController::galaxyGraph()
 */
Route::get( '/galaxyGraph', [NoteController::class, 'galaxyGraph'] );


Route::post( '/vaults', [VaultController::class, 'store'] );
Route::get( '/vaults', [VaultController::class, 'index'] );
>>>>>>> 9c98304 ([FEATURE] GVista de Galaxia conectada con la DB)
