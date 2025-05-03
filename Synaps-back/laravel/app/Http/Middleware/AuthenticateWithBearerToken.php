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
    public function handle(Request $request, Closure $next)
    {
        // Obtener el header Authorization
        $authorizationHeader = $request->header('Authorization');

        if (!$authorizationHeader || !str_starts_with($authorizationHeader, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized: No Bearer Token'], Response::HTTP_UNAUTHORIZED);
        }

        // Extraer el token
        $token = substr($authorizationHeader, 7);

        try {
            // Decodificar el token JWT usando HS256
            $decoded = JWT::decode(
                $token,
                new Key(env('FLASK_SECRET_KEY', 'SYNAPS_SUPER_SECRET'), 'HS256')
            );

            // Inyectar usuario en el request (como array)
            $request->attributes->add([
                'token_data' => (array) $decoded
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Unauthorized: Invalid Token',
                'error' => $e->getMessage()
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
