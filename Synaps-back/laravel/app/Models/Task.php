<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;
    
    protected $table = 'tasks';
    protected $primaryKey = 'task_id';
    
    // Para manejar conexiones dinámicas
    protected static $connectionName = null;
    
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

    // Métodos para manejar conexiones dinámicas
    public static function setConnectionName( $connectionName )
    {
        static::$connectionName = $connectionName;
    }

    public function getConnectionName()
    {
        return static::$connectionName ?: parent::getConnectionName();
    }

    // Relaciones
    public function vault()
    {
        return $this->belongsTo( Vault::class, 'vault_id', 'vault_id' );
    }

    public function folder()
    {
        return $this->belongsTo( FolderNote::class, 'folder_id', 'folder_id' );
    }

    public function assignedUser()
    {
        // Relación personalizada para acceder a usuarios en la BD principal
        return $this->belongsTo( User::class, 'assigned_to', 'user_id' );
    }

    public function creator()
    {
        // Relación personalizada para acceder a usuarios en la BD principal  
        return $this->belongsTo( User::class, 'created_by', 'user_id' );
    }

    // Métodos auxiliares para obtener usuarios directamente desde la BD principal
    public function getAssignedUserAttribute()
    {
        if( !$this->assigned_to ) return null;
        return \DB::connection( 'synaps' )->table( 'users' )
                 ->where( 'user_id', $this->assigned_to )
                 ->first();
    }

    public function getCreatorUserAttribute()
    {
        if( !$this->created_by ) return null;
        return \DB::connection( 'synaps' )->table( 'users' )
                 ->where( 'user_id', $this->created_by )
                 ->first();
    }

    public function tags()
    {
        return $this->belongsToMany( TaskTag::class, 'task_tag_relations', 'task_id', 'tag_id' );
    }

    public function comments()
    {
        return $this->hasMany( TaskComment::class, 'task_id', 'task_id' )->whereNull( 'deleted_at' );
    }

    public function attachments()
    {
        return $this->hasMany( TaskAttachment::class, 'task_id', 'task_id' );
    }

    public function history()
    {
        return $this->hasMany( TaskHistory::class, 'task_id', 'task_id' );
    }

    // Scopes
    public function scopeByStatus( $query, $status )
    {
        return $query->where( 'status', $status );
    }

    public function scopeByVault( $query, $vaultId )
    {
        return $query->where( 'vault_id', $vaultId );
    }

    public function scopeAssignedTo( $query, $userId )
    {
        return $query->where( 'assigned_to', $userId );
    }

    public function scopeOverdue( $query )
    {
        return $query->where( 'due_date', '<', now() )
                    ->whereNotIn( 'status', ['done'] );
    }

    public function scopeTodo( $query )
    {
        return $query->where( 'status', 'todo' );
    }

    public function scopeInProgress( $query )
    {
        return $query->where( 'status', 'in-progress' );
    }

    public function scopeDone( $query )
    {
        return $query->where( 'status', 'done' );
    }

    // Métodos auxiliares
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'done',
            'completed_at' => now()
        ]);
    }

    public function markAsInProgress()
    {
        $this->update([
            'status' => 'in-progress',
            'completed_at' => null
        ]);
    }

    public function markAsTodo()
    {
        $this->update([
            'status' => 'todo',
            'completed_at' => null
        ]);
    }

    public function isOverdue()
    {
        return $this->due_date && 
               $this->due_date < now() && 
               $this->status !== 'done';
    }

    public function isCompleted()
    {
        return $this->status === 'done';
    }

    // Boot method para eventos
    protected static function boot()
    {
        parent::boot();

        static::creating( function ( $task ) {
            // Generar task_id2 único
            $task->task_id2 = self::generateUniqueId();
            
            // Asegurar que siempre se cree en estado 'todo'
            if( !$task->status ) {
                $task->status = 'todo';
            }
        });

        static::created( function ( $task ) {
            // Asegurar que TaskHistory use la misma conexión
            if( static::$connectionName ) {
                TaskHistory::setConnectionName( static::$connectionName );
            }
            
            // Registrar en el historial
            TaskHistory::create([
                'task_id' => $task->task_id,
                'user_id' => $task->created_by,
                'action' => 'created'
            ]);
        });

        static::updating( function ( $task ) {
            // Si cambia el status, actualizar completed_at
            if( $task->isDirty( 'status' ) ) {
                if( $task->status === 'done' && !$task->completed_at ) {
                    $task->completed_at = now();
                } elseif( $task->status !== 'done' ) {
                    $task->completed_at = null;
                }
            }
        });

        static::updated( function ( $task ) {
            // Asegurar que TaskHistory use la misma conexión
            if( static::$connectionName ) {
                TaskHistory::setConnectionName( static::$connectionName );
            }
            
            // Registrar cambios en el historial
            $changes = $task->getChanges();
            unset( $changes['updated_at'] ); // No registrar cambios de updated_at

            foreach( $changes as $field => $newValue ) {
                $oldValue = $task->getOriginal( $field );
                
                TaskHistory::create([
                    'task_id' => $task->task_id,
                    'user_id' => auth()->id() ?? $task->created_by,
                    'action' => $field === 'status' ? 'status_changed' : 'updated',
                    'field_changed' => $field,
                    'old_value' => $oldValue,
                    'new_value' => $newValue
                ]);
            }
        });
    }

    private static function generateUniqueId()
    {
        return strtoupper( bin2hex( random_bytes( 16 ) ) );
    }
}
