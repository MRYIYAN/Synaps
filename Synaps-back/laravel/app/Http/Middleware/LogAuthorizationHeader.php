<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Middleware para registrar el encabezado Authorization en los logs.
 */
class LogAuthorizationHeader
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
        if($request->hasHeader('Authorization')) {
            Log::info('Authorization Header:', [
                'token' => $request->header('Authorization')
            ]);
        }

        return $next($request);
    }
}
