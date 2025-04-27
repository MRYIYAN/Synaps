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
use Illuminate\Support\Facades\Http; 
use Illuminate\Http\JsonResponse;
use App\Models\User;
use Exception;

/**
 * Controlador responsable del login de usuarios en Synaps.
 */
class AuthController extends Controller
{
    //---------------------------------------------------------------------------//
    //  Método para manejar el inicio de sesión de usuarios.                     //
    //---------------------------------------------------------------------------//

    /**
     * Procesa la solicitud de login y autentica al usuario usando Keycloak.
     *
     * @param Request $request Datos enviados por el cliente (email, password)
     * @return JsonResponse Respuesta con mensaje de éxito o error, y token de Keycloak si es exitoso
     */
    public function login(Request $request): JsonResponse

    {
    //---------------------------------------------------------------------------//
    //                    Validar los datos recibidos                            //
    //---------------------------------------------------------------------------//
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

    //---------------------------------------------------------------------------//
    //                      Configuración de Keycloak                            //
    //---------------------------------------------------------------------------//
        // Configuración de Keycloak
        // Se obtienen las variables de entorno para la configuración de Keycloak
    //---------------------------------------------------------------------------//    
        $keycloak_url = env('KEYCLOAK_URL', 'http://localhost:8085');
        $realm = env('KEYCLOAK_REALM', 'Synaps');
        $client_id = env('KEYCLOAK_CLIENT_ID', 'synaps-front');

    
    //---------------------------------------------------------------------------//
    //                  Hacemos la solicitud a Keycloak                          //
    //---------------------------------------------------------------------------//
        // Se envía una solicitud POST a Keycloak para autenticar al usuario
        // Se utiliza el cliente HTTP de Laravel para enviar la solicitud
        // Se envían las credenciales del usuario (email y password) como parámetros
    //---------------------------------------------------------------------------//
        $response = Http::asForm()->post("{$keycloak_url}/realms/{$realm}/protocol/openid-connect/token", [
            'grant_type' => 'password',
            'client_id' => $client_id,
            'username' => $request->email,
            'password' => $request->password,
        ]);

        // Verificamos la respuesta de Keycloak
        if ($response->successful()) {
            
            // Si el login es exitoso, regeneramos sesión de Laravel si es necesario
            $request->session()->regenerate();

            //Guardar el token en sesión
            session(['keycloak_token' => $response->json()['access_token']]);


            // Guardar el usuario en sesión
            return response()->json([
                'message' => 'Login exitoso',
                'token' => $response->json()['access_token'], // Devolver el token si es necesario
            ]);
        } else {
            // Si falla el login
            return response()->json([
                'message' => 'Email o contraseña incorrectos',
            ], 401);
        }
    }
}
//===========================================================================//
