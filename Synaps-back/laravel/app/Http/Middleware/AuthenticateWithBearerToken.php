<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

//===========================================================================//
//                                MIDDLEWARE                                 //
//===========================================================================//

/**
 * Middleware para autenticar solicitudes usando un token Bearer.
 */
class AuthenticateWithBearerToken
{
    /**
     * Manejar una solicitud entrante.
     *
     * @param Request $request La solicitud HTTP.
     * @param Closure $next La siguiente acción en la cadena de middleware.
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        //---------------------------------------------------------------------------//
        //  Obtener el header Authorization                                          //
        //---------------------------------------------------------------------------//
        $authorizationHeader = $request->header('Authorization');

        if (!$authorizationHeader || !str_starts_with($authorizationHeader, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized: No Bearer Token'], Response::HTTP_UNAUTHORIZED);
        }

        //---------------------------------------------------------------------------//
        //  Extraer el token                                                        //
        //---------------------------------------------------------------------------//
        $token = substr($authorizationHeader, 7);

        try {
            $secretKey = env('HS256_KEY') ?? env('FLASK_SECRET_KEY', 'SYNAPS_SUPER_SECRET');
            \Log::debug('TOKEN:', [$token]);
            \Log::debug('HS256_KEY:', [$secretKey]);
            // Envuelve el decode en try-catch para respuesta JSON clara
            try {
                $payload = JWT::decode($token, new Key($secretKey, 'HS256'));

                // Setear el usuario autenticado en Laravel
                $user = new \App\Models\User();
                $user->user_id = intval($payload->sub ?? 0); //  usa el ID numérico del token
                $user->user_email = $payload->email ?? null;
                $user->user_name = $payload->name ?? null;

                // Inyectar el payload decodificado como array
                $request->attributes->add([
                    'token_data' => (array) $payload
                ]);
                // Setear el user_id correcto en los atributos de la request
                $request->attributes->set('user_id', intval($payload->sub ?? 0)); 
                // Setear el usuario autenticado en el request
                $request->setUserResolver(function () use ($payload) {
                    return (array) $payload;
                });
                auth()->setUser($user); // necesario para que auth funcione correctamente

            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Token inválido o expirado',
                    'message' => $e->getMessage()
                ], 401);
            }

        } catch (Exception $e) {
            //---------------------------------------------------------------------------//
            //  Manejar errores de decodificación del token                             //
            //---------------------------------------------------------------------------//
            return response()->json([
                'message' => 'Token inválido',
                'error' => $e->getMessage()
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
