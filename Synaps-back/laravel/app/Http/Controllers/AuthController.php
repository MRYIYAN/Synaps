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

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; 
use Illuminate\Http\JsonResponse;

/**
 * Controlador responsable del login de usuarios en Synaps.
 */
class AuthController extends Controller
{
    /**
     * GET /api/login-check
     * 
     * Función que comprueba si el token del Frontend es correcto
     * En caso contrario, el Front redirigirá al login
     */
    public function loginCheck( Request $request )
    {
        $user = $request->attributes->get('token_data', []);

        return response()->json([
            'result' => 1,
            'message' => 'Token válido',
            'user' => $user
        ]);
    }


    //---------------------------------------------------------------------------//
    //  Método para manejar el inicio de sesión de usuarios.                     //
    //---------------------------------------------------------------------------//

    /**
     * Procesa la solicitud de login y autentica al usuario usando Keycloak.
     *
     * @param Request $request Datos enviados por el cliente (email, password)
     * @return JsonResponse Respuesta con mensaje de éxito o error, y token de Keycloak si es exitoso
     */
    public function login( Request $request ): JsonResponse
    {
        // Inicializamos los valores a devolver
        $result         = 0;
        $message        = '';
        $access_token   = '';
        $http_code      = 0;

        try
        {
            //---------------------------------------------------------------------------//
            //                    Validar los datos recibidos                            //
            //---------------------------------------------------------------------------//
            $request->validate( [
                    'email'     => 'required|string'
                ,   'password'  => 'required|string'
            ] );

            //---------------------------------------------------------------------------//
            //                      Configuración de Keycloak                            //
            //---------------------------------------------------------------------------//
                // Configuración de Keycloak
                // Se obtienen las variables de entorno para la configuración de Keycloak
            //---------------------------------------------------------------------------//    
            $keycloak_url   = env( 'KEYCLOAK_URL' );
            $realm          = env( 'KEYCLOAK_REALM' );
            $client_id      = env( 'KEYCLOAK_CLIENT_ID' );
        
            //---------------------------------------------------------------------------//
            //                  Hacemos la solicitud a Keycloak                          //
            //---------------------------------------------------------------------------//
                // Se envía una solicitud POST a Keycloak para autenticar al usuario
                // Se utiliza el cliente HTTP de Laravel para enviar la solicitud
                // Se envían las credenciales del usuario (email y password) como parámetros
            //---------------------------------------------------------------------------//
            $response = Http::asForm()->post( "{$keycloak_url}/realms/{$realm}/protocol/openid-connect/token", [
                    'grant_type'    => 'password'
                ,   'client_id'     => $client_id
                ,   'username'      => $request->email
                ,   'password'      => $request->password
            ] );

            // Verificamos la respuesta de Keycloak
            if( $response->successful() )
            {    
                // Si el login es exitoso, regeneramos sesión de Laravel si es necesario
                $request->session()->regenerate();

                //Guardar el token en sesión
                session( ['keycloak_token' => $response->json()['access_token']] );

                // Si llegamos hasta aquí, está todo OK
                $result         = 1;
                $access_token   = $response->json()['access_token'];
                $http_code      = 200;
            }
            else // Si falla el login, devolvemos una alerta
            {
                $http_code = 401;
                throw new Exception( 'Incorrect credentials' );
            }
        }
        catch( Exception $e )
        {
            // Guardamos el error
            $message = $e->getMessage();    
        }
        finally
        {
            // Calculamos la respuesta final
            $value = response()->json( [
                  'result'          => $result
                , 'message'         => $message
                , 'http_code'       => $http_code
                , 'access_token'    => $access_token
            ] );

            return $value;
        }
    }

    public function register( Request $request ): JsonResponse
    {
        print_r( $request ); exit;

        // Inicializamos la respuesta del servidor y sus parámetros
        $result     = 0;
        $message    = '';

        try
        {
            // Iniciamos sesión en KeyCloak para capturar el token del administrador
            // Este token será necesario para generar el nuevo usuario
            $token = Http::asForm()
                ->post(
                    env( 'KEYCLOAK_URL' ) . '/realms/master/protocol/openid-connect/token',
                    [
                            'grant_type' => 'password'
                        ,   'client_id'  => 'admin-cli'
                        ,   'username'   => env( 'KEYCLOAK_ADMIN_USER' )
                        ,   'password'   => env( 'KEYCLOAK_ADMIN_PASS' )
                    ]
                )

                // Capturamos el access_token del JSON de respuesta
                ->json( 'access_token' );
            
            // Realizamos el cURL con los datos de la llamada para crear el nuevo usuario
            $response = Http::withToken( $token )
                ->post(
                    env( 'KEYCLOAK_URL' ) . '/admin/realms/'.env( 'KEYCLOAK_REALM' ) . '/users',
                    [
                        'username'    => $request->input( 'username' ),
                        'enabled'     => true,
                        'email'       => $request->input( 'email' ),
                        'credentials' => [ [
                            'type'      => 'password',
                            'value'     => $request->input( 'password' ),
                            'temporary' => false,
                        ] ],
                    ]
                );

            print_r( $response ); exit;
        }
        catch( Exception $e )
        {
            // En caso de excepción, establecemos como mensaje a devolver el de error
            $message = $e->getMessage();
        }
        finally
        {
            // Creamos la respuesta del servidor y la devolvemos
            $response = response()->json( [
                    'result'    => $result
                ,   'message'   => $message
            ] );

            return $response;
        }
    }
}