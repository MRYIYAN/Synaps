<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\TaskTag;
use App\Models\TaskComment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class TaskService
{
    /**
     * Obtener tareas paginadas con filtros
     */
    public function getPaginatedTasks( $vaultId, $filters = [], $page = 1, $limit = 15 )
    {
        // Evitar eager loading de relaciones con usuarios para evitar problemas cross-database
        $query = Task::with(['tags', 'folder'])
                    ->byVault( $vaultId );

        // Aplicar filtros
        if( isset( $filters['status'] ) ) {
            $query->byStatus( $filters['status'] );
        }

        if( isset( $filters['assigned_to'] ) ) {
            $query->assignedTo( $filters['assigned_to'] );
        }

        if( isset( $filters['priority'] ) ) {
            $query->where( 'priority', $filters['priority'] );
        }

        if( isset( $filters['folder_id'] ) ) {
            $query->where( 'folder_id', $filters['folder_id'] );
        }

        if( isset( $filters['search'] ) ) {
            $search = $filters['search'];
            $query->where( function( $q ) use ( $search ) {
                $q->where( 'title', 'LIKE', "%{$search}%" )
                  ->orWhere( 'description', 'LIKE', "%{$search}%" );
            });
        }

        return $query->orderBy( 'created_at', 'desc' )
                    ->paginate( $limit, ['*'], 'page', $page );
    }

    /**
     * Crear una nueva tarea
     */
    public function createTask( array $data, int $userId )
    {
        return DB::transaction( function () use ( $data, $userId ) {
            // Asegurar que siempre se cree en estado 'todo'
            $data['status'] = 'todo';
            $data['created_by'] = $userId;

            $task = Task::create( $data );

            // Asignar etiquetas si se proporcionan
            if( isset( $data['tag_ids'] ) && is_array( $data['tag_ids'] ) ) {
                $task->tags()->sync( $data['tag_ids'] );
            }

            return $task->load(['tags']); // Evitar cargar relaciones de usuario
        });
    }

    /**
     * Actualizar una tarea existente
     */
    public function updateTask( Task $task, array $data, int $userId )
    {
        return DB::transaction( function () use ( $task, $data, $userId ) {
            $oldValues = $task->toArray();
            
            // Actualizar campos básicos
            $task->update( $data );
            $task->refresh();

            // Actualizar etiquetas si se proporcionan
            if( isset( $data['tag_ids'] ) && is_array( $data['tag_ids'] ) ) {
                $task->tags()->sync( $data['tag_ids'] );
            }

            return $task->load(['tags']); // Evitar cargar relaciones de usuario
        });
    }

    /**
     * Eliminar una tarea (soft delete)
     */
    public function deleteTask( Task $task, int $userId )
    {
        return DB::transaction( function () use ( $task, $userId ) {
            // Verificar estado antes de eliminar
            if( $task->trashed() ) {
                throw new Exception( 'La tarea ya ha sido eliminada' );
            }

            $task->delete();
            
            // Asegurar que TaskHistory use la misma conexión
            if( $task->getConnectionName() ) {
                TaskHistory::setConnectionName( $task->getConnectionName() );
            }
            
            TaskHistory::create([
                'task_id' => $task->task_id,
                'user_id' => $userId,
                'action' => 'deleted'
            ]);

            return true;
        });
    }

    /**
     * Actualización masiva de estado
     */
    public function bulkUpdateStatus( array $taskIds, string $status, int $userId )
    {
        return DB::transaction( function () use ( $taskIds, $status, $userId ) {
            $updated = Task::whereIn( 'task_id', $taskIds )->update([
                'status' => $status,
                'completed_at' => $status === 'done' ? now() : null
            ]);

            // Registrar en historial para cada tarea
            foreach( $taskIds as $taskId ) {
                TaskHistory::create([
                    'task_id' => $taskId,
                    'user_id' => $userId,
                    'action' => 'status_changed',
                    'field_changed' => 'status',
                    'new_value' => $status
                ]);
            }

            return $updated;
        });
    }

    /**
     * Obtener estadísticas de tareas por vault
     */
    public function getTaskStats( $vaultId )
    {
        $stats = Task::byVault( $vaultId )
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "todo" THEN 1 ELSE 0 END) as todo,
                SUM(CASE WHEN status = "in-progress" THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = "done" THEN 1 ELSE 0 END) as done,
                SUM(CASE WHEN due_date < NOW() AND status != "done" THEN 1 ELSE 0 END) as overdue,
                SUM(CASE WHEN priority = "high" THEN 1 ELSE 0 END) as high_priority
            ')
            ->first();

        return [
            'total' => $stats->total ?? 0,
            'todo' => $stats->todo ?? 0,
            'in_progress' => $stats->in_progress ?? 0,
            'done' => $stats->done ?? 0,
            'overdue' => $stats->overdue ?? 0,
            'high_priority' => $stats->high_priority ?? 0,
            'completion_rate' => $stats->total > 0 ? round( ( $stats->done / $stats->total ) * 100, 2 ) : 0
        ];
    }

    /**
     * Obtener tareas por estado específico
     */
    public function getTasksByStatus( $vaultId, $status )
    {
        return Task::byVault( $vaultId )
            ->byStatus( $status )
            ->with(['tags', 'assignedUser', 'creator'])
            ->orderBy( 'created_at', 'desc' )
            ->get();
    }

    /**
     * Buscar tareas
     */
    public function searchTasks( $vaultId, $query, $filters = [] )
    {
        $search = Task::byVault( $vaultId )
            ->where( function( $q ) use ( $query ) {
                $q->where( 'title', 'LIKE', "%{$query}%" )
                  ->orWhere( 'description', 'LIKE', "%{$query}%" );
            });

        // Aplicar filtros adicionales
        if( isset( $filters['status'] ) ) {
            $search->byStatus( $filters['status'] );
        }

        if( isset( $filters['priority'] ) ) {
            $search->where( 'priority', $filters['priority'] );
        }

        return $search->with(['tags', 'assignedUser', 'creator'])
                     ->orderBy( 'created_at', 'desc' )
                     ->get();
    }

    /**
     * Crear etiqueta
     */
    public function createTag( array $data, $vaultId )
    {
        $data['vault_id'] = $vaultId;
        
        return TaskTag::create( $data );
    }

    /**
     * Obtener etiquetas por vault
     */
    public function getTagsByVault( $vaultId )
    {
        return TaskTag::byVault( $vaultId )
            ->orderBy( 'name' )
            ->get();
    }

    /**
     * Añadir comentario a una tarea
     */
    public function addComment( $taskId, $content, $userId )
    {
        return TaskComment::create([
            'task_id' => $taskId,
            'user_id' => $userId,
            'content' => $content
        ]);
    }

    /**
     * Obtener comentarios de una tarea
     */
    public function getTaskComments( $taskId )
    {
        return TaskComment::where( 'task_id', $taskId )
            ->with( 'user' )
            ->orderBy( 'created_at', 'asc' )
            ->get();
    }
}
