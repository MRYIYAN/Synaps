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
Route::get('/hello', function (Request $request): \Illuminate\Http\JsonResponse {
    return response()->json([
        'message' => 'Hola desde Laravel y Bienvenido a Synaps, el back esta funcionando',
    ]);
});

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

//===========================================================================//
//  AUTENTICACIÓN                                                            //
//===========================================================================//
/**
 * Maneja la autenticación de usuarios.
 *
 * @see AuthController::login()
 */
Route::post('/login', [AuthController::class, 'login'])->middleware(['api', StartSession::class]);
Route::post('/register', [AuthController::class, 'register']);

//===========================================================================//
//  GESTIÓN DE NOTAS Y CARPETAS                                              //
//===========================================================================//
/**
 * Maneja la creación de nuevas notas.
 *
 * @see NoteController::addNote()
 */
Route::post('/addNote', [NoteController::class, 'addNote']);
Route::post('/addFolder', [FolderNoteController::class, 'addFolder']);
Route::get('/getNotes', [NoteController::class, 'getNotes']);
Route::post('/searchNotes', [NoteController::class, 'searchNotes']);
Route::get('/readNote', [NoteController::class, 'readNote']);
Route::patch('/notes/{note_id2}', [NoteController::class, 'saveNote']);
Route::get('/galaxyGraph', [NoteController::class, 'galaxyGraph']);

//===========================================================================//
