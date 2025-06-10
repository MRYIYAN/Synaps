<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\TenantService;
use App\Models\User;

class EnsureTenantDatabase
{
    /**
     * Handle an incoming request.
     *
     * Asegura que el usuario autenticado tenga su base de datos tenant creada
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Solo aplicar a usuarios autenticados
        if (!auth()->check()) {
            return $next($request);
        }

        try {
            $user = auth()->user();
            
            Log::info('ENSURE_TENANT: Verificando BD tenant para usuario', [
                'user_id' => $user->user_id,
                'user_email' => $user->user_email,
                'has_tenant_db' => !empty($user->tenant_database_name),
                'tenant_setup_completed' => $user->tenant_setup_completed
            ]);

            // Verificar si el usuario necesita BD tenant
            if (!$user->tenant_database_name || !$user->tenant_setup_completed) {
                
                Log::info('ENSURE_TENANT: Creando BD tenant faltante', [
                    'user_id' => $user->user_id,
                    'user_id2' => $user->user_id2,
                    'user_email' => $user->user_email
                ]);

                // Crear BD tenant automáticamente
                $tenantService = new TenantService();
                $result = $tenantService->createTenantDatabase($user->user_id2, $user->user_email);
                
                if ($result) {
                    Log::info('ENSURE_TENANT: BD tenant creada exitosamente', [
                        'user_id' => $user->user_id
                    ]);
                } else {
                    Log::warning('ENSURE_TENANT: No se pudo crear BD tenant', [
                        'user_id' => $user->user_id
                    ]);
                }
            }

        } catch (\Exception $e) {
            Log::error('ENSURE_TENANT_ERROR: Error verificando/creando BD tenant', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Continuar con la solicitud aunque haya error
            // El sistema debería funcionar con fallback a BD principal
        }

        return $next($request);
    }
}
