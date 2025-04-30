//---------------------------------------------------------------------------------------------//
// Importamos React, useState para manejar el estado
//---------------------------------------------------------------------------------------------//
import React, { useState } from "react";

//-----------------------------------------------------------------------//
// Importamos nuestros iconos SVG.
//-----------------------------------------------------------------------//
import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import { ReactComponent as FoldersIcon } from "../assets/icons/folders.svg";
import { ReactComponent as GalaxyViewIcon } from "../assets/icons/waypoints.svg";
import { ReactComponent as ListTodoIcon } from "../assets/icons/list-todo.svg";
import { ReactComponent as SecretNotesIcon } from "../assets/icons/lock.svg";

//-----------------------------------------------------------------------//
// Importamos el CSS para el componente.
//-----------------------------------------------------------------------//
import "../assets/styles/SidebarPanel.css";

// Definimos la configuración de los enlaces de navegación
const navigationItems = [
  { id: "search", label: "Buscar", icon: SearchIcon },
  { id: "folders", label: "Mis carpetas", icon: FoldersIcon },
  { id: "galaxy-view", label: "Vista de galaxia", icon: GalaxyViewIcon },
  { id: "list-todo", label: "Lista de tareas", icon: ListTodoIcon },
  { id: "secret-notes", label: "Notas secretas", icon: SecretNotesIcon },
];

// Componentes para el panel derecho según el ítem seleccionado
const SearchPanel = () => <div className="options-panel-content"><h3>Opciones de Búsqueda</h3><p>Aquí irían las opciones de búsqueda</p></div>;
const FoldersPanel = () => <div className="options-panel-content"><h3>Mis Carpetas</h3><p>Aquí irían las opciones de carpetas</p></div>;
const GalaxyViewPanel = () => <div className="options-panel-content"><h3>Vista de Galaxia</h3><p>Aquí irían las opciones de vista de galaxia</p></div>;
const ListTodoPanel = () => <div className="options-panel-content"><h3>Lista de Tareas</h3><p>Aquí irían las opciones de tareas</p></div>;
const SecretNotesPanel = () => <div className="options-panel-content"><h3>Notas Secretas</h3><p>Aquí irían las opciones de notas secretas</p></div>;

// Mapeo de componentes de panel por ID
const panelComponents = {
  "search": SearchPanel,
  "folders": FoldersPanel,
  "galaxy-view": GalaxyViewPanel,
  "list-todo": ListTodoPanel,
  "secret-notes": SecretNotesPanel,
};

const SidebarPanel = () => {
  //---------------------------------------------------------------------------//
  //  Estado para manejar la visibilidad y el contenido del panel derecho      //
  //---------------------------------------------------------------------------//
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  
  //---------------------------------------------------------------------------//
  //  Función para manejar la selección de iconos                              //
  //---------------------------------------------------------------------------//
  const handleIconClick = (itemId, index) => {
    // Si hacemos clic en el mismo icono ya seleccionado, alternamos la visibilidad del panel
    if (selectedItem === itemId) {
      setRightPanelOpen(!rightPanelOpen);
    } else {
      // Si seleccionamos un icono diferente, lo establecemos como seleccionado y abrimos el panel
      setSelectedItem(itemId);
      setRightPanelOpen(true);
    }
    // Actualizamos la posición del indicador
    setIndicatorPosition(index * 48); // 48px es la altura de cada elemento li
  };

  // Obtener el componente correspondiente al ítem seleccionado
  const CurrentPanelComponent = selectedItem ? panelComponents[selectedItem] : null;

  return (
    <div className="app-container">
      {/* Activity Bar - barra vertical con iconos */}
      <aside className="sidebar-panel" role="navigation">
        {/* Indicador de selección animado */}
        {selectedItem && (
          <div 
            className="active-indicator" 
            style={{ top: `${indicatorPosition}px` }}
            aria-hidden="true"
          ></div>
        )}
        <ul>
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = selectedItem === item.id;
            
            return (
              <li 
                key={item.id} 
                className={isActive ? "active" : ""} 
                onClick={() => handleIconClick(item.id, index)}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
              >
                <IconComponent aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Side Bar - panel que aparece a la derecha de Activity Bar */}
      {rightPanelOpen && CurrentPanelComponent && (
        <div className="right-options-panel">
          <button 
            className="close-panel-button" 
            onClick={() => setRightPanelOpen(false)}
            aria-label="Cerrar panel de opciones"
          >
            ×
          </button>
          <CurrentPanelComponent />
        </div>
      )}
    </div>
  );
};

export default SidebarPanel;