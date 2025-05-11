import React, { useState } from "react";
import { ReactComponent as SearchIcon       } from "../assets/icons/search.svg";
import { ReactComponent as FoldersIcon      } from "../assets/icons/folders.svg";
import { ReactComponent as GalaxyViewIcon   } from "../assets/icons/waypoints.svg";
import { ReactComponent as ListTodoIcon     } from "../assets/icons/list-todo.svg";
import { ReactComponent as SecretNotesIcon  } from "../assets/icons/lock.svg";
import { ReactComponent as LogoutIcon } from "../assets/icons/logout.svg"; // Icono para cerrar sesión
import logo_header from "../assets/icons/logo_header_sidebar.svg"; // Asegúrate de que la ruta sea correcta
import "../assets/styles/SidebarPanel.css";

// Importamos el componente del modal de confirmación
import LogoutConfirmModal from "./Atomic/Modal/LogoutConfirmModal";

// Importaciones directas de cada subcomponente
import SearchPanel from './Atomic/Panels/SearchPanel';
import FoldersPanel from './Atomic/Panels/FoldersPanel';
import GalaxyViewPanel from './Atomic/Panels/GalaxyViewPanel';
import ListTodoPanel from './Atomic/Panels/ListTodoPanel';
import SecretNotesPanel from './Atomic/Panels/SecretNotesPanel';

// Definimos la configuración de los enlaces de navegación
const navigationItems = [
  { id: "search", label: "Buscar", icon: SearchIcon },
  { id: "folders", label: "Mis carpetas", icon: FoldersIcon },
  { id: "galaxy-view", label: "Vista de galaxia", icon: GalaxyViewIcon },
  { id: "list-todo", label: "Lista de tareas", icon: ListTodoIcon },
  { id: "secret-notes", label: "Notas secretas", icon: SecretNotesIcon },
];

// Componentes para el panel derecho - ahora completamente vacíos
const SearchPanel       = () => <div className="options-panel-content"></div>;
const FoldersPanel      = () => <div className="options-panel-content"></div>;
const GalaxyViewPanel   = () => <div className="options-panel-content"></div>;
const ListTodoPanel     = () => <div className="options-panel-content"></div>;
const SecretNotesPanel  = () => <div className="options-panel-content"></div>;

// Mapeo de componentes de panel por ID
const panelComponents = {
  "search": SearchPanel,
  "folders": FoldersPanel,
  "galaxy-view": GalaxyViewPanel,
  "list-todo": ListTodoPanel,
  "secret-notes": SecretNotesPanel,
};

const SidebarPanel = () => {
  const [rightPanelOpen, setRightPanelOpen]       = useState(false);
  const [selectedItem, setSelectedItem]           = useState(null);
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [isClosing, setIsClosing]                 = useState(false);
  
  // Estado para controlar la visibilidad del modal de confirmación de cierre de sesión
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Función para manejar la selección de iconos
  const handleIconClick = (itemId, index) => {

    // Si seleccionamos el mismo item que ya estaba abierto, comprobamos su estado
    if(selectedItem === itemId) {

      // Cerramos
      if( rightPanelOpen )
        handleCloseSidebar();

      // Abrimos el panel del item seleccionado
      else
        setRightPanelOpen(true);
      
    } else {
      // Si seleccionamos un icono diferente, lo abrimos
      setSelectedItem(itemId);
      setRightPanelOpen(true);
    }
    
    setIndicatorPosition(index * 48);
  };

  // Cerramos el sidebar con una transición
  const handleCloseSidebar = () => {
    setIsClosing(true);
    
    // Añadimos una transición
    setTimeout(() => {
      setRightPanelOpen(false);
      setIsClosing(false);
    }, 290);
  };
  
  // Función para manejar el cierre de sesión (ahora muestra el modal)
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };
  
  // Función para confirmar el cierre de sesión
  const confirmLogout = () => {
    console.log("Cerrando sesión confirmado...");
    // TODO: Implementar la lógica real de cierre de sesión
    // - Eliminación de tokens de autenticación
    // - Redirección a la página de login
    // - Limpieza de datos de sesión, etc.
    
    // Cerrar el modal una vez completado
    setShowLogoutModal(false);
  };
  
  // Función para cancelar el cierre de sesión
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  
  // Determinamos qué componente mostrar en el panel basado en la selección actual
  const CurrentPanelComponent = selectedItem
    ? panelComponents[selectedItem]
    : null;
  
  // Capturamos los datos del item seleccionado o un objeto vacío si no hay selección

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
        
        {/* Menú principal de navegación */}
        <ul className="main-navigation">
          {navigationItems.map((item, index) => {

            // Capturamos el icono y el estado del item
            const IconComponent = item.icon;
            const isActive      = selectedItem === item.id;
            
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
        
        {/* Menú de acciones secundarias (logout) */}
        <ul className="secondary-navigation">
          <li 
            className="logout-item"
            onClick={handleLogoutClick}  // Cambiado para mostrar el modal
            role="menuitem"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogoutIcon aria-hidden="true" />
          </li>
        </ul>
      </aside>

      {/* Side Bar - panel que aparece a la derecha de Activity Bar con separación de 8px */}
      {(rightPanelOpen || isClosing) && CurrentPanelComponent && (
        <div className={`right-options-panel ${isClosing ? 'closing' : ''}`}>
          {/* Reemplazamos el placeholder con el logo real */}
          <div className="logo-container">
            <img 
              src={logo_header} 
              alt="Synaps Logo" 
              className="header-logo"
            />
          </div>

          <main>
            <div className=""></div>
          </main>
          
          <CurrentPanelComponent />
        </div>
      )}
      
      {/* Modal de confirmación de cierre de sesión */}
      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default SidebarPanel;