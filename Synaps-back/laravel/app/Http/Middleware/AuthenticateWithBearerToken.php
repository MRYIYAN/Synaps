<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithBearerToken
{
    public function handle( Request $request, Closure $next )
    {
        // Inicializamos el resultado y mensaje
        $result  = 0;
        $message = '';

        try
        {
            // Obtenemos el header Authorization
            $authorization_header = $request->header( 'Authorization' );

            // Comprobamos si existe el header y es tipo Bearer
            if( !$authorization_header || !str_starts_with( $authorization_header, 'Bearer ' ) )
                throw new Exception( 'Unauthorized: No Bearer Token' );

            // Extraemos el token eliminando 'Bearer '
            $token = substr( $authorization_header, 7 );

            // Decodificamos el token JWT usando HS256
            $decoded = JWT::decode( $token, new Key( env( 'FLASK_SECRET_KEY', 'SYNAPS_SUPER_SECRET' ), 'HS256' ) );

            // Inyectamos los datos del usuario en el request como array
            $request->attributes->add( [
                'token_data' => ( array ) $decoded
            ] );

            // Pasamos al siguiente middleware/controlador
            return $next( $request );
        }
        catch( Exception $e )
        {
            // En caso de excepción, devolvemos respuesta de error
            $message = $e->getMessage();

            return response()->json( [
                'result'  => $result,
                'message' => $message,
            ], Response::HTTP_UNAUTHORIZED );
        }
    }
}
