<?php

/**
 * @file DatabaseHelper.php
 * @description Helper para cambiar la base de datos activa de la conexión mysql en tiempo de ejecución.
 *
 * @package App\Helpers
 */

namespace App\Helpers;

use Illuminate\Support\Facades\Config;

/**
 * Devuelve el nombre de la conexión para un tenant dado.
 *
 * @param int|null $tenant_id ID numérico del tenant (null = conexión default)
 * @return string             Nombre de la conexión configurada
 */
function tenant( ?int $tenant_id = null ) : string
{
  // Si es global, devolvemos la conexión por defecto
  if( $tenant_id === null )
    return config( 'database.default' );

  // Nombre único para esta conexión
  $conn_name = 'tenant_' . $tenant_id;

  // Construimos el nombre de la base de datos: synaps_0001, synaps_0002, …
  $db_name = 'synaps_' . str_pad( (string)$tenant_id, 4, '0', STR_PAD_LEFT );

  // Clonamos la configuración mysql y cambiamos la base de datos
  $base = config( 'database.connections.mysql' );
  $base['database'] = $db_name;

  // Inyectamos la nueva conexión en runtime
  Config::set( "database.connections.{$conn_name}", $base );

  return $conn_name;
}