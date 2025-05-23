<?php

/**
 * @file NoteLinkService.php
 * @description Servicio para gestionar los enlaces (back-links) entre notas.
 */

namespace App\Services;

use App\Models\Note;
use App\Models\NoteLink;
use Illuminate\Support\Collection;
use App\Helpers\DatabaseHelper;

//===========================================================================//
//                           SERVICIO NOTE-LINKS                             //
//===========================================================================//

class NoteLinkService
{
  //-------------------------------------------------------------------------//
  //   GET                                                                   //
  //-------------------------------------------------------------------------//

  /**
   * Devuelve todas las notas enlazadas a una nota origen.
   *
   * @param  int   $user_id  Identificador del usuario (tenant)
   * @param  int   $note_id  note_id de la nota origen
   * @return array           [ result, message, items ]
   */
  public static function Get( int $user_id, int $note_id ): array
  {
    $result  = 0;
    $message = '';
    $items   = collect();

    try
    {
      // Conectamos a la BD del tenant
      $tenant = DatabaseHelper::connect( $user_id );

      // IDs de notas enlazadas
      $linked_ids = NoteLink::on( $tenant )
        ->where( 'note_id', $note_id )
        ->pluck( 'linked_note_id' )
        ->all();

      // Si hay enlaces, recuperamos las notas
      if( !empty( $linked_ids ) )
      {
        $items = Note::on( $tenant )
          ->whereIn( 'note_id', $linked_ids )
          ->get();
      }

      $result = 1;
    }
    catch( \Throwable $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      return [
          'result'  => $result
        , 'message' => $message
        , 'items'   => $items->values()
      ];
    }
  }

  //-------------------------------------------------------------------------//
  //   ADD                                                                   //
  //-------------------------------------------------------------------------//

  /**
   * Crea un enlace $from_id → $to_id si no existe.
   *
   * @param  int   $user_id  Identificador del usuario
   * @param  int   $from_id  note_id origen
   * @param  int   $to_id    note_id destino
   * @return array           [ result, message, items ]
   */
  public static function Add( int $user_id, int $from_id, int $to_id ): array
  {
    $result  = 0;
    $message = '';
    $items   = [];

    try
    {
      if( $from_id === $to_id )
        throw new \Exception( 'Un enlace no puede apuntar a la misma nota.' );

      $tenant = DatabaseHelper::connect( $user_id );

      // ¿Existe ya?
      $exists = NoteLink::on( $tenant )
        ->where( 'note_id',        $from_id )
        ->where( 'linked_note_id', $to_id )
        ->exists();

      // Creamos si no existe
      if( !$exists )
      {
        $items = NoteLink::on( $tenant )->create( [
          'note_id'        => $from_id,
          'linked_note_id' => $to_id
        ] );
      }

      $result = 1; // aunque ya existiera, la operación es “correcta”
    }
    catch( \Throwable $e )
    {
      $message = $e->getMessage();
      $items   = [];
    }
    finally
    {
      return [
          'result'  => $result
        , 'message' => $message
        , 'items'   => $items
      ];
    }
  }

  //-------------------------------------------------------------------------//
  //   REMOVE                                                                //
  //-------------------------------------------------------------------------//

  /**
   * Elimina el enlace $from_id → $to_id.
   *
   * @param  int   $user_id  Identificador del usuario
   * @param  int   $from_id  note_id origen
   * @param  int   $to_id    note_id destino
   * @return array           [ result, message, items ]
   */
  public static function Remove( int $user_id, int $from_id, int $to_id ): array
  {
    $result  = 0;
    $message = '';
    $items   = 0; // nº de filas eliminadas

    try
    {
      $tenant = DatabaseHelper::connect( $user_id );

      $items = NoteLink::on( $tenant )
        ->where( 'note_id',        $from_id )
        ->where( 'linked_note_id', $to_id )
        ->delete();

      $result = 1;
    }
    catch( \Throwable $e )
    {
      $message = $e->getMessage();
      $items   = 0;
    }
    finally
    {
      return [
          'result'  => $result
        , 'message' => $message
        , 'items'   => $items      // 0 ó 1 filas eliminadas
      ];
    }
  }
}