<?php

//===========================================================================//
//                            HELPER DATABASE                                //
//===========================================================================//
//  Helper para cambiar la base de datos activa de la conexión mysql         //
//  en tiempo de ejecución según el tenant (usuario).                        //
//===========================================================================//

namespace App\Helpers;

use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Clase de utilidad para gestionar conexiones dinámicas a bases de datos tenant.
 */
class DatabaseHelper
{
    /**
     * Cambia la conexión activa a la base de datos del tenant correspondiente.
     *
     * @param int|string|null  $user_identifier  ID numérico del usuario o user_id2
     * @return string   Nombre de la conexión configurada ('tenant')
     */
    public static function connect( $user_identifier = null ): string
    {
        // Si es global, devolvemos la conexión por defecto
        if( $user_identifier === null )
            return config( 'database.default' );

        try {
            // Buscar el usuario y obtener el nombre de su base de datos tenant
            $user = null;
            
            if (is_numeric($user_identifier)) {
                // Buscar por user_id (ID numérico)
                $user = User::on('mysql')->where('user_id', $user_identifier)->first();
            } else {
                // Buscar por user_id2 (string)
                $user = User::on('mysql')->where('user_id2', $user_identifier)->first();
            }

            if (!$user) {
                Log::warning('DATABASE_HELPER: Usuario no encontrado', [
                    'user_identifier' => $user_identifier
                ]);
                return config( 'database.default' );
            }

            // Verificar si el usuario tiene BD tenant asignada
            if (!$user->tenant_database_name || !$user->tenant_setup_completed) {
                Log::info('DATABASE_HELPER: Usuario sin BD tenant, creando automáticamente', [
                    'user_id' => $user->user_id,
                    'user_id2' => $user->user_id2,
                    'user_email' => $user->user_email
                ]);
                
                // Crear BD tenant automáticamente
                try {
                    $tenantService = new \App\Services\TenantService();
                    $tenantService->createTenantDatabase($user->user_id2, $user->user_email);
                    
                    // Recargar usuario para obtener datos actualizados
                    $user->refresh();
                    
                    Log::info('DATABASE_HELPER: BD tenant creada automáticamente', [
                        'user_id' => $user->user_id,
                        'tenant_db' => $user->tenant_database_name
                    ]);
                } catch (\Exception $tenantError) {
                    Log::error('DATABASE_HELPER: Error creando BD tenant automáticamente', [
                        'user_id' => $user->user_id,
                        'error' => $tenantError->getMessage()
                    ]);
                    return config( 'database.default' );
                }
            }

            $databaseName = $user->tenant_database_name;

            Log::info('DATABASE_HELPER: Conectando a BD tenant', [
                'user_id' => $user->user_id,
                'user_id2' => $user->user_id2,
                'tenant_database' => $databaseName
            ]);

            // Inyecta la nueva conexión en runtime con el nombre 'tenant'
            config( [
                'database.connections.tenant' => [
                    'driver'    => 'mysql',
                    'host'      => env( 'DB_HOST', '127.0.0.1' ),
                    'port'      => env( 'DB_PORT', '3306' ),
                    'database'  => $databaseName,
                    'username'  => env( 'DB_USERNAME', 'root' ),
                    'password'  => env( 'DB_PASSWORD', '' ),
                    'charset'   => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'prefix'    => '',
                    'prefix_indexes' => true,
                ]
            ] );

            return 'tenant';
            
        } catch (\Exception $e) {
            Log::error('DATABASE_HELPER_ERROR: Error conectando a tenant', [
                'user_identifier' => $user_identifier,
                'error' => $e->getMessage()
            ]);
            return config( 'database.default' );
        }
    }
}
