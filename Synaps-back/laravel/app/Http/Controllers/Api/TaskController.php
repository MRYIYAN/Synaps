<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskTag;
use App\Services\TaskService;
use App\Helpers\AuthHelper;
use App\Helpers\DatabaseHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class TaskController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    /**
     * Listar tareas con filtros
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if($auth_result['error_response']) {
                throw new Exception('Usuario no autenticado');
            }
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect($user_id);

            // Validar parámetros
            $request->validate([
                'vault_id' => 'required|integer',
                'status' => 'sometimes|in:todo,in-progress,done',
                'priority' => 'sometimes|in:low,medium,high',
                'assigned_to' => 'sometimes|integer',
                'folder_id' => 'sometimes|integer',
                'search' => 'sometimes|string|max:255',
                'page' => 'sometimes|integer|min:1',
                'limit' => 'sometimes|integer|min:1|max:100'
            ]);

            $vault_id = $request->get('vault_id');
            $filters = $request->only(['status', 'priority', 'assigned_to', 'folder_id', 'search']);
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 15);

            // Usar conexión tenant
            Task::setConnectionName($user_db);
            TaskTag::setConnectionName($user_db);

            $tasks = $this->taskService->getPaginatedTasks($vault_id, $filters, $page, $limit);

            return response()->json([
                'result' => 1,
                'tasks' => $tasks->items(),
                'pagination' => [
                    'current_page' => $tasks->currentPage(),
                    'last_page' => $tasks->lastPage(),
                    'per_page' => $tasks->perPage(),
                    'total' => $tasks->total()
                ]
            ]);

        } catch (Exception $e) {
            Log::error('TASK_CONTROLLER: Error al listar tareas', [
                'error' => $e->getMessage(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al obtener las tareas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva tarea
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if($auth_result['error_response']) {
                throw new Exception('Usuario no autenticado');
            }
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect($user_id);

            // Validar datos
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'sometimes|string',
                'priority' => 'sometimes|in:low,medium,high',
                'vault_id' => 'required|integer',
                'folder_id' => 'sometimes|integer',
                'assigned_to' => 'sometimes|integer',
                'due_date' => 'sometimes|date',
                'tag_ids' => 'sometimes|array',
                'tag_ids.*' => 'integer'
            ]);

            // Usar conexión tenant
            Task::setConnectionName($user_db);
            TaskTag::setConnectionName($user_db);

            // Crear tarea (siempre en estado 'todo')
            $task = $this->taskService->createTask($validated, $user_id);

            return response()->json([
                'result' => 1,
                'message' => 'Tarea creada exitosamente',
                'task' => $task
            ], 201);

        } catch (Exception $e) {
            Log::error('TASK_CONTROLLER: Error al crear tarea', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al crear la tarea: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar tarea específica
     */
    public function show(Request $request, $task_id2): JsonResponse
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

            $task = Task::with(['tags', 'assignedUser', 'creator', 'comments.user', 'attachments', 'folder'])
                       ->where('task_id2', $task_id2)
                       ->first();

            if(!$task) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Tarea no encontrada'
                ], 404);
            }

            return response()->json([
                'result' => 1,
                'task' => $task
            ]);

        } catch (Exception $e) {
            Log::error('TASK_CONTROLLER: Error al obtener tarea', [
                'error' => $e->getMessage(),
                'task_id2' => $task_id2,
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al obtener la tarea: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar tarea
     */
    public function update(Request $request, $task_id2): JsonResponse
    {
        try {
            // Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if($auth_result['error_response']) {
                throw new Exception('Usuario no autenticado');
            }
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect($user_id);

            // Validar datos
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'status' => 'sometimes|in:todo,in-progress,done',
                'priority' => 'sometimes|in:low,medium,high',
                'folder_id' => 'sometimes|integer',
                'assigned_to' => 'sometimes|integer',
                'due_date' => 'sometimes|date|nullable',
                'tag_ids' => 'sometimes|array',
                'tag_ids.*' => 'integer'
            ]);

            // Usar conexión tenant
            Task::setConnectionName($user_db);
            TaskTag::setConnectionName($user_db);

            $task = Task::where('task_id2', $task_id2)->first();

            if(!$task) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Tarea no encontrada'
                ], 404);
            }

            $updatedTask = $this->taskService->updateTask($task, $validated, $user_id);

            return response()->json([
                'result' => 1,
                'message' => 'Tarea actualizada exitosamente',
                'task' => $updatedTask
            ]);

        } catch (Exception $e) {
            Log::error('TASK_CONTROLLER: Error al actualizar tarea', [
                'error' => $e->getMessage(),
                'task_id2' => $task_id2,
                'data' => $request->all(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al actualizar la tarea: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar tarea
     */
    public function destroy(Request $request, $task_id2): JsonResponse
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

            $task = Task::where('task_id2', $task_id2)->first();

            if(!$task) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Tarea no encontrada'
                ], 404);
            }

            $this->taskService->deleteTask($task, $user_id);

            return response()->json([
                'result' => 1,
                'message' => 'Tarea eliminada exitosamente'
            ]);

        } catch (Exception $e) {
            Log::error('TASK_CONTROLLER: Error al eliminar tarea', [
                'error' => $e->getMessage(),
                'task_id2' => $task_id2,
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al eliminar la tarea: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de tareas
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            // Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if($auth_result['error_response']) {
                throw new Exception('Usuario no autenticado');
            }
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect($user_id);

            $request->validate([
                'vault_id' => 'required|integer'
            ]);

            $vault_id = $request->get('vault_id');

            // Usar conexión tenant
            Task::setConnectionName($user_db);

            $stats = $this->taskService->getTaskStats($vault_id);

            return response()->json([
                'result' => 1,
                'stats' => $stats
            ]);

        } catch (Exception $e) {
            Log::error('TASK_CONTROLLER: Error al obtener estadísticas', [
                'error' => $e->getMessage(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualización masiva de estado
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
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
                'task_ids' => 'required|array|min:1',
                'task_ids.*' => 'integer',
                'status' => 'required|in:todo,in-progress,done'
            ]);

            // Usar conexión tenant
            Task::setConnectionName($user_db);

            $updated = $this->taskService->bulkUpdateStatus(
                $validated['task_ids'],
                $validated['status'],
                $user_id
            );

            return response()->json([
                'result' => 1,
                'message' => "{$updated} tareas actualizadas exitosamente",
                'updated_count' => $updated
            ]);

        } catch (Exception $e) {
            Log::error('TASK_CONTROLLER: Error en actualización masiva', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error en la actualización masiva: ' . $e->getMessage()
            ], 500);
        }
    }
}
