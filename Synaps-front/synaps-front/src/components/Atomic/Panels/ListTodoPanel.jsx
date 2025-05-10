//===========================================================================   //
//                             PANEL DE TAREAS DE SYNAPS                        //
//===========================================================================   //
//  Este componente implementa un panel organizador de tareas con una barra     //
//  de herramientas horizontal que permite crear, filtrar y gestionar paneles   //
//  de tareas. Los botones de crear panel y buscar muestran inputs interactivos.//
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useState } from "react"; // Importamos useState para manejar los estados
import { ReactComponent as NewPanelIcon } from "../../../assets/icons/add-board.svg"; // Icono para crear nuevo panel
import { ReactComponent as ViewModeIcon } from "../../../assets/icons/view-grid.svg"; // Icono para cambiar modo de vista
import { ReactComponent as SearchIcon } from "../../../assets/icons/search.svg"; // Icono de búsqueda
import { ReactComponent as FilterIcon } from "../../../assets/icons/filter-sort.svg"; // Icono para filtrar/ordenar
//===========================================================================//

//===========================================================================//
//                             COMPONENTE LISTTODOPANEL                     //
//===========================================================================//
const ListTodoPanel = () => {
  // Este componente implementa la barra de herramientas con inputs interactivos

  //---------------------------------------------------------------------------//
  //  Estados para manejar la interfaz                                        //
  //---------------------------------------------------------------------------//
  // Estado para controlar la visibilidad de los campos de entrada
  // Objeto que determina qué input está visible en cada momento
  const [visibleInputs, setVisibleInputs] = useState({
    search: false,    // Campo de búsqueda
    newPanel: false,  // Input para crear nuevo panel
  });

  // Estados para los valores de los inputs
  const [searchQuery, setSearchQuery] = useState("");     // Consulta de búsqueda
  const [newPanelName, setNewPanelName] = useState("");   // Nombre del nuevo panel

  //---------------------------------------------------------------------------//
  //  Handlers para manejar interacciones del usuario                         //
  //---------------------------------------------------------------------------//
  // Función para mostrar/ocultar un campo de entrada específico
  // Esta función gestiona qué input está visible en cada momento
  const toggleInput = (inputType) => {
    // Cerrar todos los demás inputs primero
    const newState = {
      search: false,
      newPanel: false
    };
    
    // Alternar el estado del input seleccionado
    newState[inputType] = !visibleInputs[inputType];
    
    // Actualizar el estado con la nueva configuración
    setVisibleInputs(newState);
    
    // Limpiar los valores de los inputs que se están ocultando
    if (visibleInputs.search && !newState.search) {
      setSearchQuery("");
    }
    
    if (visibleInputs.newPanel && !newState.newPanel) {
      setNewPanelName("");
    }
  };

  // Función que se ejecuta cuando el usuario escribe en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Función que se ejecuta cuando el usuario escribe en el campo de nuevo panel
  const handleNewPanelNameChange = (e) => {
    setNewPanelName(e.target.value);
  };

  // Función que se ejecuta cuando se envía el formulario de búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    console.log("Buscando:", searchQuery);
    // TODO: Implementar la búsqueda real
    
    // No ocultamos el input después de la búsqueda para permitir búsquedas adicionales
  };

  // Función para crear un nuevo panel
  const handleNewPanelSubmit = (e) => {
    e.preventDefault();
    if (!newPanelName.trim()) return;
    
    console.log("Creando nuevo panel:", newPanelName);
    // TODO: Implementar la creación real del panel
    
    // Limpiar el input y ocultarlo después de crear el panel
    setNewPanelName("");
    setVisibleInputs(prev => ({...prev, newPanel: false}));
  };

  // Función para manejar las opciones de filtrado y modo de vista
  const handleFilter = () => {
    console.log("Abrir opciones de filtrado");
    // TODO: Implementar el filtrado
  };

  const handleViewMode = () => {
    console.log("Cambiar modo de vista");
    // TODO: Implementar cambio de modo de vista
  };

  //---------------------------------------------------------------------------//
  //  Renderizado del componente ListTodoPanel                                //
  //---------------------------------------------------------------------------//
  return (
    <div className="search-panel task-panel">
      {/* Barra de herramientas horizontal con botones */}
      <div className="toolbar-container">
        <div className="toolbar-buttons">
          {/* Botón para crear un nuevo panel de tareas */}
          <button 
            className={`toolbar-button ${visibleInputs.newPanel ? 'active' : ''}`}
            onClick={() => toggleInput('newPanel')}
            aria-label="Crear nuevo panel de tareas"
            title="Crear nuevo panel de tareas"
            aria-expanded={visibleInputs.newPanel}
          >
            <NewPanelIcon className="toolbar-icon" />
          </button>
          
          {/* Botón para cambiar el modo de visualización */}
          <button 
            className="toolbar-button"
            onClick={handleViewMode}
            aria-label="Cambiar modo de vista"
            title="Cambiar modo de vista"
          >
            <ViewModeIcon className="toolbar-icon" />
          </button>
          
          {/* Botón de búsqueda - en la misma posición que en SearchPanel */}
          <button 
            className={`toolbar-button ${visibleInputs.search ? 'active' : ''}`}
            onClick={() => toggleInput('search')}
            aria-label="Buscar paneles"
            title="Buscar paneles"
            aria-expanded={visibleInputs.search}
          >
            <SearchIcon className="toolbar-icon" />
          </button>
          
          {/* Botón de filtro - en la misma posición que en SearchPanel */}
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

      {/* Contenedor para los formularios desplegables */}
      <div className="input-group-container">
        {/* Formulario para crear un nuevo panel - visible solo cuando se activa */}
        {visibleInputs.newPanel && (
          <form onSubmit={handleNewPanelSubmit} className="new-item-form">
            <div className="new-item-input-container">
              {/* Icono indicador del tipo de elemento a crear */}
              <NewPanelIcon className="new-item-icon" />
              {/* Campo para ingresar el nombre del nuevo panel */}
              <input
                type="text"
                value={newPanelName}
                onChange={handleNewPanelNameChange}
                placeholder="Nombre del panel"
                className="new-item-input"
                aria-label="Nombre del nuevo panel"
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
                onChange={handleSearchChange}
                placeholder="Buscar paneles de tareas"
                className="search-input"
                aria-label="Buscar paneles"
                autoFocus  // Enfoca automáticamente este campo al aparecer
              />
            </div>
          </form>
        )}
      </div>

      {/* Área de contenido principal - vacía por ahora */}
      <div className="task-panels-content">
        {/* El contenido de los paneles de tareas se mostrará aquí */}
      </div>
    </div>
  );
};

export default ListTodoPanel;