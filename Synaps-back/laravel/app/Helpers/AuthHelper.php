<?php

// -------------------------------------------------------------------------------------------
// AuthHelper.php
// -------------------------------------------------------------------------------------------

namespace App\Helpers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Helper para manejo de autenticación de usuarios.
 */
class AuthHelper
{
  /**
   * Obtiene el ID del usuario autenticado con validación.
   *
   * @return array Retorna ['user_id' => int|null, 'user_id2' => string|null, 'error_response' => JsonResponse|null]
   */
  public static function getAuthenticatedUserId(): array
  {
    // Inicializamos los valores a devolver
    $user_id = null;
    $user_id2 = null;
    $message = '';

    try
    {
      // Obtenemos el usuario completo autenticado usando el guard por defecto
      Log::debug('AUTH_HELPER: Intentando obtener usuario con guard por defecto');
      $user = Auth::user();
      
      if( !$user )
        throw new Exception( 'Usuario no autenticado' );

      $user_id = $user->user_id;
      $user_id2 = $user->user_id2;
      
      Log::debug('AUTH_HELPER: IDs obtenidos', ['user_id' => $user_id, 'user_id2' => $user_id2]);
      
      if( !$user_id )
        throw new Exception( 'Usuario no autenticado' );
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      return [
          'user_id' => $user_id
        , 'user_id2' => $user_id2
        , 'error_response' => $message ? response()->json( [
            'result' => 0
          , 'message' => $message
        ], 401 ) : null
      ];
    }
  }

  /**
   * Obtiene todos los datos del usuario autenticado.
   *
   * @return array Retorna ['result' => int, 'user' => User|null, 'error_response' => JsonResponse|null]
   */
  public static function getAuthenticatedUser(): array
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $user    = null;

    try
    {
      // Obtenemos el usuario autenticado completo usando el guard por defecto
      // $user = $request->user();
      $user = Auth::user();
      
      if( !$user )
        throw new Exception( 'Usuario no autenticado' );

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      return [
          'result'  => $result
        , 'message' => $message
        , 'user'    => $user
      ];
    }
  }

  /**
   * Obtiene los datos básicos del usuario autenticado con formato consistente.
   *
   * @return array Retorna ['result' => int, 'user_id' => int|null, 'user_data' => array, 'message' => string]
   */
  public static function getAuthUserData(): array
  {
    // Inicializamos los valores a devolver
    $result    = 0;
    $message   = '';
    $user_id   = null;
    $user_data = [];

    try
    {
      // Obtenemos el usuario autenticado completo
      // $user = $request->user();
      $user = Auth::user();
      
      if( !$user )
        throw new Exception( 'Usuario no autenticado' );

      // Extraemos los datos básicos del usuario
      $user_id = $user->id;
      $user_data = [
          'id'    => $user->id
        , 'name'  => $user->name ?? ''
        , 'email' => $user->email ?? ''
        , 'created_at' => $user->created_at ?? null
        , 'updated_at' => $user->updated_at ?? null
      ];

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      return [
          'result' => $result
        , 'message' => $message
        , 'user_id' => $user_id
        , 'user_data' => $user_data
      ];
    }
  }

  /**
   * Requiere que el usuario esté autenticado, lanza excepción si no lo está.
   *
   * @return int ID del usuario autenticado
   * @throws Exception Si el usuario no está autenticado
   */
  public static function requireAuthenticatedUserId(): int
  {
    $user_id = Auth::id();
    
    if( !$user_id )
      throw new Exception( 'Usuario no autenticado' );
    
    return $user_id;
  }

  /**
   * Requiere que el usuario esté autenticado, lanza excepción si no lo está.
   *
   * @return \Illuminate\Contracts\Auth\Authenticatable Usuario autenticado
   * @throws Exception Si el usuario no está autenticado
   */
  public static function requireAuthenticatedUser(): \Illuminate\Contracts\Auth\Authenticatable
  {
    $user = Auth::user();
    
    if( !$user )
      throw new Exception( 'Usuario no autenticado' );
    
    return $user;
  }
}
