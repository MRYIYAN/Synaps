<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

//===========================================================================//
//                                 MODELO VAULT                              //
//===========================================================================//

/**
 * Modelo Eloquent para la tabla 'vaults'.
 * 
 * Representa una vault en la base de datos Synaps.
 */
class Vault extends Model
{
    /**
     * Nombre de la tabla asociada.
     * @var string
     */
    protected $table = 'vaults';

    /**
     * Clave primaria personalizada.
     * @var string
     */
    protected $primaryKey = 'vault_id';

    /**
     * Indica si el modelo debe gestionar timestamps.
     * @var bool
     */
    public $timestamps = false;

    /**
     * Campos que pueden ser asignados masivamente.
     * @var array
     */
    protected $fillable = [
        'vault_id2',
        'vault_title',
        'user_id',
        'logical_path',
        'is_private',
        'created_at',
    ];
}
