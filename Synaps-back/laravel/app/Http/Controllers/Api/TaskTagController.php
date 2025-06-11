<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskTag;
use App\Services\TaskService;
use App\Helpers\AuthHelper;
use App\Helpers\DatabaseHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class TaskTagController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    /**
     * Listar etiquetas del vault
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

            $request->validate([
                'vault_id' => 'required|integer'
            ]);

            $vault_id = $request->get('vault_id');

            // Usar conexión tenant
            TaskTag::setConnectionName($user_db);

            $tags = $this->taskService->getTagsByVault($vault_id);

            return response()->json([
                'result' => 1,
                'tags' => $tags
            ]);

        } catch (Exception $e) {
            Log::error('TASK_TAG_CONTROLLER: Error al listar etiquetas', [
                'error' => $e->getMessage(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al obtener las etiquetas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva etiqueta
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

            $validated = $request->validate([
                'name' => 'required|string|max:50',
                'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
                'vault_id' => 'required|integer'
            ]);

            // Usar conexión tenant
            TaskTag::setConnectionName($user_db);

            // Verificar que no exista una etiqueta con el mismo nombre en el vault
            $existingTag = TaskTag::where('name', $validated['name'])
                                 ->where('vault_id', $validated['vault_id'])
                                 ->first();

            if($existingTag) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Ya existe una etiqueta con ese nombre en este vault'
                ], 409);
            }

            $tag = $this->taskService->createTag($validated, $validated['vault_id']);

            return response()->json([
                'result' => 1,
                'message' => 'Etiqueta creada exitosamente',
                'tag' => $tag
            ], 201);

        } catch (Exception $e) {
            Log::error('TASK_TAG_CONTROLLER: Error al crear etiqueta', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al crear la etiqueta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar etiqueta
     */
    public function update(Request $request, $tag_id2): JsonResponse
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
                'name' => 'sometimes|string|max:50',
                'color' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/'
            ]);

            // Usar conexión tenant
            TaskTag::setConnectionName($user_db);

            $tag = TaskTag::where('tag_id2', $tag_id2)->first();

            if(!$tag) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Etiqueta no encontrada'
                ], 404);
            }

            // Verificar unicidad del nombre si se está actualizando
            if(isset($validated['name']) && $validated['name'] !== $tag->name) {
                $existingTag = TaskTag::where('name', $validated['name'])
                                     ->where('vault_id', $tag->vault_id)
                                     ->where('tag_id', '!=', $tag->tag_id)
                                     ->first();

                if($existingTag) {
                    return response()->json([
                        'result' => 0,
                        'message' => 'Ya existe una etiqueta con ese nombre en este vault'
                    ], 409);
                }
            }

            $tag->update($validated);

            return response()->json([
                'result' => 1,
                'message' => 'Etiqueta actualizada exitosamente',
                'tag' => $tag
            ]);

        } catch (Exception $e) {
            Log::error('TASK_TAG_CONTROLLER: Error al actualizar etiqueta', [
                'error' => $e->getMessage(),
                'tag_id2' => $tag_id2,
                'data' => $request->all(),
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al actualizar la etiqueta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar etiqueta
     */
    public function destroy(Request $request, $tag_id2): JsonResponse
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
            TaskTag::setConnectionName($user_db);

            $tag = TaskTag::where('tag_id2', $tag_id2)->first();

            if(!$tag) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Etiqueta no encontrada'
                ], 404);
            }

            // Eliminar relaciones con tareas antes de eliminar la etiqueta
            $tag->tasks()->detach();
            $tag->delete();

            return response()->json([
                'result' => 1,
                'message' => 'Etiqueta eliminada exitosamente'
            ]);

        } catch (Exception $e) {
            Log::error('TASK_TAG_CONTROLLER: Error al eliminar etiqueta', [
                'error' => $e->getMessage(),
                'tag_id2' => $tag_id2,
                'user_id' => $user_id ?? null
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error al eliminar la etiqueta: ' . $e->getMessage()
            ], 500);
        }
    }
}
