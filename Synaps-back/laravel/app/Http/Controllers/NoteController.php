<?php

// -------------------------------------------------------------------------------------------
// NoteController.php
// -------------------------------------------------------------------------------------------

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;
use App\Models\Note;
use App\Models\FolderNote;
use App\Services\NoteService;
use App\Services\VaultService;
use App\Events\NoteUpdated;

use App\Helpers\DatabaseHelper;
use App\Helpers\AuthHelper;

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

    $vault['vault_id']  = 1;
    $vault['vault_id2'] = 'F7D8FDG78D9SF789G789D7S89F7S';

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];

      // Validamos los datos recibidos
      $data = $request->validate( [
          'newNoteName' => 'required|string|max:255'
        , 'parent_id2'  => 'nullable|string'
      ] );

      // Conectamos a la base de datos del usuario
      $user_db = DatabaseHelper::connect( $user_id );

      // Calculamos el parent_id (0 = root)
      $parent_id = 0;
      if( !empty( $data['parent_id2'] ) )
      {
        // Buscamos la carpeta según el parent_id2
        $parent = FolderNote::on( $user_db )
          ->where( 'folder_id2', $data['parent_id2'] )
          ->first();

        // En caso de que no exista el registro en esa tabla, buscamos si es una nota y capturamos el padre
        if( $parent && $parent->folder_id )
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
        ->whereRaw( 'BINARY note_title = ?', [$data['newNoteName']] )
        ->exists();

      // Si existe una nota en el mismo nivel y con el mismo nombre, mostramos una alerta
      if( $exists == true )
        throw new Exception( 'Esta nota ya existe' );

      // Si no es Root, incrementamos el número de hijos del padre
      if( $parent_id !== 0 && $parent )
        $parent->incrementChildrenCount();

      // Creamos la nueva nota en la base de datos del usuario
      $note = Note::on( $user_db )
        ->create( [
            'note_id2'         => Str::random( 32 )
          , 'note_title'       => $data['newNoteName']
          , 'note_markdown'    => '# ' . ucfirst( $data['newNoteName'] )
          , 'vault_id'         => $vault['vault_id']
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
   * Obtiene las notas y carpetas hijas de un `parent_id`.
   * 
   * Si se invoca vía HTTP, toma `parent_id` desde el Request.
   * Si se invoca directamente desde PHP, usa el valor de `$parent_id`.
   *
   * @route GET /api/getNotes
   *
   * @param  Request|null  $request         Petición HTTP (opcional si se llama desde PHP)
   * @param  int|null      $tmp_parent_id   ID del padre (usado solo si $request es null)
   * @return JsonResponse                   Resultado y lista plana de notas y carpetas
   */
  public function getNotes( Request $request, ?int $tmp_parent_id = null ): JsonResponse
  {
    $result  = 0;
    $message = '';
    $items   = [];

    try
    {
      // Validar parámetros de entrada
      $data = $request->validate( [
          'vault_id'  => 'required',
          'parent_id' => 'nullable|integer'
      ] );

      $vault_id = $data['vault_id'];
      if( !is_numeric( $vault_id ) ) {
        throw new Exception( 'Parámetro vault_id inválido' );
      }
      $vault_id = ( int )$vault_id;

      $parent_id = $tmp_parent_id ?? ( $data['parent_id'] ?? null );

      // Conectar a la base de datos del usuario
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];
      $user_db = DatabaseHelper::connect( $user_id );

      // Obtener notas
      $notes = Note::on( $user_db )
        ->where( 'vault_id', $vault_id )
        ->when( !is_null( $parent_id ), fn( $q ) => $q->where( 'parent_id', $parent_id ) )
        ->get();

      // Obtener carpetas
      $folders = FolderNote::on( $user_db )
        ->select( ['folder_id', 'folder_id2', 'folder_title', 'parent_id'] )
        ->where( 'vault_id', $vault_id )
        ->when( !is_null( $parent_id ), fn( $q ) => $q->where( 'parent_id', $parent_id ) )
        ->get();

      // Si no hay notas y se invocó vía HTTP, lanzamos excepción para mensaje
      if( $notes->isEmpty() && is_null( $tmp_parent_id ) )
      {
        $result = 1;
        throw new Exception( 'Notas no encontradas' );
      }

      $notesArray = $notes
        ->map( fn( $note ) => [
            'id'        => $note->note_id
          , 'id2'       => $note->note_id2
          , 'title'     => $note->note_title
          , 'parent_id' => $note->parent_id
          , 'type'      => 'note'
        ] )
        ->toArray();

      $foldersArray = $folders
        ->map( fn( $folder ) => [
            'id'        => $folder->folder_id
          , 'id2'       => $folder->folder_id2
          , 'title'     => $folder->folder_title
          , 'parent_id' => $folder->parent_id
          , 'type'      => 'folder'
        ] )
        ->toArray();

      $items = array_merge( $foldersArray, $notesArray );
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'items'   => $items
      ] );
    }
  }

  /**
   * POST /api/deleteNote
   *
   * @param  Request      $request     Datos de la nota: note_id2
   * @return JsonResponse              Resultado y datos de la nota
   */
  public function deleteNote( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $note    = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];

      // Validamos los datos recibidos
      $data = $request->validate( [
        'note_id2' => 'nullable|string'
      ] );

      // Inicializamos la conexión de DB
      $user_db = DatabaseHelper::connect( $user_id );

      // Buscamos la nota según note_id2
      Note::on( $user_db )
        ->where( 'note_id2', $data['note_id2'] )
        ->delete();

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {  
      // Devolvemos el resultado y, si existía, los datos de la nota eliminada
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'note'    => $note
      ], $result ? 200 : 500 );
    }
  }

  /**
   * GET /api/readNote
   *
   * @param  Request      $request     Datos de la nota: note_id2
   * @return JsonResponse              Resultado y datos de la nota
   */
  public function readNote( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $note    = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];

      // Recibe los parámetros
      $note_id2 = $request->input( 'note_id2' );
      $vault_id = $request->input( 'vault_id' );
      $first    = $request->input( 'first' );

      // Inicializamos la conexión de DB
      $user_db = DatabaseHelper::connect( $user_id );

      // Si se solicita la primera nota disponible
      if( $first == 1 && empty( $note_id2 ) )
      {
        $note = Note::on( $user_db )
          ->where( 'vault_id', $vault_id )
          ->where( 'parent_id', 0 )
          ->orderBy( 'note_id', 'asc' )
          ->first();

        if( !$note ) {
          throw new Exception( 'No hay notas disponibles' );
        }
      }
      else
      {
        // Filtra por note_id2 específico
        $note = Note::on( $user_db )
          ->where( 'note_id2', $note_id2 )
          ->where( 'vault_id', $vault_id )
          ->firstOrFail();
      }

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'note'    => $note
      ], $result ? 200 : 500 );
    }
  }

  /**
   * PATCH /api/notes/{note_id2}
   *
   * @param  Request $request   markdown, updated_at
   * @param  string  $note_id2      Identificador público de la nota
   * @return JsonResponse
   */
  public function saveNote( Request $request, string $note_id2 ): JsonResponse
  {
    Log::info( 'Ejecutando NoteUpdated para: ' . $note_id2 );

    // Inicializamos los valores a devolver
    $result   = 0;
    $conflict = false;
    $message  = '';
    $note     = [];

    try
    {
      // Obtenemos el identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];
      $user_db = DatabaseHelper::connect( $user_id );
      
      // Validamos los datos mandados por Redis
      $data = $request->validate( [
          'markdown'   => 'required|string'
        , 'updated_at' => 'required|date'
      ] );

      // Buscamos la nota pedida por Redis
      $note = Note::on( $user_db )
        ->where( 'note_id2', $note_id2 )
        ->firstOrFail();

      // Colisión: otro usuario guardó después de mi timestamp
      if( $note->last_update_date->gt( Carbon::make( $data['updated_at']) ) )
      {
        $conflict = true;
        throw new Exception( 'Conflicto detectado' );
      }

      // Guardamos en la DB los cambios realizados
      $note->markdown         = $data['markdown'];
      $note->last_update_date = now();
      $note->save();

      // Broadcast global
      event( new NoteUpdated( $note, $user_id ) );

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y datos de la nota
      return response()->json( [
          'result'    => $result
        , 'conflict'  => $conflict
        , 'message'   => $message
        , 'note'      => $note
      ], $result ? 200 : 500 );
    }
  }

  /**
   * POST /api/searchNotes
   *
   * @param  Request      $request
   * @return JsonResponse              Resultado y lista plana de notas
   */
  public function searchNotes( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $items   = [];

    try
    {
      // Validamos los datos recibidos
      $data = $request->validate( [
        'searchQuery' => 'required|string|max:255'
      ] );

      // Identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];
      $user_db = DatabaseHelper::connect( $user_id );

      // Obtenemos todas las notas (propias + compartidas)
      $notes = NoteService::GetNotes( $user_id, $data['searchQuery'] );

      // Mapeamos notas al formato común { id, id2, title, parent_id }
      $items = $notes
        ->map( fn( $note ) => [
            'id'        => $note->note_id
          , 'id2'       => $note->note_id2
          , 'title'     => $note->note_title
          , 'parent_id' => $note->parent_id
          , 'type'      => 'note'
        ] )
        ->toArray();

      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'items'   => $items
      ], $result ? 200 : 500 );
    }
  }

  /**
   * GET /api/galaxyGraph
   *
   * Devuelve el array 'nodes' y 'links' para GalaxyGraph
   * a partir del resultado de búsqueda.
   *
   * @param  Request $request
   * @return JsonResponse
   */
  public function galaxyGraph( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $note    = [];

    try
    {
      // Identificador del usuario autenticado
      $auth_result = AuthHelper::getAuthenticatedUserId();
      if( $auth_result['error_response'] ) {
        throw new Exception( 'Usuario no autenticado' );
      }
      $user_id = $auth_result['user_id'];
      $user_db = DatabaseHelper::connect( $user_id );

      // Obtenemos todas las notas (propias + compartidas)
      $notes = NoteService::GetNotes( $user_id );

      // Obtenemos todas las carpetas del usuario (que coincidan con el searchQuery)
      $folders = FolderNote::on( $user_db )
        ->select( [ 'folder_id', 'folder_id2', 'folder_title', 'parent_id' ] )
        ->get();

      // Mapeamos notas al formato común { id, id2, title, parent_id }
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

      // ---------------------------------------------------------------------------
      // GalaxyGraph: nodos y enlaces agrupados por carpeta-tema
      // ---------------------------------------------------------------------------

      $nodes         = [];  // Nodos: incluye tanto carpetas como notas
      $links         = [];  // Enlaces: conexiones entre carpetas y notas
      $group_count   = 1;   // Grupo incremental para las carpetas
      $folder_groups = [];  // Mapa carpeta_id2 => group asignado

      // Añadimos las carpetas como nodos-tema y registramos su grupo
      foreach( $items as $item )
      {
        // Si es una nota, la saltamos
        if( $item['type'] !== 'folder' )
          continue;

        // Añadimos al array de nodos la carpeta y el índice del grupo
        $group    = $group_count++;
        $nodes[]  = [
            'id'    => $item['id2']
          , 'name'  => $item['title']
          , 'type'  => 'folder'
          , 'group' => $group
        ];

        // Añadimos el grupo a la lista de grupos
        $folder_groups[ $item['id2'] ] = $group;
      }

      // Añadimos las notas como nodos y, si tienen carpeta, enlazamos y asignamos grupo
      foreach( $items as $item )
      {
        // Si es una carpeta, la saltamos
        if( $item['type'] !== 'note' )
          continue;

        // Por defecto, notas sin carpeta quedan en grupo 0
        $group = 0; 
        if( isset( $item['parent_id'] ) )
        {
          // Buscamos el grupo al que está relacionado esta nota
          foreach( $items as $folder )
          {
            if( $folder['type'] === 'folder' && $folder['id'] == $item['parent_id'] )
            {
              // Si existe el grupo, añadimos la relación
              $group    = $folder_groups[ $folder['id2'] ] ?? 0;
              $links[]  = [
                  'source' => $folder['id2']
                , 'target' => $item['id2']
              ];

              break;
            }
          }
        }

        // Añadimos todas las notas
        $nodes[] = [
            'id'    => $item['id2']
          , 'name'  => $item['title']
          , 'type'  => 'note'
          , 'group' => $group
        ];
      }

      $result = 1;
    }
    catch( Exception $e )
    {
      print $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado
      return response()->json( [
          'result' => $result
        , 'nodes'  => $nodes
        , 'links'  => $links
      ], $result ? 200 : 500 );
    }
  }

  /**
   * POST /api/uploadFile
   *
   * Sube un archivo y crea una nota a partir de su contenido.
   *
   * @param  Request      $request     Archivo y datos adicionales
   * @return JsonResponse              Resultado de la operación con datos de la nota creada
   */
  public function uploadFile( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $note    = [];

    $vault['vault_id']  = 1;
    $vault['vault_id2'] = 'F7D8FDG78D9SF789G789D7S89F7S';

    // Obtenemos el identificador del usuario autenticado
    $auth_result = AuthHelper::getAuthenticatedUserId();
    if( $auth_result['error_response'] ) {
      throw new Exception( 'Usuario no autenticado' );
    }

    $user_id = $auth_result['user_id'];

    try
    {
      // Validamos que se haya enviado un archivo
      $request->validate( [
          'file'       => 'required|file|max:10240|mimes:txt,md,pdf,doc,docx,rtf'  // Max 10MB
        , 'parent_id2' => 'nullable|string'
      ] );

      $file = $request->file( 'file' );
      $parent_id2 = $request->input( 'parent_id2', '' );

      // Conectamos a la DB del usuario
      $user_db = DatabaseHelper::connect( $user_id );

      // Calculamos el parent_id (0 = root)
      $parent_id = 0;
      if( !empty( $parent_id2 ) )
      {
        // Buscamos la carpeta según el parent_id2
        $parent = FolderNote::on( $user_db )
          ->where( 'folder_id2', $parent_id2 )
          ->first();

        // Capturamos el id
        if( $parent && $parent->folder_id )
          $parent_id = ( int ) $parent->folder_id;
        else
        {
          // Si no hay carpeta, intentamos encontrar una nota con ese id2
          $note_parent = Note::on( $user_db )
            ->where( 'note_id2', $parent_id2 )
            ->first();

          // Si la encontramos, guardamos el ID del padre
          if( $note_parent )
            $parent_id = ( int ) $note_parent->parent_id;
        }
      }

      // Extraemos el contenido del archivo según su tipo
      $content = $this->extractFileContent( $file );
      
      // Generamos el nombre de la nota basado en el archivo
      $noteName = pathinfo( $file->getClientOriginalName(), PATHINFO_FILENAME );
      
      // Verificamos que no existe una nota con el mismo nombre en el mismo nivel
      $exists = Note::on( $user_db )
        ->where( 'parent_id', $parent_id )
        ->whereRaw( 'BINARY note_title = ?', [$noteName] )
        ->exists();

      // Si existe, añadimos un sufijo
      if( $exists ) {
        $counter = 1;
        $originalName = $noteName;
        do {
          $noteName = $originalName . " ($counter)";
          $counter++;
          $exists = Note::on( $user_db )
            ->where( 'parent_id', $parent_id )
            ->whereRaw( 'BINARY note_title = ?', [$noteName] )
            ->exists();
        } while( $exists );
      }

      // Si no es Root, incrementamos el número de hijos del padre
      if( $parent_id !== 0 && isset( $parent ) )
        $parent->incrementChildrenCount();

      // Creamos la nueva nota con el contenido del archivo
      $note = Note::on( $user_db )
        ->create( [
            'note_id2'         => Str::random( 32 )
          , 'note_title'       => $noteName
          , 'note_markdown'    => $content
          , 'vault_id'         => $vault['vault_id']
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
        , 'http_data' => [ 'note' => $note ]
      ], $result ? 201 : 500 );
    }
  }

  /**
   * Extrae el contenido de un archivo subido según su tipo.
   *
   * @param  \Illuminate\Http\UploadedFile $file
   * @return string
   */
  private function extractFileContent( $file ): string
  {
    $extension = strtolower( $file->getClientOriginalExtension() );
    
    switch( $extension ) {
      case 'txt':
      case 'md':
        // Archivos de texto plano
        return file_get_contents( $file->getRealPath() );
        
      case 'pdf':
        // Para PDFs necesitarías una librería como smalot/pdfparser
        // Por ahora devolvemos un placeholder
        return "# " . pathinfo( $file->getClientOriginalName(), PATHINFO_FILENAME ) . "\n\n[Archivo PDF subido: " . $file->getClientOriginalName() . "]\n\nContenido del PDF pendiente de extracción.";
        
      case 'doc':
      case 'docx':
        // Para documentos Word necesitarías una librería como phpoffice/phpword
        // Por ahora devolvemos un placeholder
        return "# " . pathinfo( $file->getClientOriginalName(), PATHINFO_FILENAME ) . "\n\n[Documento Word subido: " . $file->getClientOriginalName() . "]\n\nContenido del documento pendiente de extracción.";
        
      case 'rtf':
        // Para RTF podrías usar una librería específica
        // Por ahora devolvemos un placeholder
        return "# " . pathinfo( $file->getClientOriginalName(), PATHINFO_FILENAME ) . "\n\n[Archivo RTF subido: " . $file->getClientOriginalName() . "]\n\nContenido del RTF pendiente de extracción.";
        
      default:
        return "# " . pathinfo( $file->getClientOriginalName(), PATHINFO_FILENAME ) . "\n\n[Archivo subido: " . $file->getClientOriginalName() . "]\n\nTipo de archivo no soportado para extracción de contenido.";
    }
  }

  /**
   * POST /api/renameNote
   *
   * Renombra una nota existente.
   *
   * @param  Request      $request     Datos: note_id2, new_title
   * @return JsonResponse              Resultado de la operación
   */
  public function renameNote( Request $request ): JsonResponse
  {
    // Inicializamos los valores a devolver
    $result  = 0;
    $message = '';
    $note    = [];

    // Obtenemos el identificador del usuario autenticado
    $auth_result = AuthHelper::getAuthenticatedUserId();
    if( $auth_result['error_response'] ) {
      throw new Exception( 'Usuario no autenticado' );
    }
    $user_id = $auth_result['user_id'];

    try
    {
      // Validamos los datos recibidos
      $data = $request->validate( [
          'id2'       => 'required|string'
        , 'new_title' => 'required|string|max:255'
      ] );

      // Inicializamos la conexión de DB
      $user_db = DatabaseHelper::connect( $user_id );

      // Buscamos la nota a renombrar
      $note = Note::on( $user_db )
        ->where( 'note_id2', $data['id2'] )
        ->firstOrFail();

      // Verificamos que no exista otra nota con el mismo nombre en el mismo nivel
      $exists = Note::on( $user_db )
        ->where( 'parent_id', $note->parent_id )
        ->where( 'note_id', '!=', $note->note_id )
        ->whereRaw( 'BINARY note_title = ?', [$data['new_title']] )
        ->exists();

      if( $exists ) {
        throw new Exception( 'Ya existe una nota con ese nombre en esta ubicación' );
      }

      // Actualizamos el título de la nota
      $note->note_title = $data['new_title'];
      $note->last_update_date = now();
      $note->save();

      // Si llegamos hasta aquí está todo OK
      $result = 1;
    }
    catch( Exception $e )
    {
      $message = $e->getMessage();
    }
    finally
    {
      // Devolvemos la respuesta con resultado, mensaje y datos de la nota
      return response()->json( [
          'result'  => $result
        , 'message' => $message
        , 'note'    => $note
      ], $result ? 200 : 500 );
    }
  }
}