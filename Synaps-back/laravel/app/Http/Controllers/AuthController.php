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
use Illuminate\Support\Facades\Log;
use App\Services\TenantService;

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
     * 
     * @param Request $request Datos de la solicitud
     * @return JsonResponse Respuesta JSON con validación del token
     */
    public function loginCheck( Request $request ): JsonResponse
    {
        // Inicializar value con valor por defecto
        $value = response()->json( [
            'result' => 0,
            'message' => 'Token inválido',
            'user' => []
        ] );

        $user = $request->attributes->get( 'token_data', [] );

        if( !empty( $user ) ) {
            // Buscar el usuario en la base de datos para obtener el campo first_login
            $userModel = \App\Models\User::find( $user['user_id'] ?? null );
            
            if( $userModel ) {
                $user['first_login'] = $userModel->first_login ?? false;
            }
            
            $value = response()->json( [
                'result' => 1,
                'message' => 'Token válido',
                'user' => $user
            ] );
        }

        // Retornar value
        return $value;
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
        // Inicializar value con valor por defecto
        $value = response()->json( [
            'result' => 0,
            'message' => '',
            'http_code' => 500,
            'access_token' => ''
        ] );

        // Inicializamos los valores de trabajo
        $result = 0;
        $message = '';
        $access_token = '';
        $http_code = 0;

        try {
            //---------------------------------------------------------------------------//
            //                    Validar los datos recibidos                            //
            //---------------------------------------------------------------------------//
            $request->validate( [
                'email' => 'required|string',
                'password' => 'required|string'
            ] );

            //---------------------------------------------------------------------------//
            //                      Configuración de Keycloak                            //
            //---------------------------------------------------------------------------//
            // Configuración de Keycloak
            // Se obtienen las variables de entorno para la configuración de Keycloak
            //---------------------------------------------------------------------------//    
            $keycloak_url = env( 'KEYCLOAK_URL' );
            $realm = env( 'KEYCLOAK_REALM' );
            $client_id = env( 'KEYCLOAK_CLIENT_ID' );
        
            //---------------------------------------------------------------------------//
            //                  Hacemos la solicitud a Keycloak                          //
            //---------------------------------------------------------------------------//
            // Se envía una solicitud POST a Keycloak para autenticar al usuario
            // Se utiliza el cliente HTTP de Laravel para enviar la solicitud
            // Se envían las credenciales del usuario (email y password) como parámetros
            //---------------------------------------------------------------------------//
            $response = Http::asForm()->post( "{$keycloak_url}/realms/{$realm}/protocol/openid-connect/token", [
                'grant_type' => 'password',
                'client_id' => $client_id,
                'username' => $request->email,
                'password' => $request->password
            ] );

            // Verificamos la respuesta de Keycloak
            if( $response->successful() ) {    
                // Si el login es exitoso, regeneramos sesión de Laravel si es necesario
                $request->session()->regenerate();

                //Guardar el token en sesión
                session( [ 'keycloak_token' => $response->json()['access_token'] ] );

                // Buscar el usuario en la base de datos para verificar si es su primer login
                $user = \App\Models\User::where( 'user_email', $request->email )->first();
                $isFirstLogin = false;
                
                if( $user && $user->first_login ) {
                    $isFirstLogin = true;
                    // Actualizar el campo first_login a false
                    $user->first_login = false;
                    $user->save();
                }

                // Si llegamos hasta aquí, está todo OK
                $result = 1;
                $access_token = $response->json()['access_token'];
                $http_code = 200;
                
                // Agregar información del primer login a la respuesta
                $message = $isFirstLogin ? 'first_login' : '';
            } else {
                // Si falla el login, devolvemos una alerta
                $http_code = 401;
                throw new Exception( 'Incorrect credentials' );
            }
        } catch( Exception $e ) {
            // Guardamos el error
            $message = $e->getMessage();
        } finally {
            // Calculamos la respuesta final
            $value = response()->json( [
                'result' => $result,
                'message' => $message,
                'http_code' => $http_code,
                'access_token' => $access_token
            ] );
        }

        // Retornar value
        return $value;
    }

    /**
     * POST /api/register
     * 
     * Registra un nuevo usuario en la base de datos y crea su DB tenant
     * 
     * @param Request $request Datos del usuario a registrar
     * @return JsonResponse Respuesta con resultado del registro
     */
    public function register( Request $request ): JsonResponse
    {
        // Inicializar value con valor por defecto
        $value = response()->json( [
            'result' => 0,
            'message' => 'Error desconocido al registrar usuario'
        ] );

        $result     = 0;
        $message    = '';

        try {
            //---------------------------------------------------------------------------//
            //                    Validar los datos recibidos                            //
            //---------------------------------------------------------------------------//
            $request->validate( [
                'name' => 'required|string|max:255',
                'username' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,user_email',
                'password' => 'required|string|min:6',
            ] );

            //---------------------------------------------------------------------------//
            //                    Preparar datos para inserción                          //
            //---------------------------------------------------------------------------//
            $user_id2 = \Illuminate\Support\Str::random( 32 );
            $hash_password = \Illuminate\Support\Facades\Hash::make( $request->password );
            
            $user_data = [
                'user_id2' => $user_id2,
                'user_email' => $request->email,
                'user_name' => $request->username,
                'user_full_name' => $request->name,
                'user_password' => $hash_password,
                'first_login' => true,
                'created_at' => now(),
                'updated_at' => now()
            ];

            //---------------------------------------------------------------------------//
            //                    Crear usuario en la base de datos                      //
            //---------------------------------------------------------------------------//
            $user = \App\Models\User::create( $user_data );
            throw_if( !$user, Exception::class, 'Error al crear el usuario' );

            //---------------------------------------------------------------------------//
            //                    Crear BD tenant usando TenantService                   //
            //---------------------------------------------------------------------------//
            TenantService::createTenantForUser( $user->user_id );

            $result = 1;
            $message = 'Usuario registrado exitosamente';

        } catch( \Illuminate\Validation\ValidationException $e ) {
            $message = 'Error de validación: ' . implode( ', ', $e->validator->errors()->all() );
        } catch( Exception $e ) {
            $message = 'Error al registrar usuario: ' . $e->getMessage();
        }

        $value = response()->json( [
            'result' => $result,
            'message' => $message
        ] );

        // Retornar value
        return $value;
    }

    /**
     * GET /api/user/profile
     * 
     * Obtiene los datos del perfil del usuario autenticado
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserProfile( Request $request ): JsonResponse
    {
        // Inicializar value con valor por defecto
        $value = response()->json( [
            'result' => 0,
            'message' => 'Error al obtener perfil',
            'user' => null
        ] );

        try {
            // Obtener datos del token
            $token_data = $request->attributes->get( 'token_data', [] );
            
            if( empty( $token_data ) || !isset( $token_data['user_id'] ) ) {
                throw new Exception( 'Usuario no autenticado' );
            }

            // Buscar usuario en la base de datos
            $user = \App\Models\User::find( $token_data['user_id'] );
            
            if( !$user ) {
                throw new Exception( 'Usuario no encontrado' );
            }

            $value = response()->json( [
                'result' => 1,
                'message' => 'Perfil obtenido exitosamente',
                'user' => [
                    'user_id' => $user->user_id,
                    'user_name' => $user->user_name,
                    'user_email' => $user->user_email,
                    'user_full_name' => $user->user_full_name ?? ''
                ]
            ] );

        } catch( Exception $e ) {
            Log::error( 'Error obteniendo perfil de usuario: ' . $e->getMessage() );
            $value = response()->json( [
                'result' => 0,
                'message' => $e->getMessage(),
                'user' => null
            ] );
        }

        // Retornar value
        return $value;
    }

    /**
     * PUT /api/user/profile
     * 
     * Actualiza los datos del perfil del usuario autenticado
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function updateUserProfile( Request $request ): JsonResponse
    {
        // Inicializar value con valor por defecto
        $value = response()->json( [
            'result' => 0,
            'message' => 'Error al actualizar perfil'
        ] );

        try {
            // Obtener datos del token
            $token_data = $request->attributes->get( 'token_data', [] );
            
            if( empty( $token_data ) || !isset( $token_data['user_id'] ) ) {
                throw new Exception( 'Usuario no autenticado' );
            }

            // Validar datos recibidos
            $request->validate( [
                'user_name' => 'sometimes|string|max:255',
                'user_full_name' => 'sometimes|string|max:255',
                'user_email' => 'sometimes|email|max:255',
                'current_password' => 'required_with:new_password|string',
                'new_password' => 'sometimes|string|min:6|confirmed'
            ] );

            // Buscar usuario
            $user = \App\Models\User::find( $token_data['user_id'] );
            
            if( !$user ) {
                throw new Exception( 'Usuario no encontrado' );
            }

            // Actualizar campos básicos si se proporcionan
            if( $request->has( 'user_name' ) ) {
                $user->user_name = $request->user_name;
            }

            if( $request->has( 'user_full_name' ) ) {
                $user->user_full_name = $request->user_full_name;
            }

            if( $request->has( 'user_email' ) ) {
                // Verificar que el email no esté en uso por otro usuario
                $email_exists = \App\Models\User::where( 'user_email', $request->user_email )
                    ->where( 'user_id', '!=', $user->user_id )
                    ->exists();
                
                if( $email_exists ) {
                    throw new Exception( 'El email ya está en uso' );
                }
                
                $user->user_email = $request->user_email;
            }

            // Actualizar contraseña si se proporciona
            if( $request->has( 'new_password' ) && $request->has( 'current_password' ) ) {
                // Verificar contraseña actual
                if( !\Illuminate\Support\Facades\Hash::check( $request->current_password, $user->user_password ) ) {
                    throw new Exception( 'La contraseña actual es incorrecta' );
                }
                
                $user->user_password = \Illuminate\Support\Facades\Hash::make( $request->new_password );
            }

            // Guardar cambios
            $user->updated_at = now();
            $user->save();

            $value = response()->json( [
                'result' => 1,
                'message' => 'Perfil actualizado exitosamente',
                'user' => [
                    'user_id' => $user->user_id,
                    'user_name' => $user->user_name,
                    'user_email' => $user->user_email,
                    'user_full_name' => $user->user_full_name ?? ''
                ]
            ] );

        } catch( \Illuminate\Validation\ValidationException $e ) {
            $value = response()->json( [
                'result' => 0,
                'message' => 'Error de validación: ' . implode( ', ', $e->validator->errors()->all() )
            ] );
        } catch( Exception $e ) {
            Log::error( 'Error actualizando perfil de usuario: ' . $e->getMessage() );
            $value = response()->json( [
                'result' => 0,
                'message' => $e->getMessage()
            ] );
        }

        // Retornar value
        return $value;
    }
}
