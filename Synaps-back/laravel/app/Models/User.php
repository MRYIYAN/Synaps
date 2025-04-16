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
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    //---------------------------------------------------------------------------//
    //  Define la tabla asociada al modelo y la clave primaria.                  //
    //---------------------------------------------------------------------------//
    protected $table = 'users';
    protected $primaryKey = 'user_id';
    public $timestamps = false;

    //---------------------------------------------------------------------------//
    //  Atributos rellenables para asignación masiva.                            //
    //---------------------------------------------------------------------------//
    protected $fillable = [
        'user_email',
        'user_name',
        'user_password',
    ];

    //---------------------------------------------------------------------------//
    //  Atributos que deben permanecer ocultos al serializar el modelo.          //
    //---------------------------------------------------------------------------//
    protected $hidden = [
        'user_password',
    ];

    //---------------------------------------------------------------------------//
    //  Obtiene la contraseña del usuario para la autenticación.                 //
    //---------------------------------------------------------------------------//
    public function getAuthPassword()
    {
        return $this->user_password;
    }

    //---------------------------------------------------------------------------//
    //  Obtiene el identificador del usuario para la autenticación.              //
    //---------------------------------------------------------------------------//
    public function getAuthIdentifierName()
    {
        return 'user_email';
    }
}
//===========================================================================//
