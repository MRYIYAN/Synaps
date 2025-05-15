<?php

// -------------------------------------------------------------------------------------------
// NoteController.php
// -------------------------------------------------------------------------------------------

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

use App\Models\FolderNote;
use App\Models\Note;
use App\Services\NoteService;
use Illuminate\Support\Str;
use Exception;
use function App\Helpers\tenant;

/**
 * Controlador para crear notas y carpetas en Synaps.
 */
class NoteController extends Controller
{
  /**
   * Crea una nueva nota.
   *
   * @param  Request      $request     Datos de la nota: newNoteName
   * @return JsonResponse              Resultado de la operación
   */
  public function addNote( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $note    = [];

    // Validamos los datos recibidos
    $data = $request->validate( [
        'newNoteName' => 'required|string|max:255'
      , 'parent_id2'  => 'nullable|string'
    ] );

    try
    {
      // Obtenemos el identificador del usuario autenticado
      // $user_id = ( int ) $request->user()->id;
      $user_id = 1;
      $user_db = tenant( $user_id );

      // Calculamos el parent_id (0 = root)
      $parent_id = 0;
      if( !empty( $data['parent_id2'] ) )
      {
        // Buscamos la carpeta según el parent_id2
        $parent = FolderNote::on( $user_db )
          ->where( 'folder_id2', $data['parent_id2'] )
          ->firstOrFail();

        // En caso de que no exista el registro en esa tabla, buscamos si es una nota y capturamos el padre
        if( $parent )
          $parent_id = ( int ) $parent->folder_id;
        
        else
        {
          // Si no hay carpeta, intentamos encontrar una nota con ese id2
          $note = Note::on( $user_db )
            ->where( 'note_id2', $data['parent_id2'] )
            ->first();

          // Si la encontramos, guardamos el ID2 del padre
          if( $note )
            $parent_id = ( int ) $note->parent_id;
        }
      }

      // Devuelve si existen una nota en el mismo nivel y con el mismo nombre
      $exists = Note::on( $user_db )
        ->where( 'parent_id', $parent_id )
        ->where( 'note_title', $data['newNoteName'] )
        ->exists(); // bool

      // Si existe una nota en el mismo nivel y con el mismo nombre, mostramos una alerta
      if( $exists == true )
        throw new Exception( 'Esta nota ya existe' );

      // Si no es Root, incrementamos el número de hijos del padre
      if( $parent_id !== 0 )
        $parent->incrementChildrenCount();

      // Creamos la nueva nota en la base de datos del usuario
      $note = Note::on( $user_db )
        ->create( [
            'note_id2'         => Str::random( 32 )
          , 'note_title'       => $data['newNoteName']
          , 'insert_date'      => now()
          , 'last_update_date' => now()
          , 'parent_id'        => $parent_id
        ] );

      // Marcamos el resultado según el éxito de la operación
      $result = $note ? 1 : 0;
    }
    catch ( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y nota creada
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'note'    => $note
      ], $result ? 201 : 500 );
    }
  }

  /**
   * GET /api/getNotes
   *
   * @param  Request      $request
   * @return JsonResponse              Resultado y lista plana de notas
   */
  public function getNotes( Request $request ): JsonResponse
  {
    // Validamos los datos recibidos
    $data = $request->validate( [
      'parent_id' => 'nullable|integer'
    ] );

    // Identificador del usuario autenticado
    // $user_id = ( int ) $request->user()->id;
    $user_id = 1;
    $user_db = tenant( $user_id );

    // Obtenemos todas las notas (propias + compartidas)
    $notes = NoteService::GetNotes( $user_id, $data['parent_id'] );

    // Obtenemos todas las carpetas del usuario
    $folders = FolderNote::on( $user_db )
      ->select( [ 'folder_id', 'folder_id2', 'folder_title', 'parent_id' ] )
      ->where( 'parent_id', '=', $data['parent_id'] )
      ->get();

    // Mapeamos notas al formato común { id2, title, parent_id }
    $notesArray = $notes
      ->map( fn( $note ) => [
          'id'        => $note->note_id
        , 'id2'       => $note->note_id2
        , 'title'     => $note->note_title
        , 'parent_id' => $note->parent_id
        , 'type'      => 'note'
      ] )
      ->toArray();

    // Mapeamos carpetas al mismo formato
    $foldersArray = $folders
      ->map( fn( $folder ) => [
          'id'        => $folder->folder_id
        , 'id2'       => $folder->folder_id2
        , 'title'     => $folder->folder_title
        , 'parent_id' => $folder->parent_id
        , 'type'      => 'folder'
      ] )
      ->toArray();

    // Unimos ambos arrays
    $items = array_merge( $foldersArray, $notesArray );

    // Devolvemos resultado y datos
    return response()->json( [
        'result'  => 1
      , 'items'   => $items
    ] );
  }
}