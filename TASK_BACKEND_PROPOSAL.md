# Sistema de Gestión de Tareas - Propuesta Backend
## Análisis del Modelo de Datos Actual y Diseño Extendido

### 📋 Tabla de Contenidos
1. [Análisis del Modelo Actual](#análisis-del-modelo-actual)
2. [Diseño de Base de Datos para Tareas](#diseño-de-base-de-datos-para-tareas)
3. [Arquitectura del Backend](#arquitectura-del-backend)
4. [API REST Endpoints](#api-rest-endpoints)
5. [Implementación con Laravel](#implementación-con-laravel)
6. [Seguridad y Autenticación](#seguridad-y-autenticación)
7. [Escalabilidad y Performance](#escalabilidad-y-performance)

---

## 🔍 Análisis del Modelo Actual

### Estructura Identificada en `init.sql`

#### Base de Datos Principal (`synaps`)
```sql
-- Gestión de usuarios
users (user_id, user_id2, user_email, user_name, user_password)
note_shares (owner_id, note_id, user_id)
```

#### Base de Datos por Cliente (`synaps_0001`)
```sql
-- Sistema de notas y documentos
vaults (vault_id, vault_id2, vault_title, user_id, logical_path, is_private, created_at)
folders_notes (folder_id, folder_id2, folder_title, vault_id, parent_id, children_count)
notes (note_id, note_id2, parent_id, note_title, note_markdown, vault_id, insert_date, last_update_date)
docs (doc_id, doc_id2, doc_name, insert_date)
notifications (notification_id, notification_id2, notification_message, insert_date)
log (log_id, log_id2, log_message, insert_date)
```

### 🎯 Observaciones Clave
- **Arquitectura Multi-tenant**: Base separada por cliente
- **Doble ID**: Patrón de ID numérico + ID string (seguridad)
- **Sistema de Vaults**: Organización jerárquica de contenido
- **Markdown nativo**: Las notas usan formato Markdown
- **Auditoría**: Fechas de creación y modificación

---

## 🗄️ Diseño de Base de Datos para Tareas

### Nuevas Tablas Propuestas

#### 1. Tabla `tasks` (Principal)
```sql
CREATE TABLE `tasks` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id2` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo', 'in-progress', 'done') NOT NULL DEFAULT 'todo',
  `priority` enum('low', 'medium', 'high') DEFAULT 'medium',
  `vault_id` int(11) NOT NULL,
  `folder_id` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `due_date` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  UNIQUE KEY `task_id2` (`task_id2`),
  KEY `idx_vault_status` (`vault_id`, `status`),
  KEY `idx_assigned_status` (`assigned_to`, `status`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`vault_id`) ON DELETE CASCADE,
  FOREIGN KEY (`folder_id`) REFERENCES `folders_notes`(`folder_id`) ON DELETE SET NULL,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`user_id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
```

#### 2. Tabla `task_tags` (Etiquetas)
```sql
CREATE TABLE `task_tags` (
  `tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_id2` varchar(32) NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(7) DEFAULT '#F56E0F',
  `vault_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_id2` (`tag_id2`),
  UNIQUE KEY `unique_tag_vault` (`name`, `vault_id`),
  FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`vault_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
```

#### 3. Tabla `task_tag_relations` (Relación muchos a muchos)
```sql
CREATE TABLE `task_tag_relations` (
  `task_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`, `tag_id`),
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `task_tags`(`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
```

#### 4. Tabla `task_comments` (Comentarios)
```sql
CREATE TABLE `task_comments` (
  `comment_id` int(11) NOT NULL AUTO_INCREMENT,
  `comment_id2` varchar(32) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  UNIQUE KEY `comment_id2` (`comment_id2`),
  KEY `idx_task_created` (`task_id`, `created_at`),
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
```

#### 5. Tabla `task_attachments` (Archivos adjuntos)
```sql
CREATE TABLE `task_attachments` (
  `attachment_id` int(11) NOT NULL AUTO_INCREMENT,
  `attachment_id2` varchar(32) NOT NULL,
  `task_id` int(11) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `stored_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  UNIQUE KEY `attachment_id2` (`attachment_id2`),
  KEY `idx_task_id` (`task_id`),
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
```

#### 6. Tabla `task_history` (Auditoría de cambios)
```sql
CREATE TABLE `task_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` enum('created', 'updated', 'status_changed', 'assigned', 'commented', 'deleted') NOT NULL,
  `field_changed` varchar(50) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_task_created` (`task_id`, `created_at`),
  KEY `idx_user_action` (`user_id`, `action`),
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
```

---

## 🏗️ Arquitectura del Backend

### Stack Tecnológico Propuesto
- **Framework**: Laravel 10.x
- **Base de Datos**: MariaDB (ya implementado)
- **Cache**: Redis (ya disponible en docker-compose)
- **Autenticación**: Keycloak (ya integrado)
- **Storage**: Local/S3 compatible
- **Queue**: Redis + Laravel Horizon
- **API**: RESTful + Real-time WebSockets

### Estructura de Directorios Laravel
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── TaskController.php
│   │   │   ├── TaskTagController.php
│   │   │   ├── TaskCommentController.php
│   │   │   └── TaskAttachmentController.php
│   │   └── TaskWebController.php
│   ├── Requests/
│   │   ├── StoreTaskRequest.php
│   │   ├── UpdateTaskRequest.php
│   │   └── BulkUpdateTaskRequest.php
│   ├── Resources/
│   │   ├── TaskResource.php
│   │   ├── TaskCollection.php
│   │   └── TaskDetailResource.php
│   └── Middleware/
│       ├── VaultAccess.php
│       └── TaskOwnership.php
├── Models/
│   ├── Task.php
│   ├── TaskTag.php
│   ├── TaskComment.php
│   ├── TaskAttachment.php
│   └── TaskHistory.php
├── Services/
│   ├── TaskService.php
│   ├── TaskNotificationService.php
│   └── TaskAnalyticsService.php
├── Observers/
│   └── TaskObserver.php
├── Events/
│   ├── TaskCreated.php
│   ├── TaskUpdated.php
│   └── TaskStatusChanged.php
├── Listeners/
│   ├── SendTaskNotification.php
│   └── LogTaskActivity.php
└── Jobs/
    ├── ProcessTaskReminder.php
    └── GenerateTaskReport.php
```

---

## 🔌 API REST Endpoints

### Autenticación
Todas las rutas requieren autenticación JWT via Keycloak.

### Base URL: `/api/v1/tasks`

#### 📋 Gestión de Tareas

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/` | Listar tareas | `vault_id`, `status`, `assigned_to`, `page`, `limit` |
| `POST` | `/` | Crear tarea | `title`, `description`, `status`, `priority`, `vault_id` |
| `GET` | `/{taskId}` | Obtener tarea específica | - |
| `PUT` | `/{taskId}` | Actualizar tarea completa | `title`, `description`, `status`, `priority` |
| `PATCH` | `/{taskId}` | Actualización parcial | Campos a actualizar |
| `DELETE` | `/{taskId}` | Eliminar tarea (soft delete) | - |
| `POST` | `/{taskId}/restore` | Restaurar tarea eliminada | - |

#### 📊 Operaciones en Lote
| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/bulk/update-status` | Cambiar estado múltiples tareas | `task_ids[]`, `status` |
| `POST` | `/bulk/assign` | Asignar múltiples tareas | `task_ids[]`, `assigned_to` |
| `POST` | `/bulk/delete` | Eliminar múltiples tareas | `task_ids[]` |

#### 🏷️ Gestión de Etiquetas
| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/tags` | Listar etiquetas | `vault_id` |
| `POST` | `/tags` | Crear etiqueta | `name`, `color`, `vault_id` |
| `PUT` | `/tags/{tagId}` | Actualizar etiqueta | `name`, `color` |
| `DELETE` | `/tags/{tagId}` | Eliminar etiqueta | - |
| `POST` | `/{taskId}/tags` | Asignar etiquetas a tarea | `tag_ids[]` |
| `DELETE` | `/{taskId}/tags/{tagId}` | Quitar etiqueta de tarea | - |

#### 💬 Gestión de Comentarios
| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/{taskId}/comments` | Listar comentarios | - |
| `POST` | `/{taskId}/comments` | Crear comentario | `content` |
| `PUT` | `/comments/{commentId}` | Actualizar comentario | `content` |
| `DELETE` | `/comments/{commentId}` | Eliminar comentario | - |

#### 📎 Gestión de Archivos
| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/{taskId}/attachments` | Listar archivos adjuntos | - |
| `POST` | `/{taskId}/attachments` | Subir archivo | `file` (multipart) |
| `GET` | `/attachments/{attachmentId}` | Descargar archivo | - |
| `DELETE` | `/attachments/{attachmentId}` | Eliminar archivo | - |

#### 📈 Analytics y Reportes
| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/analytics/summary` | Resumen de tareas | `vault_id`, `date_from`, `date_to` |
| `GET` | `/analytics/productivity` | Métricas de productividad | `user_id`, `period` |
| `GET` | `/analytics/overdue` | Tareas vencidas | `vault_id` |

---

## ⚙️ Implementación con Laravel

### 1. Modelo Task Principal

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'task_id2',
        'title',
        'description',
        'status',
        'priority',
        'vault_id',
        'folder_id',
        'assigned_to',
        'created_by',
        'due_date',
        'completed_at'
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $dates = ['deleted_at'];

    // Relaciones
    public function vault()
    {
        return $this->belongsTo(Vault::class, 'vault_id');
    }

    public function folder()
    {
        return $this->belongsTo(FolderNote::class, 'folder_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tags()
    {
        return $this->belongsToMany(TaskTag::class, 'task_tag_relations');
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class)->whereNull('deleted_at');
    }

    public function attachments()
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function history()
    {
        return $this->hasMany(TaskHistory::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByVault($query, $vaultId)
    {
        return $query->where('vault_id', $vaultId);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                    ->whereNotIn('status', ['done']);
    }

    // Métodos auxiliares
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'done',
            'completed_at' => now()
        ]);
    }

    public function isOverdue()
    {
        return $this->due_date && 
               $this->due_date < now() && 
               $this->status !== 'done';
    }

    // Boot method para eventos
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($task) {
            $task->task_id2 = self::generateUniqueId();
        });
    }

    private static function generateUniqueId()
    {
        return bin2hex(random_bytes(16));
    }
}
```

### 2. Controlador API

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Http\Resources\TaskCollection;
use App\Services\TaskService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    /**
     * Display a listing of tasks
     */
    public function index(Request $request)
    {
        $tasks = $this->taskService->getPaginatedTasks(
            $request->get('vault_id'),
            $request->only(['status', 'assigned_to', 'priority']),
            $request->get('page', 1),
            $request->get('limit', 15)
        );

        return new TaskCollection($tasks);
    }

    /**
     * Store a newly created task
     */
    public function store(StoreTaskRequest $request)
    {
        $task = $this->taskService->createTask(
            $request->validated(),
            auth()->id()
        );

        return new TaskResource($task);
    }

    /**
     * Display the specified task
     */
    public function show(Task $task)
    {
        $this->authorize('view', $task);
        
        return new TaskResource($task->load([
            'tags', 'comments.user', 'attachments', 'assignedUser'
        ]));
    }

    /**
     * Update the specified task
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->authorize('update', $task);

        $updatedTask = $this->taskService->updateTask(
            $task,
            $request->validated(),
            auth()->id()
        );

        return new TaskResource($updatedTask);
    }

    /**
     * Remove the specified task
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $this->taskService->deleteTask($task, auth()->id());

        return response()->json(['message' => 'Task deleted successfully']);
    }

    /**
     * Bulk update tasks status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'task_ids' => 'required|array|min:1',
            'task_ids.*' => 'exists:tasks,id',
            'status' => 'required|in:todo,in-progress,done'
        ]);

        $updated = $this->taskService->bulkUpdateStatus(
            $request->task_ids,
            $request->status,
            auth()->id()
        );

        return response()->json([
            'message' => "{$updated} tasks updated successfully",
            'updated_count' => $updated
        ]);
    }
}
```

### 3. Servicio de Tareas

```php
<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskHistory;
use App\Events\TaskCreated;
use App\Events\TaskUpdated;
use App\Events\TaskStatusChanged;
use Illuminate\Support\Facades\DB;

class TaskService
{
    /**
     * Get paginated tasks with filters
     */
    public function getPaginatedTasks($vaultId, $filters = [], $page = 1, $limit = 15)
    {
        $query = Task::with(['tags', 'assignedUser', 'creator'])
                    ->byVault($vaultId);

        // Apply filters
        if (isset($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (isset($filters['assigned_to'])) {
            $query->assignedTo($filters['assigned_to']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        return $query->orderBy('created_at', 'desc')
                    ->paginate($limit, ['*'], 'page', $page);
    }

    /**
     * Create a new task
     */
    public function createTask(array $data, int $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            $task = Task::create([
                ...$data,
                'created_by' => $userId
            ]);

            // Log creation
            $this->logTaskActivity($task->id, $userId, 'created');

            // Fire event
            event(new TaskCreated($task));

            return $task;
        });
    }

    /**
     * Update an existing task
     */
    public function updateTask(Task $task, array $data, int $userId)
    {
        return DB::transaction(function () use ($task, $data, $userId) {
            $oldValues = $task->toArray();
            
            $task->update($data);
            $task->refresh();

            // Log changes
            foreach ($data as $field => $newValue) {
                if (isset($oldValues[$field]) && $oldValues[$field] !== $newValue) {
                    $this->logTaskActivity(
                        $task->id,
                        $userId,
                        'updated',
                        $field,
                        $oldValues[$field],
                        $newValue
                    );
                }
            }

            // Fire events
            event(new TaskUpdated($task));
            
            if (isset($data['status']) && $data['status'] !== $oldValues['status']) {
                event(new TaskStatusChanged($task, $oldValues['status'], $data['status']));
            }

            return $task;
        });
    }

    /**
     * Soft delete a task
     */
    public function deleteTask(Task $task, int $userId)
    {
        return DB::transaction(function () use ($task, $userId) {
            $task->delete();
            
            $this->logTaskActivity($task->id, $userId, 'deleted');
        });
    }

    /**
     * Bulk update task status
     */
    public function bulkUpdateStatus(array $taskIds, string $status, int $userId)
    {
        return DB::transaction(function () use ($taskIds, $status, $userId) {
            $updated = Task::whereIn('id', $taskIds)->update([
                'status' => $status,
                'completed_at' => $status === 'done' ? now() : null
            ]);

            // Log bulk action
            foreach ($taskIds as $taskId) {
                $this->logTaskActivity($taskId, $userId, 'status_changed', 'status', null, $status);
            }

            return $updated;
        });
    }

    /**
     * Log task activity for audit trail
     */
    private function logTaskActivity(int $taskId, int $userId, string $action, string $field = null, $oldValue = null, $newValue = null)
    {
        TaskHistory::create([
            'task_id' => $taskId,
            'user_id' => $userId,
            'action' => $action,
            'field_changed' => $field,
            'old_value' => $oldValue,
            'new_value' => $newValue
        ]);
    }
}
```

---

## 🔒 Seguridad y Autenticación

### Middleware de Autorización

```php
<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Vault;

class VaultAccess
{
    public function handle($request, Closure $next)
    {
        $vaultId = $request->route('vault_id') ?? $request->input('vault_id');
        
        if (!$vaultId) {
            return response()->json(['error' => 'Vault ID required'], 400);
        }

        $vault = Vault::find($vaultId);
        
        if (!$vault) {
            return response()->json(['error' => 'Vault not found'], 404);
        }

        // Check if user has access to this vault
        if (!$this->userHasVaultAccess(auth()->id(), $vault)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $next($request);
    }

    private function userHasVaultAccess($userId, $vault)
    {
        // Check if user owns the vault or has shared access
        return $vault->user_id === $userId || 
               $vault->sharedUsers()->where('user_id', $userId)->exists();
    }
}
```

### Políticas de Autorización

```php
<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function view(User $user, Task $task)
    {
        return $this->hasVaultAccess($user, $task);
    }

    public function update(User $user, Task $task)
    {
        return $this->hasVaultAccess($user, $task) && 
               ($task->created_by === $user->id || $task->assigned_to === $user->id);
    }

    public function delete(User $user, Task $task)
    {
        return $task->created_by === $user->id;
    }

    private function hasVaultAccess(User $user, Task $task)
    {
        $vault = $task->vault;
        return $vault->user_id === $user->id || 
               $vault->sharedUsers()->where('user_id', $user->id)->exists();
    }
}
```

---

## 📈 Escalabilidad y Performance

### 1. Indexado de Base de Datos
```sql
-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_tasks_vault_status_created ON tasks(vault_id, status, created_at);
CREATE INDEX idx_tasks_assigned_status_due ON tasks(assigned_to, status, due_date);
CREATE INDEX idx_tasks_created_status ON tasks(created_by, status);

-- Índices para búsqueda de texto
CREATE FULLTEXT INDEX idx_tasks_fulltext ON tasks(title, description);
```

### 2. Caché con Redis
```php
// Cache de tareas por vault
$cacheKey = "vault.{$vaultId}.tasks.{$status}";
$tasks = Cache::remember($cacheKey, 300, function () use ($vaultId, $status) {
    return Task::byVault($vaultId)->byStatus($status)->get();
});

// Cache de estadísticas
$statsKey = "vault.{$vaultId}.stats";
$stats = Cache::remember($statsKey, 600, function () use ($vaultId) {
    return [
        'total' => Task::byVault($vaultId)->count(),
        'completed' => Task::byVault($vaultId)->byStatus('done')->count(),
        'overdue' => Task::byVault($vaultId)->overdue()->count()
    ];
});
```

### 3. Jobs en Cola
```php
<?php

namespace App\Jobs;

use App\Models\Task;
use App\Notifications\TaskDueReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProcessTaskReminder implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $dueTasks = Task::where('due_date', '<=', now()->addDay())
                       ->whereNotIn('status', ['done'])
                       ->with(['assignedUser'])
                       ->get();

        foreach ($dueTasks as $task) {
            if ($task->assignedUser) {
                $task->assignedUser->notify(new TaskDueReminderNotification($task));
            }
        }
    }
}
```

---

## 🚀 Implementación Recomendada

### Fase 1: Base Funcional (2-3 semanas)
1. ✅ Migración de base de datos
2. ✅ Modelos básicos (Task, TaskTag)
3. ✅ CRUD básico de tareas
4. ✅ Integración con autenticación Keycloak
5. ✅ API endpoints principales

### Fase 2: Funcionalidades Avanzadas (2-3 semanas)
1. ✅ Comentarios y archivos adjuntos
2. ✅ Sistema de etiquetas
3. ✅ Operaciones en lote
4. ✅ Notificaciones en tiempo real
5. ✅ Auditoría de cambios

### Fase 3: Optimización y Analytics (1-2 semanas)
1. ✅ Sistema de caché
2. ✅ Jobs en cola
3. ✅ Métricas y reportes
4. ✅ Optimización de rendimiento
5. ✅ Tests automatizados

---

## 🔧 Comandos Artisan Útiles

```bash
# Generar migración
php artisan make:migration create_tasks_table

# Generar modelo con todo
php artisan make:model Task -mfrc

# Generar servicio
php artisan make:service TaskService

# Generar job
php artisan make:job ProcessTaskReminder

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders
php artisan db:seed --class=TaskSeeder

# Limpiar caché
php artisan cache:clear
php artisan config:clear
```

---

## 📝 Conclusiones

Este diseño proporciona:

- ✅ **Escalabilidad**: Arquitectura preparada para crecer
- ✅ **Seguridad**: Autenticación robusta y autorización granular
- ✅ **Performance**: Índices optimizados y sistema de caché
- ✅ **Auditoría**: Registro completo de cambios
- ✅ **Flexibilidad**: Sistema de etiquetas y archivos adjuntos
- ✅ **Integración**: Compatible con la arquitectura existente

El sistema se integra perfectamente con la infraestructura actual de Synaps, aprovechando Keycloak para autenticación, Redis para caché y la arquitectura multi-tenant existente.
