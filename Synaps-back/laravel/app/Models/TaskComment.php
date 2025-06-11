<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskComment extends Model
{
  use SoftDeletes;
  
  protected $table = 'task_comments';
  protected $primaryKey = 'comment_id';
  
  // Para manejar conexiones dinámicas
  protected static $connectionName = null;
  
  protected $fillable = [
      'comment_id2',
      'task_id',
      'user_id',
      'content'
  ];

  protected $casts = [
      'created_at' => 'datetime',
      'updated_at' => 'datetime',
      'deleted_at' => 'datetime'
  ];

  protected $dates = ['deleted_at'];

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

  // Boot method para eventos
  protected static function boot()
  {
      parent::boot();

      static::creating(function ($comment) {
          $comment->comment_id2 = self::generateUniqueId();
      });

      static::created(function ($comment) {
          // Registrar en el historial de la tarea
          TaskHistory::create([
              'task_id' => $comment->task_id,
              'user_id' => $comment->user_id,
              'action' => 'commented'
          ]);
      });
  }

  private static function generateUniqueId()
  {
      return strtoupper(bin2hex(random_bytes(16)));
  }
}
