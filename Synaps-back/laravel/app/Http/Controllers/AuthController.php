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
     */
    public function loginCheck( Request $request )
    {
        $user = $request->attributes->get( 'token_data', [] );

        return response()->json([
            'result' => 1,
            'message' => 'Token válido',
            'user' => $user
        ] );
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
        // Inicializamos la respuesta del servidor y sus parámetros
        $result     = 0;
        $message    = '';

        try
        {
            //---------------------------------------------------------------------------//
            //                    Log de datos recibidos (para debugging)                //
            //---------------------------------------------------------------------------//
            \Illuminate\Support\Facades\Log::info('🚀 REGISTER_START: Iniciando proceso de registro');
            \Illuminate\Support\Facades\Log::info('📥 REGISTER_INPUT_DATA:', [
                'email' => $request->email,
                'username' => $request->username,
                'name' => $request->name,
                'password_length' => strlen($request->password ?? ''),
                'all_input' => $request->all()
            ]);

            //---------------------------------------------------------------------------//
            //                    Validar los datos recibidos                            //
            //---------------------------------------------------------------------------//
            \Illuminate\Support\Facades\Log::info('✅ REGISTER_VALIDATION: Iniciando validación');
            
            $request->validate( [
                'name'     => 'required|string|max:255',
                'username' => 'required|string|max:255',
                'email'    => 'required|email|max:255|unique:users,user_email',
                'password' => 'required|string|min:6',
            ] );

            \Illuminate\Support\Facades\Log::info('✅ REGISTER_VALIDATION: Validación exitosa');

            //---------------------------------------------------------------------------//
            //                    Preparar datos para inserción                          //
            //---------------------------------------------------------------------------//
            \Illuminate\Support\Facades\Log::info('🔧 REGISTER_PREPARE: Preparando datos para inserción');
            
            $user_id2 = \Illuminate\Support\Str::random(32);
            $hashedPassword = \Illuminate\Support\Facades\Hash::make($request->password);
            
            $userData = [
                'user_id2'       => $user_id2,
                'user_email'     => $request->email,
                'user_name'      => $request->username,
                'user_full_name' => $request->name,
                'user_password'  => $hashedPassword,
            ];

            \Illuminate\Support\Facades\Log::info('🔧 REGISTER_USER_DATA:', [
                'user_id2' => $user_id2,
                'user_email' => $request->email,
                'user_name' => $request->username,
                'user_full_name' => $request->name,
                'password_hash_start' => substr($hashedPassword, 0, 20) . '...',
                'password_hash_type' => substr($hashedPassword, 0, 4)
            ]);

            //---------------------------------------------------------------------------//
            //                    Verificar conexión a la base de datos                  //
            //---------------------------------------------------------------------------//
            \Illuminate\Support\Facades\Log::info('🔗 REGISTER_DB_CHECK: Verificando conexión a BD');
            try {
                \Illuminate\Support\Facades\DB::connection()->getPdo();
                \Illuminate\Support\Facades\Log::info('🔗 REGISTER_DB_CHECK: Conexión exitosa');
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('❌ REGISTER_DB_ERROR: Error de conexión', [
                    'error' => $e->getMessage()
                ]);
                throw new Exception('Error de conexión a la base de datos: ' . $e->getMessage());
            }

            //---------------------------------------------------------------------------//
            //                    Insertar usuario en la base de datos                   //
            //---------------------------------------------------------------------------//
            \Illuminate\Support\Facades\Log::info('💾 REGISTER_DB_INSERT: Iniciando inserción en BD');
            
            $user = \App\Models\User::create($userData);

            \Illuminate\Support\Facades\Log::info('💾 REGISTER_DB_INSERT: Resultado de create()', [
                'user_object' => $user ? 'Usuario creado' : 'Usuario NULL',
                'user_id' => $user ? $user->user_id : 'N/A',
                'user_email' => $user ? $user->user_email : 'N/A'
            ]);

            if( $user )
            {
                //---------------------------------------------------------------------------//
                //                    Crear base de datos del tenant                          //
                //---------------------------------------------------------------------------//
                try {
                    \Illuminate\Support\Facades\Log::info('🏗️ TENANT_SETUP: Iniciando creación de BD tenant', [
                        'user_id' => $user->user_id,
                        'user_id2' => $user->user_id2,
                        'email' => $user->user_email
                    ]);

                    $tenantService = new TenantService();
                    $tenantCreated = $tenantService->createTenantDatabase($user->user_id2, $user->user_email);

                    if ($tenantCreated) {
                        \Illuminate\Support\Facades\Log::info('✅ TENANT_SETUP: BD tenant creada exitosamente', [
                            'user_id' => $user->user_id,
                            'user_id2' => $user->user_id2,
                            'tenant_db' => $tenantService->getTenantDatabaseName($user->user_id2)
                        ]);
                    } else {
                        \Illuminate\Support\Facades\Log::warning('⚠️ TENANT_SETUP: BD tenant no pudo ser creada', [
                            'user_id' => $user->user_id,
                            'user_id2' => $user->user_id2
                        ]);
                    }

                } catch (Exception $tenantException) {
                    // Log el error pero no fallar el registro completo
                    \Illuminate\Support\Facades\Log::error('❌ TENANT_SETUP_ERROR: Error creando BD tenant', [
                        'user_id' => $user->user_id,
                        'user_id2' => $user->user_id2,
                        'email' => $user->user_email,
                        'error' => $tenantException->getMessage(),
                        'trace' => $tenantException->getTraceAsString()
                    ]);
                    
                    // Opcional: Podrías decidir si fallar el registro completo o continuar
                    // Para este caso, continuamos y registramos el warning
                }

                $result = 1;
                $message = 'Usuario registrado exitosamente';
                
                \Illuminate\Support\Facades\Log::info('🎉 REGISTER_SUCCESS: Usuario registrado exitosamente', [
                    'user_id' => $user->user_id,
                    'user_id2' => $user->user_id2,
                    'email' => $user->user_email,
                    'username' => $user->user_name,
                    'full_name' => $user->user_full_name
                ]);
            }
            else
            {
                \Illuminate\Support\Facades\Log::error('❌ REGISTER_DB_ERROR: Usuario no creado');
                throw new Exception( 'Error al crear el usuario en la base de datos' );
            }
        }
        catch( \Illuminate\Validation\ValidationException $e )
        {
            // Manejar errores de validación
            $errors = $e->errors();
            $message = 'Datos de validación incorrectos: ';
            
            if( isset($errors['email']) )
                $message .= 'El correo electrónico ya está registrado. ';
            if( isset($errors['name']) )
                $message .= 'El nombre es requerido. ';
            if( isset($errors['username']) )
                $message .= 'El nombre de usuario es requerido. ';
            if( isset($errors['password']) )
                $message .= 'La contraseña debe tener al menos 6 caracteres. ';

            \Illuminate\Support\Facades\Log::warning('⚠️ REGISTER_VALIDATION_ERROR: Error de validación', [
                'errors' => $errors,
                'input_data' => $request->all()
            ]);
        }
        catch( Exception $e )
        {
            // En caso de excepción, establecemos como mensaje a devolver el de error
            $message = $e->getMessage();
            
            \Illuminate\Support\Facades\Log::error('❌ REGISTER_EXCEPTION: Excepción capturada', [
                'message' => $message,
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        finally
        {
            \Illuminate\Support\Facades\Log::info('🏁 REGISTER_FINALLY: Finalizando proceso', [
                'result' => $result,
                'message' => $message
            ]);

            // Creamos la respuesta del servidor y la devolvemos
            $response = response()->json( [
                    'result'    => $result
                ,   'message'   => $message
            ] );

            \Illuminate\Support\Facades\Log::info('📤 REGISTER_RESPONSE: Enviando respuesta', [
                'response_data' => [
                    'result' => $result,
                    'message' => $message
                ]
            ]);

            return $response;
        }
    }

    //---------------------------------------------------------------------------//
    //  Método de diagnóstico para verificar el sistema de tenants               //
    //---------------------------------------------------------------------------//

    /**
     * Endpoint de diagnóstico para verificar el estado del sistema de tenants
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function tenantDiagnostic(Request $request): JsonResponse
    {
        try {
            Log::info('🔍 TENANT_DIAGNOSTIC: Iniciando diagnóstico del sistema');

            $diagnostic = [
                'timestamp' => now()->toISOString(),
                'system_status' => 'checking',
                'database_connection' => false,
                'tenant_service' => false,
                'users_with_tenants' => 0,
                'users_without_tenants' => 0,
                'total_users' => 0,
                'tenant_databases' => [],
                'errors' => []
            ];

            // Verificar conexión a BD
            try {
                DB::connection()->getPdo();
                $diagnostic['database_connection'] = true;
                Log::info('✅ TENANT_DIAGNOSTIC: Conexión BD OK');
            } catch (Exception $e) {
                $diagnostic['errors'][] = 'Database connection failed: ' . $e->getMessage();
                Log::error('❌ TENANT_DIAGNOSTIC: Error conexión BD', ['error' => $e->getMessage()]);
            }

            // Verificar servicio de tenant
            try {
                $tenantService = new \App\Services\TenantService();
                $diagnostic['tenant_service'] = true;
                Log::info('✅ TENANT_DIAGNOSTIC: TenantService OK');

                // Verificar usuarios y sus tenants
                if ($diagnostic['database_connection']) {
                    try {
                        $users = \App\Models\User::all();
                        $diagnostic['total_users'] = $users->count();

                        $usersWithTenants = 0;
                        $usersWithoutTenants = 0;
                        $tenantDatabases = [];

                        foreach ($users as $user) {
                            $hasTenantsDB = $tenantService->tenantDatabaseExists($user->user_id2);
                            $dbName = $tenantService->getTenantDatabaseName($user->user_id2);

                            if ($hasTenantsDB) {
                                $usersWithTenants++;
                            } else {
                                $usersWithoutTenants++;
                            }

                            $tenantDatabases[] = [
                                'user_id' => $user->user_id2,
                                'email' => $user->user_email,
                                'tenant_db_name' => $dbName,
                                'tenant_exists' => $hasTenantsDB,
                                'tenant_setup_completed' => $user->tenant_setup_completed ?? false,
                                'tenant_created_at' => $user->tenant_created_at
                            ];
                        }

                        $diagnostic['users_with_tenants'] = $usersWithTenants;
                        $diagnostic['users_without_tenants'] = $usersWithoutTenants;
                        $diagnostic['tenant_databases'] = $tenantDatabases;

                        Log::info('✅ TENANT_DIAGNOSTIC: Información usuarios recopilada', [
                            'total_users' => $diagnostic['total_users'],
                            'with_tenants' => $usersWithTenants,
                            'without_tenants' => $usersWithoutTenants
                        ]);

                    } catch (Exception $e) {
                        $diagnostic['errors'][] = 'Error getting users info: ' . $e->getMessage();
                        Log::error('❌ TENANT_DIAGNOSTIC: Error info usuarios', ['error' => $e->getMessage()]);
                    }
                }

            } catch (Exception $e) {
                $diagnostic['errors'][] = 'TenantService initialization failed: ' . $e->getMessage();
                Log::error('❌ TENANT_DIAGNOSTIC: Error TenantService', ['error' => $e->getMessage()]);
            }

            // Determinar estado general del sistema
            if (empty($diagnostic['errors'])) {
                $diagnostic['system_status'] = 'healthy';
            } else {
                $diagnostic['system_status'] = 'issues_detected';
            }

            Log::info('🏁 TENANT_DIAGNOSTIC: Diagnóstico completado', [
                'status' => $diagnostic['system_status'],
                'errors_count' => count($diagnostic['errors'])
            ]);

            return response()->json([
                'result' => 1,
                'message' => 'Diagnóstico del sistema de tenants completado',
                'diagnostic' => $diagnostic
            ]);

        } catch (Exception $e) {
            Log::error('❌ TENANT_DIAGNOSTIC_ERROR: Error en diagnóstico', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'result' => 0,
                'message' => 'Error ejecutando diagnóstico: ' . $e->getMessage(),
                'diagnostic' => [
                    'timestamp' => now()->toISOString(),
                    'system_status' => 'error',
                    'error' => $e->getMessage()
                ]
            ]);
        }
    }
}