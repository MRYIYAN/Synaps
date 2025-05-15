import React, { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import { ReactComponent as FoldersIcon } from "../assets/icons/folders.svg";
import { ReactComponent as GalaxyViewIcon } from "../assets/icons/waypoints.svg";
import { ReactComponent as ListTodoIcon } from "../assets/icons/list-todo.svg";
import { ReactComponent as SecretNotesIcon } from "../assets/icons/lock.svg";
import { ReactComponent as LogoutIcon } from "../assets/icons/logout.svg";

import logo_header from "../assets/icons/logo_header_sidebar.svg";
import "../assets/styles/SidebarPanel.css";

// Importaciones de componentes
import LogoutConfirmModal from "./Atomic/Modal/LogoutConfirmModal";
import CreateVaultModal from "./Atomic/Modal/CreateVaultModal";
import UserProfileBar from "./Atomic/Panels/UserProfileBar";
import FilesPanel      from './Atomic/Panels/FilesPanel';
import GalaxyViewPanel  from './Atomic/Panels/GalaxyViewPanel';
import ListTodoPanel    from './Atomic/Panels/ListTodoPanel';
import SecretNotesPanel from './Atomic/Panels/SecretNotesPanel';

// Configuración de los elementos de navegación
const navigationItems = [
  { id: "files", label: "Archivos", icon: FoldersIcon },
  { id: "galaxy-view", label: "Vista de galaxia", icon: GalaxyViewIcon },
  { id: "list-todo", label: "Lista de tareas", icon: ListTodoIcon },
  { id: "secret-notes", label: "Notas secretas", icon: SecretNotesIcon },
];

// Mapeo de componentes de panel por ID
const panelComponents = {
  "files": FilesPanel,
  "galaxy-view": GalaxyViewPanel,
  "list-todo": ListTodoPanel,
  "secret-notes": SecretNotesPanel,
};

const SidebarPanel = () => {
  // Estados para la interfaz de usuario
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showCreateVaultModal, setShowCreateVaultModal] = useState(false);

  // Estados para los datos del usuario y las vaults
  // TODO: Reemplazar con datos reales de la API
  const [currentUser, setCurrentUser] = useState({
    name: "",
    avatar: null
  });

  const [vaults, setVaults] = useState([]);
  const [currentVault, setCurrentVault] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    // TODO: Implementar carga de datos del usuario y vaults desde la API
    // Carga simulada para desarrollo
    setCurrentUser({
      name: "Usuario",
      avatar: null
    });
    
    setVaults([]);
    setCurrentVault(null);
  }, []);

  // Manejo de clics en la barra de navegación
  const handleIconClick = (itemId, index) => {
    if (selectedItem === itemId) {
      if (rightPanelOpen) {
        handleCloseSidebar();
      } else {
        setRightPanelOpen(true);
      }
    } else {
      setSelectedItem(itemId);
      setRightPanelOpen(true);
    }
    
    setIndicatorPosition(index * 48);
  };

  // Cerrar el sidebar con una transición
  const handleCloseSidebar = () => {
    setIsClosing(true);
    
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
  
  // Función para manejar el selector de vaults
  const handleVaultSelect = (vault) => {
    // TODO: Implementar lógica para cargar contenido de la vault seleccionada
    setCurrentVault(vault);
  };
  
  // Nueva función para manejar el menú de configuración
  const handleSettingsClick = () => {
    setShowSettingsMenu(!showSettingsMenu);
    // TODO: Implementar el menú de configuración
  };
  
  // Función para manejar la creación de nuevas vaults
  const handleCreateVault = async (vaultData) => {
    // TODO: Implementar llamada a la API para crear la vault
    return new Promise((resolve, reject) => {
      try {
        // TODO: Validar datos antes de enviar a la API
        
        // TODO: Enviar datos a la API y recibir respuesta
        
        // Actualizar estado local (temporal hasta implementación real)
        const newVault = {
          id: Date.now(), // Temporal, la API generará el ID real
          name: vaultData.name,
          isPrivate: vaultData.isPrivate || false,
        };
        
        setVaults([...vaults, newVault]);
        setCurrentVault(newVault);
        
        resolve(newVault);
      } catch (error) {
        reject(new Error('Error al crear la vault. Inténtalo de nuevo.'));
      }
    });
  };

  // Función para abrir el modal de creación de vault
  const openCreateVaultModal = () => {
    setShowCreateVaultModal(true);
  };
  
  // Determinamos qué componente mostrar en el panel basado en la selección actual
  const CurrentPanelComponent = selectedItem
    ? panelComponents[selectedItem]
    : null;

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
        
        {/* Menú de acciones secundarias (logout) */}
        <ul className="secondary-navigation">
          <li 
            className="logout-item"
            onClick={handleLogoutClick}
            role="menuitem"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogoutIcon aria-hidden="true" />
          </li>
        </ul>
      </aside>

      {/* Side Bar - panel que aparece a la derecha de Activity Bar */}
      {(rightPanelOpen || isClosing) && CurrentPanelComponent && (
        <div className={`right-options-panel ${isClosing ? 'closing' : ''}`}>
          {/* Logo en la parte superior */}

          {/*
          <div className="logo-container">
            <img 
              src={logo_header} 
              alt="Synaps Logo" 
              className="header-logo"
            />
          </div>
          */}
          
          {/* Componente del panel seleccionado */}
          <div className="panel-content">
            <CurrentPanelComponent />
          </div>
          
          {/* Componente de perfil de usuario en la parte inferior */}
          <UserProfileBar 
            currentUser={currentUser}
            vaults={vaults}
            currentVault={currentVault}
            onVaultSelect={handleVaultSelect}
            onSettingsClick={handleSettingsClick}
            onCreateVault={openCreateVaultModal}
          />
        </div>
      )}
      
      {/* Modal de confirmación de cierre de sesión */}
      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
      />

      {/* Modal para crear nueva vault */}
      <CreateVaultModal 
        isOpen={showCreateVaultModal}
        onClose={() => setShowCreateVaultModal(false)}
        onCreateVault={handleCreateVault}
      />
    </div>
  );
};

export default SidebarPanel;