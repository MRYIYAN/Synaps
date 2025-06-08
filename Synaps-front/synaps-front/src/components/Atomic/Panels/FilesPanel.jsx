//===========================================================================   //
//                             PANEL DE BÚSQUEDA DE SYNAPS                      //
//===========================================================================   //
//  Este componente implementa una barra de herramientas horizontal con         //
//  botones para crear notas, carpetas, filtrar y buscar contenido.            //
//  Los botones despliegan inputs interactivos para cada acción.               //
//  El panel está diseñado para ser similar a la barra de búsqueda de VS Code.  //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useEffect, useState, useCallback } from "react";  // Importación de React y hooks
import { ReactComponent as SearchIcon }     from "../../../assets/icons/search.svg";      // Icono de búsqueda
import { ReactComponent as NewNoteIcon }    from "../../../assets/icons/new-file.svg";    // Icono para nuevas notas
import { ReactComponent as NewFolderIcon }  from "../../../assets/icons/new-folder.svg";  // Icono para nuevas carpetas
import { ReactComponent as UploadIcon }     from "../../../assets/icons/upload.svg";      // Icono para subir archivos
import NoteTree from "../../NoteTree/NoteTree.jsx";
import { http_post } from '../../../lib/http.js';
import FileUploadModal from '../Modal/FileUploadModal';



//===========================================================================//

//===========================================================================//
//                             COMPONENTE FILESPANEL                         //
//===========================================================================//

