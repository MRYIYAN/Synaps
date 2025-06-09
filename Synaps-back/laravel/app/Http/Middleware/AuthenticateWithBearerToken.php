<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use App\Models\User;

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
        Log::debug('MIDDLEWARE_START:', ['timestamp' => now(), 'url' => $request->url()]);
        
        $token = null;

        if ($request->hasHeader('Authorization')) {
            $authHeader = $request->header('Authorization');
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            return new JsonResponse(['error' => 'Token no proporcionado'], 401);
        }

        $key = env('FLASK_SECRET_KEY');
        Log::debug('TOKEN:', [$token]);
        Log::debug('HS256_KEY:', [$key]);

        try {
            $payload = JWT::decode($token, new Key($key, 'HS256'));
            $payload = (array)$payload;
            
            Log::debug('DECODED_PAYLOAD:', $payload);

            $user_id = $payload['sub'] ?? null;
            Log::debug('USER_ID_FROM_TOKEN:', [$user_id]);
            
            if (!$user_id) {
                return new JsonResponse(['error' => 'Token inválido: sin ID'], 401);
            }

            // Log before attempting to find user
            Log::debug('ATTEMPTING_USER_FIND:', ['user_id' => $user_id, 'db_connection' => config('database.default')]);
            
            try {
                $user = User::find($user_id);
                Log::debug('USER_FOUND:', [$user ? $user->toArray() : null]);
            } catch (\Exception $e) {
                Log::error('USER_FIND_ERROR:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
                return new JsonResponse(['error' => 'Token inválido o expirado: ' . $e->getMessage()], 401);
            }

            if (!$user) {
                return new JsonResponse(['error' => 'Usuario no encontrado'], 401);
            }

            // Asegurar que el usuario es una instancia válida del modelo User
            if (!($user instanceof User)) {
                Log::error('USER_NOT_INSTANCE:', ['type' => gettype($user), 'class' => get_class($user)]);
                return new JsonResponse(['error' => 'Error interno de autenticación'], 500);
            }

            // Configurar el usuario en el guard web por defecto
            Auth::setUser($user);
            Log::debug('USER_SET_SUCCESSFULLY', ['user_id' => $user->user_id, 'guard' => 'web']);
        } catch (ExpiredException $e) {
            Log::error('JWT_EXPIRED_ERROR:', ['message' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Token expirado'], 401);
        } catch (SignatureInvalidException $e) {
            Log::error('JWT_SIGNATURE_ERROR:', ['message' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Token inválido: firma incorrecta'], 401);
        } catch (\Exception $e) {
            Log::error('JWT_DECODE_ERROR:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return new JsonResponse(['error' => 'Token inválido o expirado: ' . $e->getMessage()], 401);
        }

        return $next($request);
    }
}
