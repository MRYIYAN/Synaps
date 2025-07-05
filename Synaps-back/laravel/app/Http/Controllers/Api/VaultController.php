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
use App\Helpers\AuthHelper;

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
   * @param  Request      $request     Datos de la consulta
   * @return JsonResponse              Resultado de la operación
   */
  public function index( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $vaults  = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];

      // Conectamos a la base de datos del usuario
      $user_db = DatabaseHelper::connect( $user_id );

      // Obtenemos todos los vaults del usuario
      $vaults = Vault::on( $user_db )
        ->where( 'user_id', $user_id )
        ->get();

      // Marcamos el resultado según el éxito de la operación
      $result = $vaults ? 1 : 0;
    }
    catch ( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y vaults
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'vaults'  => $vaults
      ], $result ? 200 : 500 );
    }
  }

    //---------------------------------------------------------------------------//
    //  Crear un nuevo vault                                                     //
    //---------------------------------------------------------------------------//

  /**
   * Crear un nuevo vault.
   *
   * @param  Request      $request     Datos del vault: vault_title, is_private, pin
   * @return JsonResponse              Resultado de la operación
   */
  public function store( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $vault   = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];

      // Validamos los datos recibidos
      $data = $request->validate( [
          'vault_title' => 'required|string|max:255'
        , 'is_private'  => 'boolean'
        , 'pin'         => 'nullable|string|max:8'
      ] );

      // Conectamos a la base de datos del usuario
      $user_db = DatabaseHelper::connect( $user_id );

      // Validación de PIN si es vault privada
      if( isset( $data['is_private'] ) && $data['is_private'] && isset( $data['pin'] ) && !empty( $data['pin'] ) )
      {
        if( strlen( $data['pin'] ) < 4 )
          throw new Exception( 'El PIN debe tener al menos 4 dígitos' );
      }

      // Verificamos que no exista otro vault con el mismo nombre
      $exists = Vault::on( $user_db )
        ->where( 'vault_title', $data['vault_title'] )
        ->where( 'user_id', $user_id )
        ->exists();

      // Si existe un vault con el mismo nombre, mostramos una alerta
      if( $exists == true )
        throw new Exception( 'Ya existe un vault con ese nombre' );

      // Preparamos los datos para crear el vault
      $vault_data = [
          'vault_id2'    => Str::uuid()->toString()
        , 'vault_title'  => $data['vault_title']
        , 'user_id'      => $user_id
        , 'is_private'   => $data['is_private'] ?? false
        , 'created_at'   => now()
      ];

      // Solo incluir PIN si se proporciona y la vault es privada
      if( isset( $data['is_private'] ) && $data['is_private'] && isset( $data['pin'] ) && !empty( $data['pin'] ) )
      {
        $vault_data['pin'] = $data['pin'];
      }

      // Creamos el nuevo vault en la base de datos del usuario
      $vault = Vault::on( $user_db )
        ->create( $vault_data );

      // Marcamos el resultado según el éxito de la operación
      $result = $vault ? 1 : 0;
    }
    catch ( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y vault creado
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'vault'   => $vault
      ], $result ? 201 : 500 );
    }
  }

    //---------------------------------------------------------------------------//
    //  Actualizar un vault existente                                           //
    //---------------------------------------------------------------------------//

  /**
   * Actualizar un vault existente.
   *
   * @param  Request      $request     Datos actualizados del vault: vault_title, is_private, pin
   * @param  string       $vault_id2   El ID del vault a actualizar
   * @return JsonResponse              Resultado de la operación
   */
  public function update( Request $request, string $vault_id2 ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $vault   = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];

      // Validamos los datos recibidos
      $data = $request->validate( [
          'vault_title' => 'required|string|max:255'
        , 'is_private'  => 'boolean'
        , 'pin'         => 'nullable|string|max:8'
      ] );

      // Conectamos a la base de datos del usuario
      $user_db = DatabaseHelper::connect( $user_id );

      // Validación de PIN si es vault privada
      if( isset( $data['is_private'] ) && $data['is_private'] && isset( $data['pin'] ) && !empty( $data['pin'] ) )
      {
        if( strlen( $data['pin'] ) < 4 )
          throw new Exception( 'El PIN debe tener al menos 4 dígitos' );
      }

      // Verificamos que el vault exists y pertenece al usuario
      $existing_vault = Vault::on( $user_db )
        ->where( 'vault_id2', $vault_id2 )
        ->where( 'user_id', $user_id )
        ->first();

      if( !$existing_vault )
        throw new Exception( 'Vault no encontrado o no tienes permisos para editarlo' );

      // Verificamos que no exista otro vault con el mismo nombre (excluyendo el actual)
      $exists = Vault::on( $user_db )
        ->where( 'vault_title', $data['vault_title'] )
        ->where( 'user_id', $user_id )
        ->where( 'vault_id2', '!=', $vault_id2 )
        ->exists();

      // Si existe otro vault con el mismo nombre, mostramos una alerta
      if( $exists == true )
        throw new Exception( 'Ya existe un vault con ese nombre' );

      // Preparamos los datos para actualizar
      $update_data = [
          'vault_title' => $data['vault_title']
        , 'is_private'  => $data['is_private'] ?? false
      ];

      // Solo actualizar PIN si se proporciona y la vault es privada
      if( isset( $data['is_private'] ) && $data['is_private'] && isset( $data['pin'] ) && !empty( $data['pin'] ) )
      {
        $update_data['pin'] = $data['pin'];
      }
      elseif( !( $data['is_private'] ?? false ) )
      {
        // Si la vault ya no es privada, remover el PIN
        $update_data['pin'] = null;
      }

      // Actualizamos el vault
      $updated = Vault::on( $user_db )
        ->where( 'vault_id2', $vault_id2 )
        ->where( 'user_id', $user_id )
        ->update( $update_data );

      if( $updated === 0 )
        throw new Exception( 'No se pudo actualizar el vault' );

      // Recuperamos el vault actualizado para la respuesta
      $vault = Vault::on( $user_db )
        ->where( 'vault_id2', $vault_id2 )
        ->first();

      // Marcamos el resultado según el éxito de la operación
      $result = $vault ? 1 : 0;
      $message = 'Vault actualizado exitosamente';
    }
    catch ( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y vault actualizado
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'vault'   => $vault
      ], $result ? 200 : 500 );
    }
  }

    //---------------------------------------------------------------------------//
    //  Verificar PIN de vault privado                                           //
    //---------------------------------------------------------------------------//

  /**
   * Verificar el PIN de acceso a un vault privado.
   *
   * @param  Request      $request     Datos con el PIN: pin
   * @param  string       $vault_id2   El ID del vault a verificar
   * @return JsonResponse              Resultado de la operación
   */
  public function verifyPin( Request $request, string $vault_id2 ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];

      // Validamos los datos recibidos
      $data = $request->validate( [
        'pin' => 'required|string|max:8'
      ] );

      // Conectamos a la base de datos del usuario
      $user_db = DatabaseHelper::connect( $user_id );

      // Buscamos el vault
      $vault = Vault::on( $user_db )
        ->where( 'vault_id2', $vault_id2 )
        ->where( 'user_id', $user_id )
        ->where( 'is_private', true )
        ->first();

      if( !$vault )
        throw new Exception( 'Vault no encontrado o no es privado' );

      // Verificamos el PIN
      if( (int)$vault->pin === (int)$data['pin'] )
      {
        $result = 1;
        $message = 'PIN correcto';
      }
      else
      {
        $message = 'PIN incorrecto';
      }
    }
    catch ( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado y mensaje
      return response()->json( [
          'result'  => $result
        , 'message' => $message
      ], $result ? 200 : 401 );
    }
  }
}