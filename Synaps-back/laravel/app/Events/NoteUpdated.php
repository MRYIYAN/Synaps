<?php

namespace App\Events;

use App\Models\Note;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

/**
 * Evento que se lanza cuando una nota es actualizada.
 *
 * @property Note $note      Nota actualizada
 * @property int  $user_id   ID del usuario que realiza la acción (para ignorar eco)
 */
class NoteUpdated implements ShouldBroadcastNow
{
  /**
   * Nota actualizada
   * @var Note
   */
  public Note $note;

  /**
   * ID del usuario que realiza la acción (para ignorar eco)
   * @var int
   */
  public int $user_id;

  /**
   * Constructor del evento NoteUpdated.
   *
   * @param Note $note     Nota actualizada
   * @param int  $user_id  ID del usuario que realiza la acción
   */
  public function __construct( Note $note, int $user_id )
  {
    $this->note    = $note;
    $this->user_id = $user_id;
  }

  /**
   * Canal de broadcast en Redis.
   *
   * @return Channel
   */
  public function broadcastOn(): Channel
  {
    return new Channel( 'backend:updates:notes.' . $this->note->note_id2 );
  }

  /**
   * Datos enviados en el broadcast.
   *
   * @return array
   */
  public function broadcastWith(): array
  {
      return [
          'uuid'       => $this->note->note_id2
        , 'markdown'   => $this->note->markdown
        , 'updated_at' => $this->note->last_update_date->toISOString()
        , 'user_id'    => $this->user_id
      ];
  }
}