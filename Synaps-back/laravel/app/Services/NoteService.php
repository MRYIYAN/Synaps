<?php
/**
 * @file NoteService.php
 * @description Servicio para obtener notas propias y compartidas de un usuario
 */
declare( strict_types=1 );

namespace App\Services;

use App\Models\Note;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use function App\Helpers\tenant;

class NoteService
{
  /**
   * Devuelve todas las notas (propias + compartidas) de un usuario
   *
   * @param int $user_id Identificador del usuario
   * @return Collection
   */
  public static function GetNotes( int $user_id, int $parent_id ) : Collection
  {
    // Inicializamos las conexiones de DB
    $user_db  = tenant( $user_id );
    $main_db  = tenant();

    // Inicializamos la consulta filtrando por las notas del usuario
    // NoteEachOwn - Recorre cada nota y añade el atributo source = 'own'
    $own_notes = Note::on( $user_db )
      ->get()
      ->where( 'parent_id', '=', $parent_id )
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
      $owner_db = tenant( $owner_id );

      // Capturamos el array de note_id2 del grupo de relaciones
      $note_ids = $group->pluck( 'note_id2' )->all();

      // Buscamos las notas del propietario
      $notes = Note::on( $owner_db )
        ->whereIn( 'note_id2', $note_ids )
        ->where( 'parent_id', '=', $parent_id )
        ->get()
        ->each( fn( $note ) => $note->setAttribute( 'source', 'shared' ) );

      // Añadimos las notas al array original
      $shared_notes = $shared_notes->concat( $notes );
    }

    // Combinamos las notas propias y compartidas y devuelve la colección reindexada
    return $own_notes->concat( $shared_notes )->values();
  }
}