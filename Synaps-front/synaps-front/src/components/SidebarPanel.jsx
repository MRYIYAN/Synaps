import React, { useState } from "react";
import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import { ReactComponent as FoldersIcon } from "../assets/icons/folders.svg";
import { ReactComponent as GalaxyViewIcon } from "../assets/icons/waypoints.svg";
import { ReactComponent as ListTodoIcon } from "../assets/icons/list-todo.svg";
import { ReactComponent as SecretNotesIcon } from "../assets/icons/lock.svg";
import "../assets/styles/SidebarPanel.css";

// Definimos la configuración de los enlaces de navegación
const navigationItems = [
  { id: "search", label: "Buscar", icon: SearchIcon },
  { id: "folders", label: "Mis carpetas", icon: FoldersIcon },
  { id: "galaxy-view", label: "Vista de galaxia", icon: GalaxyViewIcon },
  { id: "list-todo", label: "Lista de tareas", icon: ListTodoIcon },
  { id: "secret-notes", label: "Notas secretas", icon: SecretNotesIcon },
];

// Componentes para el panel derecho - ahora completamente vacíos
const SearchPanel = () => <div className="options-panel-content"></div>;
const FoldersPanel = () => <div className="options-panel-content"></div>;
const GalaxyViewPanel = () => <div className="options-panel-content"></div>;
const ListTodoPanel = () => <div className="options-panel-content"></div>;
const SecretNotesPanel = () => <div className="options-panel-content"></div>;

// Mapeo de componentes de panel por ID
const panelComponents = {
  "search": SearchPanel,
  "folders": FoldersPanel,
  "galaxy-view": GalaxyViewPanel,
  "list-todo": ListTodoPanel,
  "secret-notes": SecretNotesPanel,
};

const SidebarPanel = () => {
  const [rightPanelOpen, setRightPanelOpen] = useState(false); // Inicialmente cerrado
  const [selectedItem, setSelectedItem] = useState(null); // Inicialmente no hay selección
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  
  // Función para manejar la selección de iconos
  const handleIconClick = (itemId, index) => {
    if (selectedItem === itemId) {
      if (rightPanelOpen) {
        handleCloseSidebar();
      } else {
        // Si está cerrado pero es el mismo icono, lo abrimos
        setRightPanelOpen(true);
      }
    } else {
      // Si seleccionamos un icono diferente, lo abrimos
      setSelectedItem(itemId);
      setRightPanelOpen(true);
    }
    
    setIndicatorPosition(index * 48);
  };

  const handleCloseSidebar = () => {
    setIsClosing(true);
    
    setTimeout(() => {
      setRightPanelOpen(false);
      setIsClosing(false);
    }, 290);
  };
  
  const CurrentPanelComponent = selectedItem ? panelComponents[selectedItem] : null;
  const currentItem = navigationItems.find(item => item.id === selectedItem) || {};

  return (
    <div className="app-container">
      {/* Activity Bar - barra vertical con iconos */}
      <aside className="sidebar-panel" role="navigation">
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

      {/* Side Bar - panel que aparece a la derecha de Activity Bar con separación de 8px */}
      {(rightPanelOpen || isClosing) && CurrentPanelComponent && (
        <div className={`right-options-panel ${isClosing ? 'closing' : ''}`}>
          {/* Header flotante con gap de 8px */}
          <header className="sidebar-header">
            <div className="panel-title">
              <h3>{currentItem.label}</h3>
            </div>
          </header>
          
          <CurrentPanelComponent />
        </div>
      )}
    </div>
  );
};

export default SidebarPanel;