<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @file Note.php
 * @class Note
 * @package App\Models
 *
 * Modelo Eloquent para notas, con validación de unicidad por carpeta.
 *
 * @property int                $note_id
 * @property string             $note_id2
 * @property string             $note_title
 * @property \Carbon\Carbon     $insert_date
 * @property \Carbon\Carbon     $last_update_date
 * @property int                $parent_id
 */
class Note extends Model
{
    // Nombre de la tabla
    protected $table = 'notes';

    // Clave primaria
    protected $primaryKey = 'note_id';

    // PK incremental
    public $incrementing = true;
    protected $keyType = 'int';

    // Sin timestamps automáticos
    public $timestamps = false;

    // Asignación masiva
    protected $fillable = [
            'note_id2'
        ,   'note_title'
        ,   'note_markdown'
        ,   'insert_date'
        ,   'last_update_date'
        ,   'parent_id'
    ];

    // Casts de campos a tipos nativos
    protected $casts = [
            'insert_date'      => 'datetime'
        ,   'last_update_date' => 'datetime'
    ];
}