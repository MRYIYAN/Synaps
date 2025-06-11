<?php

//===========================================================================//
//                             TENANT SERVICE                                //
//===========================================================================//
//----------------------------------------------------------------------------//
//  Este servicio gestiona la creación y configuración de bases de datos     //
//  tenant para usuarios. Se encarga de crear la base de datos, ejecutar     //
//  migraciones y poblar con datos iniciales.                                //
//----------------------------------------------------------------------------//

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Database\Seeders\TenantSeeder;
use Illuminate\Support\Facades\Artisan;
use App\Helpers\DatabaseHelper;

/**
 * Servicio responsable de la gestión de tenants en Synaps.
 */
class TenantService
{
  /**
   * Crear un nuevo tenant (base de datos) para un usuario
   *
   * @param int $user_id ID del usuario
   * @return bool true si se creó exitosamente
   * @throws Exception si ocurre algún error
   */
  public static function createTenantForUser( int $user_id ): bool
  {
    // Inicializar value con valor por defecto
    $value = false;
    
    try
    {
      Log::info( 'TENANT_SERVICE: Iniciando creación de tenant', [
        'user_id' => $user_id
      ] );

      // Crear la base de datos
      self::createDatabase( $user_id );

      // Siempre ejecutar init.sql de la carpeta SQL
      Log::info( 'TENANT_SERVICE: Usando init.sql para inicialización' );

      Log::info( 'TENANT_SERVICE: Tenant creado exitosamente', [
        'user_id' => $user_id
      ] );

      $value = true;

    }
    catch( Exception $e )
    {
      Log::error( '❌ TENANT_SERVICE_ERROR: Error creando tenant', [
        'user_id' => $user_id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ] );
      
      // Limpiar base de datos si se creó parcialmente
      self::cleanupFailedTenant( $user_id );
      
      throw $e;
    }
    
    // Retornar value
    return $value;
  }

  /**
   * Crear la base de datos para el tenant
   *
   * @param int $user_id ID del usuario
   * @throws Exception si no se puede crear la base de datos
   */
  private static function createDatabase( int $user_id ): void
  {
    $database_name = 'synaps_' . str_pad( (string)$user_id, 4, '0', STR_PAD_LEFT );
    
    Log::info( 'TENANT_SERVICE: Creando base de datos', [
      'user_id' => $user_id,
      'database_name' => $database_name
    ] );

    DB::statement( "CREATE DATABASE IF NOT EXISTS `{$database_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci" );
    
    // Ejecutar init.sql si existe
    self::executeInitSQL( $user_id );
  }

  /**
   * Ejecutar migraciones en el tenant
   *
   * @param int $user_id ID del usuario
   * @throws Exception si las migraciones fallan
   */
  private static function runMigrations( int $user_id ): void
  {
    Log::info( 'TENANT_SERVICE: Ejecutando migraciones tenant', [
      'user_id' => $user_id
    ] );

    // Establecer conexión tenant
    $tenant = DatabaseHelper::connect( $user_id );
    
    // Ejecutar migraciones específicas del tenant (incluyendo legacy tables)
    $exit_code = Artisan::call( 'migrate', [
      '--database' => $tenant,
      '--path' => 'database/migrations/tenant',
      '--force' => true
    ] );

    if( $exit_code !== 0 )
      throw new Exception( 'Error ejecutando migraciones tenant' );

    Log::info( 'TENANT_SERVICE: Migraciones ejecutadas correctamente', [
      'user_id' => $user_id
    ] );
  }

  /**
   * Poblar tenant con datos iniciales
   *
   * @param int $user_id ID del usuario
   * @throws Exception si el seeding falla
   */
  private static function seedInitialData( int $user_id ): void
  {
    Log::info( 'TENANT_SERVICE: Poblando con datos iniciales', [
      'user_id' => $user_id
    ] );

    // Establecer conexión tenant
    $tenant = DatabaseHelper::connect( $user_id );
    
    try
    {
      // Ejecutar seeding manual directamente para mayor control
      self::seedDataManually( $tenant );

    }
    catch( Exception $e )
    {
      Log::error( 'TENANT_SERVICE: Error en seeding de datos', [
        'user_id' => $user_id,
        'error' => $e->getMessage()
      ] );
      throw new Exception( 'Error poblando datos iniciales: ' . $e->getMessage() );
    }

    Log::info( 'TENANT_SERVICE: Datos iniciales insertados', [
      'user_id' => $user_id
    ] );
  }

  /**
   * Poblar datos manualmente sin usar Artisan
   *
   * @param string $tenant Nombre de la conexión tenant
   * @throws Exception si el seeding manual falla
   */
  private static function seedDataManually( string $tenant ): void
  {
    try
    {
      // Instanciar y ejecutar el seeder manualmente
      $seeder = new TenantSeeder();
      
      // Configurar temporalmente la conexión por defecto
      $originalConnection = config( 'database.default' );
      config( [ 'database.default' => $tenant ] );
      
      // Ejecutar el seeder
      $seeder->run();
      
      // Restaurar conexión original
      config( [ 'database.default' => $originalConnection ] );
      
      Log::info( 'TENANT_SERVICE: Seeding manual exitoso' );
    }
    catch( Exception $e )
    {
      Log::error( 'TENANT_SERVICE: Error en seeding manual', [
        'error' => $e->getMessage()
      ] );
      throw new Exception( 'Error en seeding manual: ' . $e->getMessage() );
    }
  }

