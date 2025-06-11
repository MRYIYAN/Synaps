<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\TaskService;
use App\Helpers\AuthHelper;
use App\Helpers\DatabaseHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class TaskCommentController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    /**
     * Listar comentarios de una tarea
     */
    public function index(Request $request, $task_id2): JsonResponse
    {
        try {
            // Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if($auth_result['error_response']) {
                throw new Exception('Usuario no autenticado');
            }
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect($user_id);

            // Usar conexión tenant
            Task::setConnectionName($user_db);
            TaskComment::setConnectionName($user_db);

            // Verificar que la tarea existe
            $task = Task::where('task_id2', $task_id2)->first();
            if(!$task) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Tarea no encontrada'
                ], 404);
            }

            $comments = $this->taskService->getTaskComments($task->task_id);

            return response()->json([
                'result' => 1,
                'comments' => $comments
            ]);

        } catch (Exception $e) {
            Log::error('TASK_COMMENT_CONTROLLER: Error al listar comentarios', [
                'error' => $e->getMessage(),
                'task_id2' => $task_id2,
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al obtener los comentarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo comentario
     */
    public function store(Request $request, $task_id2): JsonResponse
    {
        try {
            // Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if($auth_result['error_response']) {
                throw new Exception('Usuario no autenticado');
            }
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect($user_id);

            $validated = $request->validate([
                'content' => 'required|string|max:2000'
            ]);

            // Usar conexión tenant
            Task::setConnectionName($user_db);
            TaskComment::setConnectionName($user_db);

            // Verificar que la tarea existe
            $task = Task::where('task_id2', $task_id2)->first();
            if(!$task) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Tarea no encontrada'
                ], 404);
            }

            $comment = $this->taskService->addComment(
                $task->task_id,
                $validated['content'],
                $user_id
            );

            // Cargar relación del usuario
            $comment->load('user');

            return response()->json([
                'result' => 1,
                'message' => 'Comentario añadido exitosamente',
                'comment' => $comment
            ], 201);

        } catch (Exception $e) {
            Log::error('TASK_COMMENT_CONTROLLER: Error al crear comentario', [
                'error' => $e->getMessage(),
                'task_id2' => $task_id2,
                'data' => $request->all(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al crear el comentario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar comentario
     */
    public function update(Request $request, $comment_id2): JsonResponse
    {
        try {
            // Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if($auth_result['error_response']) {
                throw new Exception('Usuario no autenticado');
            }
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect($user_id);

            $validated = $request->validate([
                'content' => 'required|string|max:2000'
            ]);

            // Usar conexión tenant
            TaskComment::setConnectionName($user_db);

            $comment = TaskComment::where('comment_id2', $comment_id2)->first();

            if(!$comment) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Comentario no encontrado'
                ], 404);
            }

            // Solo el autor puede editar su comentario
            if($comment->user_id !== $user_id) {
                return response()->json([
                    'result' => 0,
                    'message' => 'No tienes permisos para editar este comentario'
                ], 403);
            }

            $comment->update($validated);
            $comment->load('user');

            return response()->json([
                'result' => 1,
                'message' => 'Comentario actualizado exitosamente',
                'comment' => $comment
            ]);

        } catch (Exception $e) {
            Log::error('TASK_COMMENT_CONTROLLER: Error al actualizar comentario', [
                'error' => $e->getMessage(),
                'comment_id2' => $comment_id2,
                'data' => $request->all(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al actualizar el comentario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar comentario
     */
    public function destroy(Request $request, $comment_id2): JsonResponse
    {
        try {
            // Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if($auth_result['error_response']) {
                throw new Exception('Usuario no autenticado');
            }
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect($user_id);

            // Usar conexión tenant
            TaskComment::setConnectionName($user_db);

            $comment = TaskComment::where('comment_id2', $comment_id2)->first();

            if(!$comment) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Comentario no encontrado'
                ], 404);
            }

            // Solo el autor puede eliminar su comentario
            if($comment->user_id !== $user_id) {
                return response()->json([
                    'result' => 0,
                    'message' => 'No tienes permisos para eliminar este comentario'
                ], 403);
            }

            $comment->delete();

            return response()->json([
                'result' => 1,
                'message' => 'Comentario eliminado exitosamente'
            ]);

        } catch (Exception $e) {
            Log::error('TASK_COMMENT_CONTROLLER: Error al eliminar comentario', [
                'error' => $e->getMessage(),
                'comment_id2' => $comment_id2,
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al eliminar el comentario: ' . $e->getMessage()
            ], 500);
        }
    }
}
