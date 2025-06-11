<?php

// -------------------------------------------------------------------------------------------
// FolderNoteController.php
// -------------------------------------------------------------------------------------------

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

use App\Models\FolderNote;
use App\Models\Note;
use App\Http\Controllers\NoteController;
use Exception;

use App\Helpers\DatabaseHelper;
use App\Helpers\AuthHelper;

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
      , 'vault_id'      => 'required|integer'
    ] );

    // Capturamos el vault_id del request
    $vault_id = ( int ) $data['vault_id'];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] )
        throw new Exception( 'Usuario no autenticado' );
      
      $user_id  = $auth_result['user_id'];

      // Inicializamos las conexiones de DB
      $user_db = DatabaseHelper::connect( $user_id );

      // Calculamos el parent_id (0 = root)
      $parent_id = 0;
      if( !empty( $data['parent_id2'] ) )
      {
        // Buscamos la carpeta según el parent_id2
        $parent = FolderNote::on( $user_db )
          ->where( 'folder_id2', $data['parent_id2'] )
          ->first();

        // Capturamos el id
        if( $parent && $parent->folder_id )
          $parent_id = ( int ) $parent->folder_id;
      }

      // Devuelve si existen una carpeta en el mismo nivel y con el mismo nombre
      $exists = FolderNote::on( $user_db )
        ->where( 'parent_id', $parent_id )
        ->whereRaw( 'BINARY folder_title = ?', [$data['newFolderName']] )
        ->exists();

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
          , 'vault_id'       => $vault_id
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


  /**
   * POST /api/deleteFolder
   *
   * @param  Request      $request     Datos de la carpeta: folder_id2
   * @return JsonResponse              Resultado y datos de la carpeta
   */
  public function deleteFolder( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';

    // Separamos por tipo
    $note_ids    = [];
    $folder_ids  = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] )
        throw new Exception( 'Usuario no autenticado' );
      
      $user_id  = $auth_result['user_id'];
      
      // Inicializamos la conexión de DB
      $user_db = DatabaseHelper::connect( $user_id );

      // --------------------------------------------------------------------------------
      // Validación
      // --------------------------------------------------------------------------------

      // Validamos los datos recibidos
      $data = $request->validate( [
        'folder_id2' => 'nullable|string'
      ] );

      // --------------------------------------------------------------------------------
      // Búsqueda de los elementos a borrar
      // --------------------------------------------------------------------------------

      // Capturamos el id de la carpeta a borrar
      $folder_id = FolderNote::on( $user_db )
        ->where( 'folder_id2', '=', $data['folder_id2'] )
        ->value( 'folder_id' );

      // Capturamos las notas y carpetas relacionadas a esta carpeta
      $related_items = [];

      if( $folder_id )
      {
        $vault_id = FolderNote::on( $user_db )
          ->where( 'folder_id', $folder_id )
          ->value( 'vault_id' );

        // Notas hijas
        $notes = Note::on( $user_db )
          ->where( 'parent_id', $folder_id )
          ->where( 'vault_id', $vault_id )
          ->get();

        foreach( $notes as $note )
        {
          $related_items[] = ( object )[
            'type' => 'note',
            'id'   => $note->note_id
          ];
        }

        // Carpetas hijas
        $folders = FolderNote::on( $user_db )
          ->where( 'parent_id', $folder_id )
          ->where( 'vault_id', $vault_id )
          ->get();

        foreach( $folders as $folder )
        {
          $related_items[] = ( object )[
            'type' => 'folder',
            'id'   => $folder->folder_id
          ];
        }
      }

      foreach( $related_items as $item )
      {
        if( $item->type === 'note' )
          $note_ids[] = $item->id;

        if( $item->type === 'folder' )
          $folder_ids[] = $item->id;
      }

      // --------------------------------------------------------------------------------
      // Borrado de datos
      // --------------------------------------------------------------------------------

      // Borramos notas
      if( !empty( $note_ids ) )
      {
        Note::on( $user_db )
          ->whereIn( 'note_id', $note_ids )->delete();
      }

      // Borramos carpetas
      if( !empty( $folder_ids ) )
      {
        FolderNote::on( $user_db )
          ->whereIn( 'folder_id', $folder_ids )->delete();
      }

      // Borramos la carpeta según folder_id2
      FolderNote::on( $user_db )
        ->where( 'folder_id2', $data['folder_id2'] )
        ->delete();

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
      throw $e;
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y datos de la nota
      return response()->json( [
          'result'  => $result
        , 'message' => $message
      ], $result ? 200 : 500 );
    }
  }

  /**
   * Obtiene las carpetas hijas de un vault y parent_id.
   *
   * @param  Request $request
   * @return JsonResponse
   */
  public function getFolders( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $folders = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] )
        throw new Exception( 'Usuario no autenticado' );
      
      $user_id  = $auth_result['user_id'];

      // Validamos los datos recibidos
      $data = $request->validate( [
          'vault_id' => 'required|integer'
      ] );

      // Inicializamos la conexión de DB
      $user_db = DatabaseHelper::connect( $user_id );

      // Obtenemos las carpetas del vault
      $folders = FolderNote::on( $user_db )
        ->where( 'vault_id', $data['vault_id'] )
        ->get()
        ->toArray();

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y datos de las carpetas
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'folders' => $folders
      ], $result ? 200 : 500 );
    }
  }

  /**
   * POST /api/renameFolder
   *
   * Renombra una carpeta existente.
   *
   * @param  Request      $request     Datos: folder_id2, new_title
   * @return JsonResponse              Resultado de la operación
   */
  public function renameFolder( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $folder  = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] )
        throw new Exception( 'Usuario no autenticado' );
      
      $user_id  = $auth_result['user_id'];

      // Validamos los datos recibidos
      $data = $request->validate( [
          'id2'       => 'required|string'
        , 'new_title' => 'required|string|max:255'
      ] );

      // Inicializamos la conexión de DB
      $user_db = DatabaseHelper::connect( $user_id );

      // Buscamos la carpeta a renombrar
      $folder = FolderNote::on( $user_db )
        ->where( 'folder_id2', $data['id2'] )
        ->firstOrFail();

      // Verificamos que no exista otra carpeta con el mismo nombre en el mismo nivel
      $exists = FolderNote::on( $user_db )
        ->where( 'parent_id', $folder->parent_id )
        ->where( 'folder_id', '!=', $folder->folder_id )
        ->whereRaw( 'BINARY folder_title = ?', [$data['new_title']] )
        ->exists();

      if( $exists ) {
        throw new Exception( 'Ya existe una carpeta con ese nombre en esta ubicación' );
      }

      // Actualizamos el título de la carpeta
      $folder->folder_title = $data['new_title'];
      $folder->save();

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y datos de la carpeta
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'folder'  => $folder
      ], $result ? 200 : 500 );
    }
  }

}