  /**
   * Limpiar tenant que falló en la creación
   *
   * @param int $user_id ID del usuario
   */
  private static function cleanupFailedTenant( int $user_id ): void
  {
    try
    {
      $database_name = 'synaps_' . str_pad( (string)$user_id, 4, '0', STR_PAD_LEFT);
      
      Log::warning( 'TENANT_SERVICE: Limpiando tenant fallido', [
        'user_id' => $user_id,
        'database_name' => $database_name
      ] );

      DB::statement( "DROP DATABASE IF EXISTS `{$database_name}`" );
    }
    catch( Exception $e )
    {
      Log::error( '❌ TENANT_SERVICE_CLEANUP_ERROR: Error limpiando tenant fallido', [
        'user_id' => $user_id,
        'error' => $e->getMessage()
      ] );
    }
  }

  /**
   * Verificar si un tenant existe
   *
   * @param int $user_id ID del usuario
   * @return bool true si el tenant existe
   */
  public static function tenantExists( int $user_id ): bool
  {
    // Inicializar value con valor por defecto
    $value = false;
    
    $database_name = 'synaps_' . str_pad( (string)$user_id, 4, '0', STR_PAD_LEFT );
    $result = DB::select( "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?", [$database_name] );
    
    if( !empty( $result ) )
      $value = true;
    
    // Retornar value
    return $value;
  }

  /**
   * Ejecutar el archivo init.sql en la base de datos del tenant
   *
   * @param int $user_id ID del usuario
   * @throws Exception si no se puede ejecutar el SQL
   */
  private static function executeInitSQL( int $user_id ): void
  {
    $database_name = self::getTenantDatabaseName( $user_id );
    $init_sql_path = base_path( 'SQL/init.sql' );
    
    // Verificar si existe el archivo init.sql
    if( !file_exists( $init_sql_path ) )
    {
      Log::warning( 'TENANT_SERVICE: Archivo init.sql no encontrado', [
        'path' => $init_sql_path
      ] );
      return;
    }
    
    try
    {
      Log::info( 'TENANT_SERVICE: Ejecutando init.sql', [
        'user_id' => $user_id,
        'database' => $database_name
      ] );
      
      // Leer el contenido del archivo
      $sql_content = file_get_contents( $init_sql_path );
      
      // Establecer conexión tenant usando DatabaseHelper
      $tenant_connection = DatabaseHelper::connect( $user_id );
      
      // Ejecutar todo el contenido SQL de una vez usando la conexión del tenant
      DB::connection( $tenant_connection )->unprepared( $sql_content );
      
      Log::info( 'TENANT_SERVICE: init.sql ejecutado exitosamente', [
        'user_id' => $user_id
      ] );
    }
    catch( Exception $e )
    {
      Log::error( 'TENANT_SERVICE: Error ejecutando init.sql', [
        'user_id' => $user_id,
        'error' => $e->getMessage()
      ] );
      
      throw new Exception( 'Error ejecutando init.sql: ' . $e->getMessage() );
    }
  }

  /**
   * Obtener el nombre de la base de datos del tenant
   *
   * @param int $user_id ID del usuario
   * @return string Nombre de la base de datos
   */
  public static function getTenantDatabaseName( int $user_id ): string
  {
    // Inicializar value con valor por defecto
    $value = '';
    
    $value = 'synaps_' . str_pad( (string)$user_id, 4, '0', STR_PAD_LEFT );
    
    // Retornar value
    return $value;
  }

  /**
   * Eliminar un tenant completamente
   *
   * @param int $user_id ID del usuario
   * @return bool true si se eliminó exitosamente
   */
  public static function deleteTenant( int $user_id ): bool
  {
    // Inicializar value con valor por defecto
    $value = false;
    
    try
    {
      $database_name = self::getTenantDatabaseName( $user_id );
      
      Log::warning( 'TENANT_SERVICE: Eliminando tenant', [
        'user_id' => $user_id,
        'database_name' => $database_name
      ] );

      DB::statement( "DROP DATABASE IF EXISTS `{$database_name}`" );

      Log::info( 'TENANT_SERVICE: Tenant eliminado', [
        'user_id' => $user_id
      ] );

      $value = true;
    }
    catch( Exception $e )
    {
      Log::error( '❌ TENANT_SERVICE_DELETE_ERROR: Error eliminando tenant', [
        'user_id' => $user_id,
        'error' => $e->getMessage()
      ] );
    }
    
    // Retornar value
    return $value;
  }
}
