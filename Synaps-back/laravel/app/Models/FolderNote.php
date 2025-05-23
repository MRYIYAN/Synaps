<?php

/**
 * @file FolderNote.php
 * @description Modelo Eloquent para manejar carpetas en el árbol de FoldersNodes
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class FolderNote extends Model
{
  /**
   * Nombre de la tabla en la base de datos
   *
   * @var string
   */
  protected $table = 'folders_notes';

  /**
   * Clave primaria de la tabla
   *
   * @var string
   */
  protected $primaryKey = 'folder_id';

  /**
   * Tipo de la clave primaria (incremental integer)
   *
   * @var bool
   */
  public $incrementing  = true;
  protected $keyType    = 'int';

  /**
   * Desactiva timestamps automáticos (created_at, updated_at)
   *
   * @var bool
   */
  public $timestamps = false;

  /**
   * Campos asignables en asignación masiva
   *
   * @var array
   */
  protected $fillable = [
      'folder_id2'
    , 'folder_title'
    , 'vault_id'
    , 'parent_id'
    , 'children_count'
  ];

  /**
   * Bootstrap del modelo para generar folder_id2 automáticamente
   */
  protected static function booted()
  {
    static::creating( function( FolderNote $folder ) {
      // Genera un identificador único de 32 caracteres
      $folder->folder_id2 = ( string ) Str::random( 32 );
        
      // Inicializamos children_count a 0 si no está definido
      if ( is_null( $folder->children_count ) )
        $folder->children_count = 0;
    } );
  }

  /**
   * Relación uno a muchos: hijos de esta carpeta
   */
  public function children()
  {
    return $this->hasMany( FolderNote::class, 'parent_id', 'folder_id' );
  }

  /**
   * Relación inversa: carpeta padre
   */
  public function parent()
  {
    return $this->belongsTo( FolderNote::class, 'parent_id', 'folder_id' );
  }

  /**
   * Incrementa el contador de hijos
   *
   * @return void
   */
  public function incrementChildrenCount() : void
  {
    $this->increment( 'children_count' );
  }

  /**
   * Decrementa el contador de hijos
   *
   * @return void
   */
  public function decrementChildrenCount() : void
  {
    $this->decrement( 'children_count' );
  }
}
