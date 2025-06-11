<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskTag extends Model
{
    protected $table = 'task_tags';
    protected $primaryKey = 'tag_id';
    public $timestamps = false;
    
    // Para manejar conexiones dinámicas
    protected static $connectionName = null;
    
    protected $fillable = [
        'tag_id2',
        'name',
        'color',
        'vault_id'
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
    public function vault()
    {
        return $this->belongsTo(Vault::class, 'vault_id', 'vault_id');
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_tag_relations', 'tag_id', 'task_id');
    }

    // Scopes
    public function scopeByVault($query, $vaultId)
    {
        return $query->where('vault_id', $vaultId);
    }

    // Boot method para eventos
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            $tag->tag_id2 = self::generateUniqueId();
            $tag->created_at = now();
        });
    }

    private static function generateUniqueId()
    {
        return strtoupper(bin2hex(random_bytes(16)));
    }
}
