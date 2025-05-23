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
import React, { useEffect, useState, useRef } from "react";  // Importación de React y el hook useState
import { ReactComponent as SearchIcon }     from "../../../assets/icons/search.svg";      // Icono de búsqueda
import { ReactComponent as NewNoteIcon }    from "../../../assets/icons/new-file.svg";    // Icono para nuevas notas
import { ReactComponent as NewFolderIcon }  from "../../../assets/icons/new-folder.svg";  // Icono para nuevas carpetas
import { ReactComponent as FilterIcon }     from "../../../assets/icons/filter-sort.svg"; // Icono para filtrado/ordenación
import NoteTree from "../../NoteTree/NoteTree.jsx";
import { http_post, http_get } from '../../../lib/http.js';

import { NotesHelper } from '../../../lib/Helpers/NotesHelper.jsx';
import { FoldersHelper } from '../../../lib/Helpers/FoldersHelper.jsx';

//===========================================================================//

//===========================================================================//
//                             COMPONENTE FILESPANEL                         //
//===========================================================================//

// Este componente implementa un panel de búsqueda interactivo con múltiples funciones
const FilesPanel = () => {

  const { getNotes, readNote, deleteNote }  = NotesHelper();
  const { deleteFolder }                    = FoldersHelper();

  // -----------------------------------------------------------------
  // Selected Item
  // -----------------------------------------------------------------

  // Inicializamos el item seleccionado
  const [selectedItemId2, _setSelectedItemId2]  = useState( '' );

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

  const [notes, setNotes] = useState( [] );
  useEffect( () => {
    getNotes( 0 );

    window.currentNotes = notes;
  }, [] );

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

  // Estados para los valores de los inputs de nueva nota y carpeta
  // Almacenan los nombres ingresados por el usuario para nuevas notas y carpetas
  const [newNoteName, setNewNoteName] = useState( "" );       // Nombre de nueva nota
  const [newFolderName, setNewFolderName] = useState( "" );   // Nombre de nueva carpeta

  //---------------------------------------------------------------------------//
  //  Handlers para manejar interacciones del usuario                          //
  //---------------------------------------------------------------------------//

  // Función que se ejecuta cuando el usuario escribe en el campo de búsqueda
  // Actualiza el estado searchQuery con el valor actual del input
  const handleSearchChange = ( e ) => {
    setSearchQuery( e.target.value );
  };

  // Función que se ejecuta cuando se envía el formulario de búsqueda
  // Previene el comportamiento por defecto del formulario y ejecuta la búsqueda
  const handleSearch = async( e ) => {
    
    // Previene la recarga de la página
    e.preventDefault();

    // No hace nada si la búsqueda está vacía
    if( !searchQuery.trim() )
      return;
    
    // Activa el indicador de carga
    setIsSearching( true );

    // Realizamos la búsqueda
    // Preparamos los datos para el post
    let url  = 'http://localhost:8010/api/searchNotes';
    let body = { searchQuery: searchQuery };

    // Realizamos la llamada por fetch
    let http_response = await http_post( url, body );

    // Añadimos el nuevo item al array
    let data = http_response.http_data;

    setTimeout( () => {

      // Resultados de ejemplo para demostración
      setSearchResults([
        { id: 1, fileName: "index.js", path: "/src", line: 24, context: "const searchQuery = useState('');" },
        { id: 2, fileName: "FilesPanel.jsx", path: "/components", line: 10, context: "function handleSearch(query) {" },
        { id: 3, fileName: "README.md", path: "/", line: 56, context: "## How to use the search functionality" },
      ]);
      setIsSearching( false );  // Desactiva el indicador de carga al completar
    }, 800 );  // Retraso simulado de 800ms para simular tiempo de búsqueda
  };

  // Función para mostrar/ocultar un campo de entrada específico
  // Esta función gestiona qué input está visible en cada momento
  const toggleInput = (inputType ) => {
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
  };

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
      const updated = [...prev, note];
      window.currentNotes = updated;

      // Marcamos como seleccionado el nuevo item
      setSelectedItemId2( data.note_id2 );
      window.readNote( data.note_id2 );
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
      const updated = [...prev, folder];
      window.currentNotes = updated;

      // Marcamos como seleccionado el nuevo item
      setSelectedItemId2( data.folder_id2 );
      return updated;
    } );
    
    // Limpiar el input y ocultarlo después de crear la carpeta
    setNewFolderName( "" );  // Reinicia el campo de nombre
    setVisibleInputs(prev => ( {...prev, newFolder: false} ));  // Oculta el formulario
  };

  // Función para filtrar
  // Se ejecuta cuando el usuario hace clic en el botón de filtros
  const handleFilter = () => {
    // TODO: Implementar funcionalidad para filtrar/ordenar
    // Esta función debería mostrar opciones de filtrado o ejecutar algún tipo de ordenación
    console.log( "Abrir filtros de ordenación" );
    // En una implementación completa, aquí se podría mostrar un modal o panel de filtros
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
          
          {/* Botón de filtro */}
          <button 
            className="toolbar-button"
            onClick={handleFilter}
            aria-label="Filtrar y ordenar"
            title="Filtrar y ordenar"
          >
            <FilterIcon className="toolbar-icon" />
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
                  <div key={result.id} className="result-item">
                    {/* Cabecera del resultado con nombre y ruta del archivo */}
                    <div className="result-header">
                      <span className="result-filename">{result.fileName}</span>
                      <span className="result-path">{result.path}</span>
                    </div>
                    {/* Información de la línea donde se encontró la coincidencia */}
                    <div className="result-line-number">Línea: {result.line}</div>
                    {/* Contexto del código con la coincidencia - muestra parte del archivo */}
                    <pre className="result-context">{result.context}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      
        {/* Contenedor del árbol de archivos */}
        {/* Agrupa todos los archivos/notas del usuario */}
        <div className="search-panel-tree" style={{ marginTop: 12, marginBottom: 12 }}>
          <NoteTree nodes={window.currentNotes} />
        </div>
      </div>
    </div>
  );
};

export default FilesPanel;