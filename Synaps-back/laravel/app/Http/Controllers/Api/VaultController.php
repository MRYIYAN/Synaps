<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vault;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use function App\Helpers\tenant;
use App\Helpers\DatabaseHelper;

//===========================================================================//
//                                CONTROLADOR VAULT                          //
//===========================================================================//

/**
 * Controlador para gestionar las operaciones relacionadas con los vaults.
 */
class VaultController extends Controller
{
    //---------------------------------------------------------------------------//
    //  Listar todos los vaults                                                  //
    //---------------------------------------------------------------------------//

    /**
     * Listar todos los vaults del usuario autenticado.
     *
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con la lista de vaults.
     */
    public function index(Request $request): JsonResponse
    {
<<<<<<< HEAD
        //======================//
        // LOGS DE DEPURACIÓN   //
        //======================//
        Log::debug('auth()->user():', [auth()->user()]);
        Log::debug('auth()->id():', [auth()->id()]);
        try {
            $user = auth()->user();
            $user_id = auth()->id();

            //===============================//
            // ENTRANDO AL CONTROLADOR VAULT //
            //===============================//
            Log::debug(' Entrando a VaultController@index', [
                'auth_user_id' => $user_id,
                'auth_user_email' => $user?->email,
            ]);
=======
        // Inicializamos variables de respuesta
        $result   = 0;
        $message  = '';
        $vaults   = [];
        
        try
        {
            // Capturamos el TOKEN de la petición
            // $jwt = $request->bearerToken();
            $jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlVzdWFyaW8gZGUgcHJ1ZWJhIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc0NzU5OTUzMiwiZXhwIjoxNzQ3NjAzMTMyLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjUwMDUiLCJhdWQiOiJhY2NvdW50In0.Ioxv4Sov_CnDKIP1fNjKGcgUEAW3Q2T83ceJ7MFMS8s';

            // Decodificamos el token para capturar sus datos
            $jwt_data = JWT::decode( $jwt, new Key( env( 'FLASK_SECRET_KEY' ), 'HS256' ) );

            /*
                Array | jwt_data
                [
                    [sub] => 1,
                    [email] => test@example.com,
                    [name] => Usuario de prueba,
                    [preferred_username] => test@example.com,
                    [iat] => 1747597332,
                    [exp] => 1747600932,
                    [iss] => http://localhost:5005/,
                    [aud] => account
                ]
            */

            // Capturamos los datos del JWT
            if( empty( $jwt_data->sub ) || empty( $jwt_data->email ) )
                throw new Exception( 'JWT inválido' );
            else
            {
                $user_id    = $jwt_data->sub;
                $user_email = $jwt_data->email;
            }

            // Inicializamos la sesión en MySQL para capturar los Vaults
            $user_db    = tenant( $user_id );
            $user_main  = tenant();

            // Si no se han enviado los datos obligatorios, hacemos saltar una excepción
            if( $user_id === 0 )
                throw new Exception( 'Usuario no autenticado' );
            
            // Buscar su user_id en la tabla 'users' de la base 'synaps'
            $user_row = User::on( $user_main )
                ->where( 'user_email', $user_email )
                ->firstOrFail();
>>>>>>> 9c98304 ([FEATURE] GVista de Galaxia conectada con la DB)

            //========================//
            // VALIDACIÓN DE USUARIO  //
            //========================//
            if (!$user_id) {
                return response()->json([
                    'error' => 'Token inválido',
                    'message' => 'auth()->id() es null',
                ], 401);
            }

<<<<<<< HEAD
            //==============================//
            // CONEXIÓN DINÁMICA AL TENANT  //
            //==============================//
            $connection = DatabaseHelper::connect($user_id);

            Log::debug(" Conectado a DB", [
                'db_connection' => $connection,
            ]);

            //=======================//
            // CONSULTA DE VAULTS    //
            //=======================//
            $vaults = Vault::all();

            //=========================//
            // RESPUESTA JSON          //
            //=========================//
            return response()->json($vaults);
        } catch (\Throwable $e) {
            //=========================//
            // LOG DE ERROR            //
            //=========================//
            Log::error(" Error al cargar vaults", [
                'exception' => $e,
            ]);
            return response()->json([
                'error' => 'Fallo en VaultController@index',
                'message' => $e->getMessage()
            ], 401);
=======
            // Buscar las vaults por user_id 
            $vaults = Vault::on( $user_db )
                ->where( 'user_id', $user_row->user_id )
                ->get();

            $result = 1;
        }
        catch( Exception $e )
        {
            $message = $e->getMessage();
        }
        finally
        {
            // Respuesta JSON
            return response()->json( [
                    'result'  => $result
                ,   'message' => $message
                ,   'vaults'   => $vaults
            ], $result ? 201 : 500 );
>>>>>>> 9c98304 ([FEATURE] GVista de Galaxia conectada con la DB)
        }
    }

    //---------------------------------------------------------------------------//
    //  Crear un nuevo vault                                                     //
    //---------------------------------------------------------------------------//

    /**
     * Crear un nuevo vault.
     *
     * @param  Request $request   La solicitud HTTP con los datos del vault.
     * @return \Illuminate\Http\JsonResponse
     */
    public function store( Request $request )
    {
        //=========================//
        // INICIALIZACIÓN DE VARIABLES DE RESPUESTA
        //=========================//
        $result   = 0;
        $message  = '';
        $vault    = [];

        try
        {
            //=========================//
            // OBTENER USER_ID Y CONECTAR TENANT
            //=========================//
            $user_id = auth()->id(); // Esto lo extrae del token JWT ya validado
            Log::debug( 'user_id usado:', [ $user_id ] );

            DatabaseHelper::connect($user_id); // Conectamos a la base de datos del usuario

            //=========================//
            // VALIDACIÓN DE USUARIO
            //=========================//
            if( !$user_id )
                throw new Exception( 'Usuario no autenticado' );

            //=========================//
            // VALIDACIÓN DE DATOS DEL VAULT
            //=========================//
            $validated = $request->validate( [
                'vault_title'   => 'required|string|max:255',
                'logical_path'  => 'required|string|max:255',
                'is_private'    => 'boolean'
            ] );

            $vault_id2 = Str::uuid()->toString();
            $insertData = [
                'vault_id2'     => $vault_id2,
                'vault_title'   => $validated['vault_title'],
                'user_id'       => $user_id,
                'logical_path'  => $validated['logical_path'],
                'is_private'    => $validated['is_private'] ?? false,
                'created_at'    => now()
            ];

            Log::debug('Datos a insertar:', [$insertData]); //  INSERTAR ESTA LÍNEA

            DB::connection('tenant')->table('vaults')->insert($insertData); //  Aquí se hace la inserción

            Log::debug(' Insert OK'); //  LUEGO DE INSERTAR

            //============================================//
            // RECUPERAR EL VAULT CREADO PARA LA RESPUESTA
            //============================================//
            $vault = DB::connection('tenant')
                ->table('vaults')
                ->where('vault_id2', $vault_id2)
                ->first();

            $result = 1;
        }
        catch( Exception $e )
        {
            $message = $e->getMessage();
            Log::error(' Error al crear vault:', [
                'message' => $message,
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
        }
        finally
        {
            //=========================//
            // RESPUESTA JSON FINAL
            //=========================//
            return response()->json( [
                'data'    => $vault,
                'message' => $message,
                'result'  => $result
            ], $result ? 201 : 500 );
        }
    }
}