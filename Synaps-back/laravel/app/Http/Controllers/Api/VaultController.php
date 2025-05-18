<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Models\Vault;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use function App\Helpers\tenant;

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
    public function index( Request $request )
    {
        // Inicializamos variables de respuesta
        $result   = 0;
        $message  = '';
        $vault    = [];
        
        try
        {
            // Capturamos los datos del usuario de la sesión
            $user    = $request->user();
            $user_id = $user['user_id'];
            $user_db = tenant( $user_id );

            // Si no se han enviado los datos obligatorios, hacemos saltar una excepción
            if( empty( $user ) || $user_id === 0 )
                throw new Exception( 'Usuario no autenticado' );
            
            // Buscar su user_id en la tabla 'users' de la base 'synaps'
            $user_row = DB::on( tenant() )
                ->table( 'users' )
                ->where( 'user_email', $user['email'] )
                ->first();

            // Si no existe este usuario en la DB, hacemos saltar una excepción
            if( !$user_row )
                throw new Exception( 'Usuario no encontrado' );

            // Buscar las vaults por user_id 
            $vaults = DB::on( $user_db )
                ->table( 'vaults' )
                ->where( 'user_id', $user_row->user_id )
                ->get();
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
                ,   'vault'   => $vault
            ], $result ? 201 : 500 );
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
        // Inicializamos variables de respuesta
        $result   = 0;
        $message  = '';
        $vault    = [];

        try
        {
            // Obtenemos el identificador del usuario
            $user_id = $request->get( 'user_id' );
            Log::debug( 'user_id usado:', [ $user_id ] );

            $user_db = tenant( $user_id );

            // Validamos que exista el usuario
            if( !$user_id )
                throw new Exception( 'Usuario no autenticado' );

            // Validamos los datos del vault
            $validated = $request->validate( [
                    'vault_title'   => 'required|string|max:255'
                ,   'logical_path'  => 'required|string|max:255'
                ,   'is_private'    => 'boolean'
            ] );

            // ------------------------------------------------------------
            // Creación del Vault
            // ------------------------------------------------------------

            // Creamos el vault en la base de datos
            $vault = Vault::on( $user_db )
                ->create( [
                        'vault_id2'     => Str::uuid()->toString()
                    ,   'vault_title'   => $validated['vault_title']
                    ,   'user_id'       => $user_id
                    ,   'logical_path'  => $validated['logical_path']
                    ,   'is_private'    => $validated['is_private'] ?? false
                    ,   'created_at'    => now()
                ] );

            // Si llegamos hasta aquí está todo OK
            $result = 1;
        }
        catch( Exception $e )
        {
            // Guardamos mensaje de error
            $message = $e->getMessage();
            Log::error( $message );
        }
        finally
        {
            // Respuesta JSON
            return response()->json( [
                    'result'  => $result
                ,   'message' => $message
                ,   'vault'   => $vault
            ], $result ? 201 : 500 );
        }
    }
}