<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use App\Keycloak\TokenValidator;

class ValidateKeycloakToken
{
    public function handle( Request $request, Closure $next, $scopes = '*', $roles = '*' ): Response
    {
        // Placeholder para una posible respuesta de error
        $error_response = null;

        // Extraemos el token Bearer
        $token = $request->bearerToken();

        // Validamos presencia y firma del token
        $validator = Validator::make(
            ['token' => $token],
            ['token' => ['required', new TokenValidator()]]
        );

        // Si falla la validación, 
        if( $validator->fails() )
        {
            // Datos del error
            $error_data = [
                    'result'    => 0
                ,   'message'   => 'Invalid token'
                ,   'errors'    => $validator->errors()
                ,   'data'      => null
            ];

            // Creamos la respuesta
            $error_response = response()->json( $error_data, 401 );
        }

        // Si pasó la validación, comprobamos scopes/roles
        elseif( $this->accessDenied( $request, $scopes, $roles ) )
        {
            // Datos del error
            $error_data = [
                    'result'    => 0
                ,   'message'   => 'Access Denied'
                ,   'errors'    => null
                ,   'data'      => null
            ];

            // Creamos la respuesta
            $error_response = response()->json( $error_data, 403 );
        }

        // Si hubo error, lo devolvemos
        // Si no, pasamos al siguiente middleware/controlador
        $response = $error_response ?: $next( $request );
        return $response;
    }

    private function accessDenied( Request $request, string $scopes, string $roles ): bool
    {
        $value = false;

        // Convertimos los scopes de string a array
        $route_scopes = explode( '|', $scopes );
        $route_roles  = explode( '|', $roles );

        // Capturamos los datos y los roles del token
        $token_data   = $request->attributes->get( 'token_data' );
        $token_scope  = explode( ' ', $token_data['scope'] );
        $token_roles  = $token_data['realm_access']->roles;

        // Si los scopes y los roles no están dentro del array de roles, devolvemos false
        $value = !(
            $this->checkExists( $route_scopes, $token_scope ) &&
            $this->checkExists( $route_roles,  $token_roles )
        );

        return $value;
    }

    private function checkExists( array $needles, array $haystack ): bool
    {
        $value = false;

        do
        {
            // Si encontramos el comodín, devolvemos true de inmediato
            if( in_array( '*', $needles, true ) ) 
            {
                $value = true;
                break;
            }

            // array_intersect devuelve los valores comunes
            // Si no está vacío, hay al menos un match
            $value = count( array_intersect( $needles, $haystack ) ) > 0;
            break;

        } while( false );

        return $value;
    }
}
