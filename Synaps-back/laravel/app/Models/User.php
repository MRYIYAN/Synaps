<?php

//===========================================================================//
//                             MODELO USER                                   //
//===========================================================================//
//----------------------------------------------------------------------------//
//  Este modelo representa a los usuarios en la base de datos. Define la      //
//  tabla asociada, la clave primaria, los atributos rellenables y ocultos,   //
//  y los métodos necesarios para la autenticación.                          //
//----------------------------------------------------------------------------//

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * Clase que representa a los usuarios del sistema.
 *
 * @property int $user_id
 * @property string $user_email
 * @property string $user_name
 * @property string $user_password
 */
class User extends Authenticatable
{
    //---------------------------------------------------------------------------//
    //  Define la tabla asociada al modelo y la clave primaria.                  //
    //---------------------------------------------------------------------------//

    /**
     * Nombre de la tabla asociada.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * Nombre de la clave primaria.
     *
     * @var string
     */
    protected $primaryKey = 'user_id';
    public $incrementing = true;
    protected $keyType = 'int';

    /**
     * Desactiva los timestamps de Eloquent.
     *
     * @var bool
     */
    public $timestamps = false;

    //---------------------------------------------------------------------------//
    //  Atributos rellenables para asignación masiva.                            //
    //---------------------------------------------------------------------------//

    /**
     * Atributos que se pueden asignar masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_email',
        'user_name',
        'user_password',
        'user_profile_photo',
    ];

    //---------------------------------------------------------------------------//
    //  Atributos que deben permanecer ocultos al serializar el modelo.          //
    //---------------------------------------------------------------------------//

    /**
     * Atributos ocultos al serializar el modelo.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'user_password',
    ];

    //---------------------------------------------------------------------------//
    //  Obtiene la contraseña del usuario para la autenticación.                 //
    //---------------------------------------------------------------------------//

    /**
     * Devuelve el valor del campo de contraseña para autenticación.
     *
     * @return string
     */
    public function getAuthPassword(): string
    {
        return $this->user_password;
    }

    public function getAuthIdentifier()
    {
        return $this->user_id; // ID del usuario
    }

    public function getAuthIdentifierName()
    {
        return 'user_id';
    }
}
//===========================================================================//
