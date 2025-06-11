<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskHistory extends Model
{
    protected $table = 'task_history';
    protected $primaryKey = 'history_id';
    public $timestamps = false;
    
    // Para manejar conexiones dinámicas
    protected static $connectionName = null;
    
    protected $fillable = [
        'task_id',
        'user_id',
        'action',
        'field_changed',
        'old_value',
        'new_value'
    ];

    protected $casts = [
        'created_at' => 'datetime'
    ];

    // Métodos para manejar conexiones dinámicas
    public static function setConnectionName($connectionName)
    {
        static::$connectionName = $connectionName;
    }

    public function getConnectionName()
    {
        return static::$connectionName ?: parent::getConnectionName();
    }

    // Relaciones
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // Método auxiliar para obtener usuario directamente desde la BD principal
    public function getUserDataAttribute()
    {
        if(!$this->user_id) return null;
        return \DB::connection('synaps')->table('users')
                 ->where('user_id', $this->user_id)
                 ->first();
    }

    // Boot method para eventos
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($history) {
            $history->created_at = now();
        });
    }
}
