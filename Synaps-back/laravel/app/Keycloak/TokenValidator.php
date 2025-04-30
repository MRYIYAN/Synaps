<?php
namespace App\Keycloak;

use Closure;
use Exception;
use Illuminate\Contracts\Validation\ValidationRule;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

class TokenValidator implements ValidationRule
{
  public function validate( string $attribute, mixed $value, Closure $fail ): void
  {
    // Capturamos el token
    $token = $value;
    if( !$token )
    {
      $fail( 'Token not provided' );
      return;
    }

    try
    {
      // Obtenemos la clave secreta HS256 de la configuración
      $secret = config( 'keycloak-middleware.secret' );

      // Decodificamos y verificamos firma HS256
      $decoded = JWT::decode( $token, new Key( $secret, 'HS256' ) );

      // Guardamos los datos
      request()->attributes->set( 'token_data', ( array ) $decoded );
    }
    catch( ExpiredException $e )
    {
      $fail( 'Token expired' );
    }
    catch( SignatureInvalidException $e )
    {
      $fail( 'Invalid token signature' );
    }
    catch( Exception $e )
    {
      $fail( 'Token is not valid' );
    }
  }
}