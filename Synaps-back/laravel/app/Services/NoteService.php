<?php

/**
 * @file NoteService.php
 * @description Servicio para obtener notas propias y compartidas de un usuario
 */

namespace App\Services;

use App\Models\Note;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

use App\Helpers\DatabaseHelper;
//---------------------------------------------------------------------------//
//                        Clase NoteService                                  //
//---------------------------------------------------------------------------//
/**
 * Clase que proporciona métodos para interactuar con las notas de un usuario,
 * incluyendo la obtención de notas propias y compartidas.
 */
//---------------------------------------------------------------------------//

class NoteService
{
  /**
   * Devuelve todas las notas (propias + compartidas) de un usuario
   *
   * @param int     $user_id Identificador del usuario
   * @param int     $user_id Identificador del folder padre
   * @param string  $query Consulta de búsqueda
   * @return Collection
   */
  public static function GetNotes( int $user_id, string $query = '', int $parent_id = 0 ) : Collection
  {
    // Inicializamos las conexiones de DB
    $user_db = DatabaseHelper::connect( $user_id );
    $main_db = DatabaseHelper::connect();

    // Inicializamos la consulta filtrando por las notas del usuario
    // Recorremos cada nota y añade el atributo source = 'own'
    $own_notes = Note::on( $user_db )
      ->get()
      ->when( !empty( $query ), fn( $q ) => $q->where( 'note_title', 'LIKE', "$query" ) )
      ->when( $parent_id != 0, fn( $q ) => $q->where( 'parent_id', '=', $parent_id ) )
      ->each( fn( $note ) => $note->setAttribute( 'source', 'own' ) );

    // Inicializamos una consulta sobre note_shares en la DB central
    $relations = DB::connection( $main_db )
      ->table( 'note_shares' )
      ->where( 'user_id', $user_id )
      ->get()
      ->groupBy( 'owner_id' );

    // Inicializamos una conexión con las notas compartidas
    $shared_notes = collect();

    // Iteramos cada relación y la buscamos en la DB del owner
    foreach( $relations as $owner_id => $group )
    {
      $owner_db = DatabaseHelper::connect( $owner_id );

      // Capturamos el array de note_id2 del grupo de relaciones
      $note_ids = $group->pluck( 'note_id2' )->all();

      // Buscamos las notas del propietario
      $notes = Note::on( $owner_db )
        ->when( !empty( $query ), fn( $q ) => $q->where( 'note_title', 'LIKE', "$query" ) )
        ->whereIn( 'note_id2', $note_ids )
        ->when( $parent_id != 0, fn( $q ) => $q->where( 'parent_id', '=', $parent_id ) )
        ->get()
        ->each( fn( $note ) => $note->setAttribute( 'source', 'shared' ) );

      // Añadimos las notas al array original
      $shared_notes = $shared_notes->concat( $notes );
    }

    // Combinamos las notas propias y compartidas y devuelve la colección reindexada
    return $own_notes->concat( $shared_notes )->values();
  }

  //---------------------------------------------------------------------------//
  //                          Métodos CRUD de notas                         //
  //---------------------------------------------------------------------------//
  /**
   * Lee una nota concreta por su identificador.
   *
   * @param string $note_id2 Identificador de la nota
   * @return Note|null
   */
  //---------------------------------------------------------------------------//

  public function readNote($note_id2)
  {
    // 1. Intentar obtener desde Redis
    $redis_key = 'synaps:note:' . $note_id2;
    $cached_md = Redis::get($redis_key);

    if ($cached_md !== null) {
        dd('[REDIS] Cargando markdown desde cache:', $cached_md);
        // Crear un objeto simulado con solo lo necesario
        return (object)[
            'note_id2' => $note_id2,
            'note_markdown' => $cached_md
        ];
    }

    // 2. Si no está en Redis, buscar en base de datos
    $note = Note::where('note_id2', $note_id2)->first();

    return $note;
  }
}