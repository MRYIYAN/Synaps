<?php

// -------------------------------------------------------------------------------------------
// FolderNoteController.php
// -------------------------------------------------------------------------------------------

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use App\Models\FolderNote;
use Exception;

use function App\Helpers\tenant;

/**
 * Controlador para crear carpetas en Synaps.
 */
class FolderNoteController extends Controller
{
  /**
   * Crea una nueva carpeta.
   *
   * @param  Request      $request     Datos de la carpeta: parent_id2
   * @return JsonResponse              Resultado de la operación
   */
  public function addFolder( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result   = 0;
    $message  = '';
    $folder   = [];

    // Validamos los datos recibidos
    $data = $request->validate( [
        'newFolderName' => 'required|string|max:255'
      , 'parent_id2'    => 'nullable|string'
    ] );

    try
    {
      // Obtenemos el identificador del usuario autenticado
      // $user_id = ( int ) $request->user()->id;
      $user_id  = 1;
      $user_id2 = 'F7D8S9FG78F9DG78D9F7G89DF789FDGU';

      // Inicializamos las conexiones de DB
      $user_db  = tenant( $user_id );

      // Calculamos el parent_id (0 = root)
      $parent_id = 0;
      if( !empty( $data['parent_id2'] ) )
      {
        // Buscamos la carpeta según el parent_id2
        $parent = FolderNote::on( $user_db )
          ->where( 'folder_id2', $data['parent_id2'] )
          ->first();

        // Capturamos el id
        $parent_id = ( int ) $parent->folder_id;
      }

      // Devuelve si existen una carpeta en el mismo nivel y con el mismo nombre
      $exists = FolderNote::on( $user_db )
        ->where( 'parent_id', $parent_id )
        ->where( 'folder_title', $data['newFolderName'] )
        ->exists(); // bool

      // Si existe una carpeta en el mismo nivel y con el mismo nombre, mostramos una alerta
      if( $exists == true )
        throw new Exception( 'Esta carpeta ya existe' );

      // Si no es Root, incrementamos el número de hijos del padre
      if( $parent_id !== 0 )
        $parent->incrementChildrenCount();

      // Creamos la nueva carpeta en la base de datos del usuario
      $folder = FolderNote::on( $user_db )
        ->create( [
            'folder_id2'     => Str::random( 32 )
          , 'folder_title'   => $data['newFolderName']
          , 'parent_id'      => $parent_id
          , 'children_count' => 0
        ] );

      // Determinamos si la operación fue exitosa
      $result = $folder ? 1 : 0;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con el resultado y la carpeta creada
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'folder'  => $folder
      ], $result ? 201 : 500 );
    }
  }
}