<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vault;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        //======================//
        // LOGS DE DEPURACIÓN   //
        //======================//
        Log::debug( 'auth()->user():', [auth()->user()] );
        Log::debug( 'auth()->id():', [auth()->id()] );

        try
        {
            $user       = auth()->user();
            $user_id    = auth()->id();

            //===============================//
            // ENTRANDO AL CONTROLADOR VAULT //
            //===============================//
            Log::debug( 'Entrando a VaultController@index', [
                'auth_user_id'      => $user_id,
                'auth_user_email'   => $user?->email,
            ] );

            //========================//
            // VALIDACIÓN DE USUARIO  //
            //========================//
            if( !$user_id )
            {
                return response()->json( [
                    'error'     => 'Token inválido',
                    'message'   => 'auth()->id() es null',
                ], 401);
            }

            //==============================//
            // CONEXIÓN DINÁMICA AL TENANT  //
            //==============================//
            $connection = DatabaseHelper::connect( $user_id );

            Log::debug( 'Conectado a DB', [
                'db_connection' => $connection,
            ] );

            //=======================//
            // CONSULTA DE VAULTS    //
            //=======================//
            $vaults = Vault::all();

            //=========================//
            // RESPUESTA JSON          //
            //=========================//
            return response()->json( $vaults );
        }
        catch( Exception $e )
        {
            //=========================//
            // LOG DE ERROR            //
            //=========================//
            Log::error( "Error al cargar vaults", [
                'exception' => $e,
            ] );
            
            return response()->json( [
                'error'     => 'Fallo en VaultController@index',
                'message'   => $e->getMessage()
            ], 401);
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

            DatabaseHelper::connect( $user_id ); // Conectamos a la base de datos del usuar io

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

            Log::debug( 'Datos a insertar:', [$insertData] );

            DB::connection( 'tenant' )->table( 'vaults' )->insert( $insertData); //  Aquí se hace la inserci ón

            Log::debug( 'Insert OK' ); //  LUEGO DE INSERTAR

            //============================================//
            // RECUPERAR EL VAULT CREADO PARA LA RESPUESTA
            //============================================//
            $vault = DB::connection( 'tenant' )
                ->table( 'vaults' )
                ->where( 'vault_id2', $vault_id2 )
                ->first();

            $result = 1;
        }
        catch( Exception $e )
        {
            $message = $e->getMessage();
            Log::error( 'Error al crear vault:', [
                'message'   => $message,
                'trace'     => $e->getTraceAsString(),
                'request'   => $request->all(),
            ] );
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