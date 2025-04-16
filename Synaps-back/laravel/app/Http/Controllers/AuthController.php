<?php

//===========================================================================//
//                             CONTROLADOR AUTH                              //
//===========================================================================//
//----------------------------------------------------------------------------//
//  Este controlador maneja la autenticación de usuarios. Proporciona un     //
//  método para iniciar sesión, validando las credenciales proporcionadas     //
//  y devolviendo información del usuario autenticado en caso de éxito.       //
//----------------------------------------------------------------------------//

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    //---------------------------------------------------------------------------//
    //  Método para manejar el inicio de sesión de usuarios.                     //
    //---------------------------------------------------------------------------//
    public function login(Request $request)
    {
        //------------------------------------------------------------------------//
        //  Obtiene las credenciales del usuario desde la solicitud.              //
        //------------------------------------------------------------------------//
        $credentials = $request->only('email', 'password');

        //------------------------------------------------------------------------//
        //  Intenta autenticar al usuario con las credenciales proporcionadas.    //
        //------------------------------------------------------------------------//
        if (!Auth::attempt([
            'user_email' => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            //----------------------------------------------------------------------//
            //  Devuelve un mensaje de error si las credenciales son inválidas.     //
            //----------------------------------------------------------------------//
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        //------------------------------------------------------------------------//
        //  Obtiene el usuario autenticado.                                       //
        //------------------------------------------------------------------------//
        $user = Auth::user();

        //------------------------------------------------------------------------//
        //  Devuelve una respuesta JSON con los datos del usuario autenticado.    //
        //------------------------------------------------------------------------//
        return response()->json([
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user->user_id,
                'email' => $user->user_email,
                'name' => $user->user_name,
            ]
        ]);
    }
}
//===========================================================================//