// Este componente implementa un panel de búsqueda interactivo con múltiples funciones
const FilesPanel = ({ notes: notesProp, getNotes }) => {
  // Usar directamente window.currentNotes como fuente de verdad
  const [notes, setNotes] = useState(() => window.currentNotes || notesProp || []);
  const [currentVaultId, setCurrentVaultId] = useState(window.currentVaultId || 0);

  // Sincronizar estado local con window.currentNotes
  useEffect(() => {
    const syncNotes = () => {
      const currentNotes = window.currentNotes || notesProp || [];
      setNotes(currentNotes);
    };

    // Sincronización inicial
    syncNotes();

    // Configurar intervalo para sincronización periódica
    const interval = setInterval(syncNotes, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, [notesProp]);

  // Exponer la función global para cargar notas por carpeta
  useEffect(() => {
    window.getNotesForFolder = (parent_id) => {
      if (!currentVaultId) {
        console.error("No hay vault seleccionado");
        return;
      }
      getNotes(currentVaultId, parent_id);
    };

    // Actualiza currentVaultId si cambia globalmente
    const onVaultChange = () => setCurrentVaultId(window.currentVaultId || 0);
    window.addEventListener("vaultChanged", onVaultChange);
    return () => {
      window.getNotesForFolder = null;
      window.removeEventListener("vaultChanged", onVaultChange);
    };
  }, [getNotes, currentVaultId]);

  // Inicializamos el item seleccionado
  const [, _setSelectedItemId2]  = useState( '' );

  // setter extendido que también guarda en window
  const setSelectedItemId2 = ( value ) => {
    _setSelectedItemId2( value );
    window.selectedItemId2 = value;
  };

  useEffect( () => {
    window.setSelectedItemId2 = setSelectedItemId2;
  }, [] );

  // -----------------------------------------------------------------
  // Notes
  // -----------------------------------------------------------------

  // Elimina cualquier estado local de notes, usa solo el prop notes

  //---------------------------------------------------------------------------//
  //  Estados para manejar la búsqueda y la interfaz                           //
  //---------------------------------------------------------------------------//
  // Estado para el texto de búsqueda ingresado por el usuario
  // Se utiliza para capturar y actualizar lo que escribe el usuario en el campo de búsqueda
  const [searchQuery, setSearchQuery] = useState( "" );
  
  // Estado para almacenar los resultados de la búsqueda
  // Guarda un array de objetos que representan los resultados encontrados
  const [searchResults, setSearchResults] = useState( [] );
  
  // Estado para controlar el indicador de carga durante la búsqueda
  // True mientras se está realizando una búsqueda, false cuando termina
  const [isSearching, setIsSearching] = useState( false );

  // Estado para controlar la visibilidad de los campos de entrada
  // Objeto que determina qué input está visible en cada momento
  // Solo puede haber un input visible a la vez
  const [visibleInputs, setVisibleInputs] = useState( {
    search: false,    // Campo de búsqueda
    newNote: false,   // Input para crear nueva nota
    newFolder: false  // Input para crear nueva carpeta
  } );

  // Estado para el modal de subida de archivos
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Estados para los valores de los inputs de nueva nota y carpeta
  // Almacenan los nombres ingresados por el usuario para nuevas notas y carpetas
  const [newNoteName, setNewNoteName] = useState( "" );       // Nombre de nueva nota
  const [newFolderName, setNewFolderName] = useState( "" );   // Nombre de nueva carpeta

  //---------------------------------------------------------------------------//
  //  Handlers para manejar interacciones del usuario                          //
  //---------------------------------------------------------------------------//

  // Función que se ejecuta cuando se envía el formulario de búsqueda
  // Previene el comportamiento por defecto del formulario y ejecuta la búsqueda
  const handleSearch = async( e ) => {
    
    // Previene la recarga de la página
    e.preventDefault();

    // No hace nada si la búsqueda está vacía
    if( !searchQuery.trim() )
      return;
    
    await performSearch( searchQuery.trim() );
  };

  // Función para realizar la búsqueda (reutilizable)
  const performSearch = async( query ) => {
    // Activa el indicador de carga
    setIsSearching( true );

    try {
      // Preparamos los datos para el post
      let url  = 'http://localhost:8010/api/searchNotes';
      let body = { searchQuery: query };

      // Realizamos la llamada por http_post
      let http_response = await http_post( url, body );

      // Procesamos los resultados de la búsqueda
      if( http_response.result === 1 ) {
        const items = http_response.http_data?.items || [];
        
        // Convertimos a formato de resultados de búsqueda
        const searchResultsFormatted = items.map( (item, index) => ({
          id: index + 1,
          fileName: item.title,
          context: `${item.type === 'note' ? 'Nota' : 'Carpeta'}: ${item.title}`,
          originalItem: item // Guardamos el item original para navegación
        }));

        setSearchResults( searchResultsFormatted );
      } else {
        setSearchResults( [] );
      }
    } catch( error ) {
      setSearchResults( [] );
    } finally {
      // Desactiva el indicador de carga al completar
      setIsSearching( false );
    }
  };

  // Función para mostrar/ocultar un campo de entrada específico
  // Esta función gestiona qué input está visible en cada momento
  const toggleInput = useCallback((inputType ) => {
    // Si es upload, abrir el modal en lugar de toggle input
    if (inputType === 'upload') {
      setShowUploadModal(true);
      return;
    }

    // Cerrar todos los demás inputs primero
    // Creamos un objeto con todos los inputs ocultos
    const newState = {
      search: false,
      newNote: false,
      newFolder: false
    };
    
    // Alternar el estado del input seleccionado
    // Si estaba visible, se oculta. Si estaba oculto, se muestra.
    newState[inputType] = !visibleInputs[inputType];
    
    // Actualizar el estado con la nueva configuración
    setVisibleInputs(newState );
    
    // Limpiar los valores de los inputs que se están ocultando
    // Esto evita que al reabrir un input muestre valores antiguos
    
    // Si estamos cerrando el input de búsqueda, limpiamos query y resultados
    if( visibleInputs.search && !newState.search) {
      setSearchQuery( "" );
      setSearchResults( [] );
    }
    
    // Si estamos cerrando el input de nueva nota, limpiamos su nombre
    if( visibleInputs.newNote && !newState.newNote ) {
      setNewNoteName( "" );
    }
    
    // Si estamos cerrando el input de nueva carpeta, limpiamos su nombre
    if( visibleInputs.newFolder && !newState.newFolder) {
      setNewFolderName( "" );
    }
  }, [visibleInputs]);

  // Exponer la función toggleInput globalmente para DefaultMenu
  useEffect( () => {
    window.toggleInput = toggleInput;
    
    // Limpiar la función cuando el componente se desmonte
    return () => {
      window.toggleInput = null;
    };
  }, [toggleInput] );

  // Función para crear una nueva nota
  // Se ejecuta cuando el usuario envía el formulario de nueva nota
  const handleNewNoteSubmit = async( e ) => {

    // Previene la recarga de la página
    e.preventDefault();

    // No hace nada si el nombre está vacío
    if( !newNoteName.trim() ) return;

    // Preparamos los datos para el post
    let url  = 'http://localhost:8010/api/addNote';
    let body = {
      newNoteName: newNoteName,
      parent_id2: window.selectedItemId2
    };

    // Realizamos la llamada por fetch
    let http_response = await http_post( url, body );

    // Añadimos el nuevo item al array
    let data = http_response.http_data.note;
    let note = {
        id       : data.note_id
      , id2      : data.note_id2
      , title    : data.note_title
      , parent_id: data.parent_id
      , type     : 'note'
    };

    // Actualizamos el estado de notas y la variable global en paralelo
    setNotes( prev => {
      const updated = [...(window.currentNotes || []), note];
      window.currentNotes = updated;

      // Marcamos como seleccionado el nuevo item
      setSelectedItemId2( data.note_id2 );
      window.readNote( data.note_id2, window.currentVaultId );
      return updated;
    } );
    
    // Limpiar el input y ocultarlo después de crear la nota
    setNewNoteName( "" );  // Reinicia el campo de nombre
    setVisibleInputs(prev => ( {...prev, newNote: false} ));  // Oculta el formulario
  };

  // Función para crear una nueva carpeta
  // Se ejecuta cuando el usuario envía el formulario de nueva carpeta
  const handleNewFolderSubmit = async( e ) => {
    e.preventDefault();  // Previene la recarga de la página
    if( !newFolderName.trim() ) return;  // No hace nada si el nombre está vacío
    
    // Preparamos los datos para el post
    let url  = 'http://localhost:8010/api/addFolder';
    let body = {
      newFolderName: newFolderName,
      parent_id2: window.selectedItemId2
    };

    // Realizamos la llamada por fetch
    let http_response = await http_post( url, body );

    // Añadimos el nuevo item al array
    let data = http_response.http_data.folder;
    let folder = {
        id       : data.folder_id
      , id2      : data.folder_id2
      , title    : data.folder_title
      , parent_id: data.parent_id
      , type     : 'folder'
    };

    // Actualizamos el estado de notas y la variable global en paralelo
    setNotes( prev => {
      const updated = [...(window.currentNotes || []), folder];
      window.currentNotes = updated;

      // Marcamos como seleccionado el nuevo item
      setSelectedItemId2( data.folder_id2 );
      return updated;
    } );
    
    // Limpiar el input y ocultarlo después de crear la carpeta
    setNewFolderName( "" );  // Reinicia el campo de nombre
    setVisibleInputs(prev => ( {...prev, newFolder: false} ));  // Oculta el formulario
  };

  // Función para manejar clic en resultado de búsqueda
  const handleSearchResultClick = (result) => {
    const item = result.originalItem;
    
    if (item) {
      // Marcar como seleccionado globalmente
      setSelectedItemId2(item.id2);
      window.selectedItemId2 = item.id2;
      
      // Si es una nota, abrirla en el editor
      if (item.type === 'note' && window.readNote) {
        window.readNote(item.id2, window.currentVaultId);
      }
      
      // Si es una carpeta, cargar su contenido
      if (item.type === 'folder' && window.getNotesForFolder) {
        window.getNotesForFolder(item.id2);
      }
      
      // NO cerrar la búsqueda - mantener los resultados visibles
      // Los resultados de búsqueda permanecen para que el usuario pueda seguir navegando
    }
  };

  // Función para manejar el éxito de la subida de archivos
  const handleUploadSuccess = (note) => {
    // Actualizar la lista de notas
    setNotes( prev => {
      const updated = [...(window.currentNotes || []), note];
      window.currentNotes = updated;

      // Marcar como seleccionado el nuevo item
      setSelectedItemId2( note.id2 );
      if (window.readNote) {
        window.readNote( note.id2, window.currentVaultId );
      }
      return updated;
    } );

    // Cerrar el modal
    setShowUploadModal(false);
  };

  //---------------------------------------------------------------------------//
  //  Renderizado del componente FilesPanel                                  //
  //---------------------------------------------------------------------------//
  return (
    <div>

      {/* Barra de herramientas horizontal con botones */}
      {/* Esta barra contiene los botones principales para las diferentes acciones */}
      <div className="toolbar-container">
        <div className="toolbar-buttons">
          {/* Botón para crear una nueva nota */}
          <button 
            className={`toolbar-button ${visibleInputs.newNote ? 'active' : ''}`}
            onClick={() => toggleInput('newNote')}
            aria-label="Crear nueva nota"
            title="Crear nueva nota"
            aria-expanded={visibleInputs.newNote}
          >
            <NewNoteIcon className="toolbar-icon" />
          </button>
          
          {/* Botón para crear una nueva carpeta */}
          <button 
            className={`toolbar-button ${visibleInputs.newFolder ? 'active' : ''}`}
            onClick={() => toggleInput('newFolder')}
            aria-label="Crear nueva carpeta"
            title="Crear nueva carpeta"
            aria-expanded={visibleInputs.newFolder}
          >
            <NewFolderIcon className="toolbar-icon" />
          </button>

          {/* Botón para subir archivos */}
          <button 
            className="toolbar-button"
            onClick={() => toggleInput('upload')}
            aria-label="Subir archivo"
            title="Subir archivo"
          >
            <UploadIcon className="toolbar-icon" />
          </button>
          
          {/* Botón de búsqueda */}
          {/* Cuando está activo, muestra el input de búsqueda y cambia su estilo */}
          <button 
            className={`toolbar-button ${visibleInputs.search ? 'active' : ''}`}
            onClick={() => toggleInput('search')}
            aria-label="Buscar"
            title="Buscar"
            aria-expanded={visibleInputs.search}
          >
            <SearchIcon className="toolbar-icon" />
          </button>
        </div>
      </div>

      <div className="search-panel">

        {/* Contenedor para los formularios desplegables */}
        {/* Agrupa todos los formularios que se muestran u ocultan según la interacción */}
        <div className="input-group-container">
          {/* Formulario para crear una nueva nota - visible solo cuando se activa */}
          {visibleInputs.newNote && (
            <form onSubmit={handleNewNoteSubmit} className="new-item-form">
              <div className="new-item-input-container">
                {/* Icono indicador del tipo de elemento a crear */}
                <NewNoteIcon className="new-item-icon" />
                {/* Campo para ingresar el nombre de la nueva nota */}
                <input
                  type="text"
                  value={newNoteName}
                  onChange={( e ) => setNewNoteName( e.target.value )}
                  placeholder="Nombre de la nota"
                  className="new-item-input"
                  aria-label="Nombre de la nueva nota"
                  autoFocus  // Enfoca automáticamente este campo al aparecer
                />
              </div>
            </form>
          )}

          {/* Formulario para crear una nueva carpeta - visible solo cuando se activa */}
          {visibleInputs.newFolder && (
            <form onSubmit={handleNewFolderSubmit} className="new-item-form">
              <div className="new-item-input-container">
                {/* Icono indicador del tipo de elemento a crear */}
                <NewFolderIcon className="new-item-icon" />
                {/* Campo para ingresar el nombre de la nueva carpeta */}
                <input
                  type="text"
                  value={newFolderName}
                  onChange={( e ) => setNewFolderName( e.target.value )}
                  placeholder="Nombre de la carpeta"
                  className="new-item-input"
                  aria-label="Nombre de la nueva carpeta"
                  autoFocus  // Enfoca automáticamente este campo al aparecer
                />
              </div>
            </form>
          )}

          {/* Campo de búsqueda desplegable - visible solo cuando se activa */}
          {visibleInputs.search && (
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-container">
                {/* Icono de búsqueda dentro del campo */}
                <SearchIcon className="search-icon" />
                {/* Campo para ingresar la consulta de búsqueda */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={( e ) => setSearchQuery( e.target.value )}
                  placeholder="Buscar"
                  className="search-input"
                  aria-label="Buscar en archivos"
                  autoFocus  // Enfoca automáticamente este campo al aparecer
                />
              </div>
            </form>
          )}

          {/* Formulario para subir archivos ha sido reemplazado por el modal FileUploadModal */}
        </div>

        {/* Sección de resultados de búsqueda (visible solo cuando hay búsqueda) */}
        {/* Esta sección muestra los resultados, un indicador de carga o un mensaje de no resultados */}
        {visibleInputs.search && (
          <div className="search-results-section">
            {/* Indicador de búsqueda en progreso - visible durante la búsqueda */}
            {isSearching ? (
              <div className="searching-indicator">
                {/* Spinner animado para indicar carga */}
                <span className="spinner"></span>
                <span>Buscando...</span>
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              /* Mensaje cuando no hay resultados pero se ha hecho una búsqueda */
              <div className="no-results">
                No se encontraron resultados para "{searchQuery}"
              </div>
            ) : searchResults.length > 0 && (
              /* Lista de resultados de búsqueda - visible cuando hay resultados */
              <div className="results-list">
                {/* Mapeo de cada resultado a un elemento visual en la lista */}
                {searchResults.map(result => (
                  <div 
                    key={result.id} 
                    className="result-item clickable" 
                    onClick={() => handleSearchResultClick(result)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Cabecera del resultado con nombre del archivo */}
                    <div className="result-header">
                      <span className="result-filename">{result.fileName}</span>
                    </div>
                    {/* Contexto del resultado de búsqueda */}
                    <div className="result-context">{result.context}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      
        {/* Contenedor del árbol de archivos */}
        {/* Agrupa todos los archivos/notas del usuario */}
        <div className="search-panel-tree" style={{ marginTop: 12, marginBottom: 12 }}>
          {/* Renderiza el árbol de notas usando el prop notes */}
          <NoteTree nodes={notes} />
        </div>
      </div>

      {/* Modal para subir archivos */}
      <FileUploadModal
        isOpen={showUploadModal}
        onUpload={handleUploadSuccess}
        onCancel={() => setShowUploadModal(false)}
      />
    </div>
  );
};

export default FilesPanel;