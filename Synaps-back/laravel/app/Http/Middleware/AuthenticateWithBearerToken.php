<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User; //  NECESARIO

/**
 * Middleware para autenticar solicitudes usando un token Bearer JWT.
 *
 * Extrae el token del header Authorization, lo decodifica y
 * establece el usuario autenticado en el contexto de Laravel.
 *
 * @package App\Http\Middleware
 */
class AuthenticateWithBearerToken
{
    /**
     * Maneja una solicitud entrante y autentica usando JWT Bearer.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $token = null;

        if ($request->hasHeader('Authorization')) {
            $authHeader = $request->header('Authorization');
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        $key = env('FLASK_SECRET_KEY');
        Log::debug('TOKEN:', [$token]);
        Log::debug('HS256_KEY:', [$key]);

        try {
            $payload = JWT::decode($token, new Key($key, 'HS256'));
            $payload = (array)$payload;

            $user_id = $payload['sub'] ?? null;
            if (!$user_id) {
                return response()->json(['error' => 'Token inválido: sin ID'], 401);
            }

            $user = User::find($user_id); //  Este sí es Authenticatable

            if (!$user) {
                return response()->json(['error' => 'Usuario no encontrado'], 401);
            }

            auth()->setUser($user); //  Debe funcionar
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }

        return $next($request);
    }
}
