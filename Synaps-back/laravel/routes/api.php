<?php

//===========================================================================//
//                                RUTAS DE LA API                            //
//===========================================================================//

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VaultController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskTagController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FolderNoteController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\DiagnosticController;
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

        /**
         * GET /loginCheck
         * Recupera el estado del login
         *
         * @see AuthController::loginCheck()
         */
        Route::get( '/loginCheck', [AuthController::class, 'loginCheck'] );

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

        /**
         * POST /saveMarkdown
         * Guarda el contenido Markdown de una nota.
         *
         * @see NoteController::saveMarkdown()
         */
        Route::post( '/saveMarkdown', [NoteController::class, 'saveMarkdown'] );

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

        /**
         * GET /user/first-login
         * Verifica si es el primer login del usuario y actualiza el estado.
         *
         * @see UserController::checkFirstLogin()
         */
        Route::get( '/user/first-login', [UserController::class, 'checkFirstLogin'] );

        /**
         * GET /user/profile
         * Obtiene el perfil completo del usuario autenticado.
         *
         * @see AuthController::getUserProfile()
         */
        Route::get( '/user/profile', [AuthController::class, 'getUserProfile'] );

        /**
         * PUT /user/profile
         * Actualiza el perfil del usuario autenticado.
         *
         * @see AuthController::updateUserProfile()
         */
        Route::put( '/user/profile', [AuthController::class, 'updateUserProfile'] );

        //-----------------------------------------------------------------------//
        //                           SISTEMA DE TAREAS                           //
        //-----------------------------------------------------------------------//
        
        /**
         * GET /tasks
         * Listar tareas con filtros y paginación
         * Parámetros: vault_id, status, priority, assigned_to, folder_id, search, page, limit
         */
        Route::get( '/tasks', [TaskController::class, 'index'] );
        
        /**
         * POST /tasks
         * Crear nueva tarea (automáticamente en estado 'todo')
         * Body: title, description, priority, vault_id, folder_id, assigned_to, due_date, tag_ids
         */
        Route::post( '/tasks', [TaskController::class, 'store'] );
        
        /**
         * GET /tasks/{task_id2}
         * Obtener tarea específica con todos sus detalles
         */
        Route::get( '/tasks/{task_id2}', [TaskController::class, 'show'] );
        
        /**
         * PUT /tasks/{task_id2}
         * Actualizar tarea completa
         * Body: title, description, status, priority, folder_id, assigned_to, due_date, tag_ids
         */
        Route::put( '/tasks/{task_id2}', [TaskController::class, 'update'] );
        
        /**
         * DELETE /tasks/{task_id2}
         * Eliminar tarea (soft delete)
         */
        Route::delete( '/tasks/{task_id2}', [TaskController::class, 'destroy'] );
        
        /**
         * GET /tasks/stats
         * Obtener estadísticas de tareas por vault
         * Parámetros: vault_id
         */
        Route::get( '/tasks/stats', [TaskController::class, 'stats'] );
        
        /**
         * POST /tasks/bulk/update-status
         * Actualización masiva de estado de tareas
         * Body: task_ids[], status
         */
        Route::post( '/tasks/bulk/update-status', [TaskController::class, 'bulkUpdateStatus'] );
        
        //-----------------------------------------------------------------------//
        //                           ETIQUETAS DE TAREAS                         //
        //-----------------------------------------------------------------------//
        
        /**
         * GET /task-tags
         * Listar etiquetas del vault
         * Parámetros: vault_id
         */
        Route::get( '/task-tags', [TaskTagController::class, 'index'] );
        
        /**
         * POST /task-tags
         * Crear nueva etiqueta
         * Body: name, color, vault_id
         */
        Route::post( '/task-tags', [TaskTagController::class, 'store'] );
        
        /**
         * PUT /task-tags/{tag_id2}
         * Actualizar etiqueta
         * Body: name, color
         */
        Route::put( '/task-tags/{tag_id2}', [TaskTagController::class, 'update'] );
        
        /**
         * DELETE /task-tags/{tag_id2}
         * Eliminar etiqueta
         */
        Route::delete( '/task-tags/{tag_id2}', [TaskTagController::class, 'destroy'] );
        
        //-----------------------------------------------------------------------//
        //                         COMENTARIOS EN TAREAS                         //
        //-----------------------------------------------------------------------//
        
        /**
         * GET /tasks/{task_id2}/comments
         * Listar comentarios de una tarea
         */
        Route::get( '/tasks/{task_id2}/comments', [TaskCommentController::class, 'index'] );
        
        /**
         * POST /tasks/{task_id2}/comments
         * Crear nuevo comentario en una tarea
         * Body: content
         */
        Route::post( '/tasks/{task_id2}/comments', [TaskCommentController::class, 'store'] );
        
        /**
         * PUT /task-comments/{comment_id2}
         * Actualizar comentario (solo el autor)
         * Body: content
         */
        Route::put( '/task-comments/{comment_id2}', [TaskCommentController::class, 'update'] );
        
        /**
         * DELETE /task-comments/{comment_id2}
         * Eliminar comentario (solo el autor)
         */
        Route::delete( '/task-comments/{comment_id2}', [TaskCommentController::class, 'destroy'] );

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
