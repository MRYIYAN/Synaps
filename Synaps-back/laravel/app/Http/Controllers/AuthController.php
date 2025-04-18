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
use Illuminate\Http\JsonResponse;
use App\Models\User;

/**
 * Controlador responsable del login de usuarios en Synaps.
 */
class AuthController extends Controller
{
    //---------------------------------------------------------------------------//
    //  Método para manejar el inicio de sesión de usuarios.                     //
    //---------------------------------------------------------------------------//

    /**
     * Procesa la solicitud de login y autentica al usuario.
     *
     * @param Request $request Datos enviados por el cliente (email, password)
     * @return JsonResponse Respuesta con mensaje de éxito o error, y datos del usuario autenticado
     */
    public function login(Request $request): JsonResponse
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
        /** @var User $user */
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
