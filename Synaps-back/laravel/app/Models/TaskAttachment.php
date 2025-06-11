<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskAttachment extends Model
{
    protected $table = 'task_attachments';
    protected $primaryKey = 'attachment_id';
    public $timestamps = false;
    
    protected $fillable = [
        'attachment_id2',
        'task_id',
        'original_name',
        'stored_name',
        'file_path',
        'mime_type',
        'file_size',
        'uploaded_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'file_size' => 'integer'
    ];

    // Relaciones
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'user_id');
    }

    // Métodos auxiliares
    public function getFileSizeFormatted()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getDownloadUrl()
    {
        return route('api.tasks.attachments.download', $this->attachment_id2);
    }

    // Boot method para eventos
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($attachment) {
            $attachment->attachment_id2 = self::generateUniqueId();
            $attachment->created_at = now();
        });
    }

    private static function generateUniqueId()
    {
        return strtoupper(bin2hex(random_bytes(16)));
    }
}
