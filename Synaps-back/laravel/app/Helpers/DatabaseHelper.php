<?php

//===========================================================================//
//                            HELPER DATABASE                                //
//===========================================================================//
//  Helper para cambiar la base de datos activa de la conexión mysql         //
//  en tiempo de ejecución según el tenant (usuario).                        //
//===========================================================================//

namespace App\Helpers;

/**
 * Clase de utilidad para gestionar conexiones dinámicas a bases de datos tenant.
 */
class DatabaseHelper
{
    /**
     * Cambia la conexión activa a la base de datos del tenant correspondiente.
     *
     * @param int|null  $tenant_id  ID numérico del tenant (usuario)
     * @return string   Nombre de la conexión configurada ('tenant')
     */
    public static function connect( ?int $tenant_id = null ): string
    {
        // Si es global, devolvemos la conexión por defecto
        if( $tenant_id === null )
            return config( 'database.default' );

        // Construye el nombre de la base de datos: synaps_0001, synaps_0002, ...
        $databaseName = 'synaps_' . str_pad( (string)$tenant_id, 4, '0', STR_PAD_LEFT );

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
    }
}
