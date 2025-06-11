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
            Log::info('VAULT_CONTROLLER: Antes de conectar a tenant', [
                'user_id' => $user_id,
                'user_id_type' => gettype($user_id),
                'user_object' => $user ? $user->toArray() : null
            ]);
            
            $connection = DatabaseHelper::connect( $user_id );

            Log::debug( 'Conectado a DB', [
                'db_connection' => $connection,
            ] );

            //=======================//
            // CONSULTA DE VAULTS    //
            //=======================//
            try {
                // Usar la conexión apropiada (tenant o default)
                if($connection === 'tenant') {
                    $vaults = DB::connection('tenant')->table('vaults')->get();
                } else {
                    // Fallback a la BD principal si no hay tenant disponible
                    $vaults = Vault::all();
                }
            } catch (\Exception $dbError) {
                Log::warning('VAULT_CONTROLLER: Error accediendo a BD tenant, usando BD principal', [
                    'user_id' => $user_id,
                    'connection' => $connection,
                    'error' => $dbError->getMessage()
                ]);
                
                // Fallback a la BD principal
                $vaults = Vault::all();
            }

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
                'is_private'    => 'boolean',
                'pin'           => 'nullable|string|max:8'
            ] );

            //=========================//
            // VALIDACIÓN DE PIN SI ES VAULT PRIVADA
            //=========================//
            if($validated['is_private'] && isset($validated['pin']) && !empty($validated['pin'])) {
                if(strlen($validated['pin']) < 4) {
                    throw new Exception('El PIN debe tener al menos 4 dígitos');
                }
            }

            //=========================//
            // VERIFICAR QUE NO EXISTA OTRO VAULT CON EL MISMO NOMBRE
            //=========================//
            $duplicateVault = DB::connection('tenant')
                ->table('vaults')
                ->where('vault_title', $validated['vault_title'])
                ->where('user_id', $user_id)
                ->first();

            if($duplicateVault) {
                throw new Exception('Ya existe un vault con ese nombre');
            }

            $vault_id2 = Str::uuid()->toString();
            $insertData = [
                'vault_id2'     => $vault_id2,
                'vault_title'   => $validated['vault_title'],
                'user_id'       => $user_id,
                'logical_path'  => $validated['logical_path'],
                'is_private'    => $validated['is_private'] ?? false,
                'created_at'    => now()
            ];

            // Solo incluir PIN si se proporciona y la vault es privada
            if($validated['is_private'] && isset($validated['pin']) && !empty($validated['pin'])) {
                $insertData['pin'] = $validated['pin'];
            }

            Log::debug( 'Datos a insertar:', [$insertData] );

            DB::connection( 'tenant' )->table( 'vaults' )->insert( $insertData ); //  Aquí se hace la inserci ón

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

    //---------------------------------------------------------------------------//
    //  Actualizar un vault existente                                           //
    //---------------------------------------------------------------------------//

    /**
     * Actualizar un vault existente.
     *
     * @param  Request $request   La solicitud HTTP con los datos actualizados del vault.
     * @param  string $vault_id2  El ID del vault a actualizar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $vault_id2): JsonResponse
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
            Log::debug('Actualizando vault:', ['user_id' => $user_id, 'vault_id2' => $vault_id2]);

            DatabaseHelper::connect($user_id); // Conectamos a la base de datos del usuario

            //=========================//
            // VALIDACIÓN DE USUARIO
            //=========================//
            if(!$user_id) {
                throw new Exception('Usuario no autenticado');
            }

            //=========================//
            // VALIDACIÓN DE DATOS DEL VAULT
            //=========================//
            $validated = $request->validate([
                'vault_title'   => 'required|string|max:255',
                'is_private'    => 'boolean',
                'pin'           => 'nullable|string|max:8'
            ]);

            //=========================//
            // VALIDACIÓN DE PIN SI ES VAULT PRIVADA
            //=========================//
            if($validated['is_private'] && isset($validated['pin']) && !empty($validated['pin'])) {
                if(strlen($validated['pin']) < 4) {
                    throw new Exception('El PIN debe tener al menos 4 dígitos');
                }
            }

            //=========================//
            // VERIFICAR QUE EL VAULT EXISTE Y PERTENECE AL USUARIO
            //=========================//
            $existingVault = DB::connection('tenant')
                ->table('vaults')
                ->where('vault_id2', $vault_id2)
                ->where('user_id', $user_id)
                ->first();

            if(!$existingVault) {
                throw new Exception('Vault no encontrado o no tienes permisos para editarlo');
            }

            //=========================//
            // VERIFICAR QUE NO EXISTA OTRO VAULT CON EL MISMO NOMBRE
            //=========================//
            $duplicateVault = DB::connection('tenant')
                ->table('vaults')
                ->where('vault_title', $validated['vault_title']) 
                ->where('user_id', $user_id)
                ->where('vault_id2', '!=', $vault_id2) // Excluir el vault actual
                ->first();

            if($duplicateVault) {
                throw new Exception('Ya existe un vault con ese nombre');
            }

            //=========================//
            // PREPARAR DATOS PARA ACTUALIZACIÓN
            //=========================//
            $updateData = [
                'vault_title'   => $validated['vault_title'],
                'is_private'    => $validated['is_private'] ?? false
            ];

            // Solo actualizar PIN si se proporciona y la vault es privada
            if($validated['is_private'] && isset($validated['pin']) && !empty($validated['pin'])) {
                $updateData['pin'] = $validated['pin'];
            } elseif(!$validated['is_private']) {
                // Si la vault ya no es privada, remover el PIN
                $updateData['pin'] = null;
            }

            Log::debug('Datos a actualizar:', $updateData);

            //=========================//
            // ACTUALIZAR EL VAULT
            //=========================//
            $updated = DB::connection('tenant')
                ->table('vaults')
                ->where('vault_id2', $vault_id2)
                ->where('user_id', $user_id)
                ->update($updateData);

            if($updated === 0) {
                throw new Exception('No se pudo actualizar el vault');
            }

            Log::debug('Update OK');

            //============================================//
            // RECUPERAR EL VAULT ACTUALIZADO PARA LA RESPUESTA
            //============================================//
            $vault = DB::connection('tenant')
                ->table('vaults')
                ->where('vault_id2', $vault_id2)
                ->first();

            $result = 1;
            $message = 'Vault actualizado exitosamente';
        }
        catch (Exception $e) {
            $message = $e->getMessage();
            Log::error('Error al actualizar vault:', [
                'message'   => $message,
                'trace'     => $e->getTraceAsString(),
                'request'   => $request->all(),
                'vault_id2' => $vault_id2,
            ]);
        }
        finally {
            //=========================//
            // RESPUESTA JSON FINAL
            //=========================//
            return response()->json([
                'data'    => $vault,
                'message' => $message,
                'result'  => $result
            ], $result ? 200 : 500);
        }
    }

    //---------------------------------------------------------------------------//
    //  Verificar PIN de vault privado                                           //
    //---------------------------------------------------------------------------//

    /**
     * Verificar el PIN de acceso a un vault privado.
     *
     * @param  Request $request   La solicitud HTTP con el PIN.
     * @param  string $vault_id2  El ID del vault a verificar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyPin(Request $request, string $vault_id2): JsonResponse
    {
        //=========================//
        // INICIALIZACIÓN DE VARIABLES DE RESPUESTA
        //=========================//
        $result   = 0;
        $message  = '';

        try
        {
            //=========================//
            // OBTENER USER_ID Y CONECTAR TENANT
            //=========================//
            $user_id = auth()->id();
            Log::debug('Verificando PIN para vault:', ['user_id' => $user_id, 'vault_id2' => $vault_id2]);

            DatabaseHelper::connect($user_id);

            //=========================//
            // VALIDACIÓN DE USUARIO
            //=========================//
            if(!$user_id) {
                throw new Exception('Usuario no autenticado');
            }

            //=========================//
            // VALIDACIÓN DE DATOS
            //=========================//
            $validated = $request->validate([
                'pin' => 'required|string|max:8'
            ]);

            //=========================//
            // BUSCAR EL VAULT
            //=========================//
            $vault = DB::connection('tenant')
                ->table('vaults')
                ->where('vault_id2', $vault_id2)
                ->where('user_id', $user_id)
                ->where('is_private', true)
                ->first();

            if(!$vault) {
                throw new Exception('Vault no encontrado o no es privado');
            }

            //=========================//
            // VERIFICAR PIN
            //=========================//
            if((int)$vault->pin === (int)$validated['pin']) {
                $result = 1;
                $message = 'PIN correcto';
            } else {
                $message = 'PIN incorrecto';
            }

            Log::debug('Resultado verificación PIN:', ['result' => $result, 'message' => $message]);
        }
        catch (Exception $e) {
            $message = $e->getMessage();
            Log::error('Error al verificar PIN:', [
                'message'   => $message,
                'trace'     => $e->getTraceAsString(),
                'request'   => $request->all(),
                'vault_id2' => $vault_id2,
            ]);
        }
        finally {
            //=========================//
            // RESPUESTA JSON FINAL  
            //=========================//
            return response()->json([
                'message' => $message,
                'result'  => $result
            ], $result ? 200 : 401);
        }
    }
}
