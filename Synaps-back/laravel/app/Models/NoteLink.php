<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

//===========================================================================//
//                              MODELO NOTE LINK                             //
//===========================================================================//

/**
 * Modelo Eloquent para la tabla `notes_links`.
 *
 * Representa la relación de enlaces (back-links) entre dos notas.
 */
class NoteLink extends Model
{
  /**
   * Nombre de la tabla asociada.
   *
   * @var string
   */
  protected $table = 'notes_links';

  /**
   * La tabla no usa una clave primaria autoincremental tradicional.
   * (la clave es compuesta -- `note_id` + `linked_note_id`).
   *
   * @var bool
   */
  public $incrementing = false;

  /**
   * Tipo de la clave primaria.
   *
   * @var string
   */
  protected $keyType = 'int';

  /**
   * Indica si el modelo debe gestionar timestamps.
   *
   * @var bool
   */
  public $timestamps = false;

  /**
   * Conexión de base de datos que debe utilizar este modelo.
   *
   * @var string
   */
  protected $connection = 'tenant'; // ← cambia a 'tenant' en tiempo de ejecución

  /**
   * Campos que pueden ser asignados de manera masiva.
   *
   * @var array
   */
  protected $fillable = [
    'note_id',
    'linked_note_id',
  ];
}