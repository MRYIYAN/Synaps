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
  { id: "galaxyview", label: "Vista de galaxia", icon: GalaxyViewIcon, url: 'galaxyview' },
  { id: "list-todo", label: "Lista de tareas", icon: ListTodoIcon },
  { id: "secret-notes", label: "Notas secretas", icon: SecretNotesIcon },
];

// Mapeo de componentes de panel por ID
const panelComponents = {
  "files": FilesPanel,
  "galaxyview": GalaxyViewPanel,
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
    // Cargar datos del usuario (simulado)
    setCurrentUser({
      name: "Usuario",
      avatar: null
    });

    // Cargar vaults reales desde la API
    const fetchVaults = async () => {
      try {
        console.log(" Solicitando vaults desde la API...");
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8010/api/vaults', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if(response.ok) {
          const { data } = await response.json();
          console.log(" Vaults cargados de la DB:", data);
          const formattedVaults = Array.isArray(data)
            ? data.map(v => ({
                ...v,
                name: v.vault_title,
                id: v.vault_id2
              }))
            : [];
          setVaults(formattedVaults);
        } else {
          setVaults([]);
        }
      } catch (e) {
        console.error(" Error al cargar vaults:", e);
        setVaults([]);
      }
    };

    fetchVaults();
    setCurrentVault(null);
  }, []);

  // Manejo de clics en la barra de navegación
  const handleIconClick = (itemId, index) => {
    if(selectedItem === itemId) {
      if(rightPanelOpen)
        handleCloseSidebar();
      else
        setRightPanelOpen(true);
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
    // Protección para evitar error si vault o vault.name es undefined
    const name = (vault?.name || '').toLowerCase();
  };
  
  // Nueva función para manejar el menú de configuración
  const handleSettingsClick = () => {
    setShowSettingsMenu(!showSettingsMenu);
    // TODO: Implementar el menú de configuración
  };
  
  /**
 * Función para manejar la creación de nuevas vaults con animación.
 * Realiza validaciones frontend y luego llama al backend usando fetch.
 * Retorna una Promise para que el modal pueda usar async/await y mostrar animaciones.
 */
const handleCreateVault = async (vaultData) => {
  // Retornamos Promise para poder usar async/await desde el modal
  return new Promise(async (resolve, reject) => {
    // Simular un retraso para ver la animación de carga
    setTimeout(async () => {
      try {
        // 1. Caso especial para demostración: "Error" provoca error
        if(vaultData.name && vaultData.name.toLowerCase() === "error") {
          reject(new Error('Ya existe una vault con ese nombre.'));
          return;
        }

        // 2. Verificar nombres duplicados (validación real, solo frontend)
        if(vaults.some(v => v.name.toLowerCase() === vaultData.name.toLowerCase())) {
          reject(new Error('Ya existe una vault con ese nombre.'));
          return;
        }

        // 3. Validar PIN en vaults privadas
        if(vaultData.isPrivate && (!vaultData.pin || vaultData.pin.length < 4)) {
          reject(new Error('El PIN debe tener al menos 4 dígitos.'));
          return;
        }

        // Obtener el token de autenticación desde localStorage
        const token = localStorage.getItem("access_token"); //Token de Keycloak

        // Realizar la solicitud POST al backend usando fetch
        const response = await fetch("http://localhost:8010/api/vaults", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // El token de Keycloak se envía aquí
          },
          body: JSON.stringify(vaultData),
        });

        // Verificar si la respuesta es exitosa
        if(!response.ok) {
          const errorData = await response.json();
          reject(new Error(errorData.message || "Error al crear la vault."));
          return;
        }

        // Obtener la vault creada desde la respuesta
        const responseData = await response.json();
        console.log(" Vault creado en:", responseData.data.real_path); 
        const newVault = {
          ...responseData.data,
          name: responseData.data.vault_title,
          id: responseData.data.vault_id2
        };

        // Actualizar el estado con la nueva vault
        setVaults((prevVaults) => [...prevVaults, newVault]);
        setCurrentVault(newVault);

        // Resolvemos la promesa para que se muestre la animación de éxito
        resolve(newVault);
      } catch (error) {
        // Manejar errores y rechazar la promesa
        console.error("Error al crear la vault:", error.message);
        reject(new Error(error.message || "Error al crear la vault."));
      }
    }, 1500); // Duración ajustada para una experiencia visual óptima
  });
};

// evitar duplicados al crear una vault
const handleVaultCreated = (vault) => {
  setVaults((prev) => {
    const exists = prev.some(v => v.id === vault.id);
    return exists ? prev : [...prev, vault];
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
            const hasUrl   = 'url' in item && item.url;
            
            return (
              <li 
                key={item.id} 
                className={isActive ? "active" : ""} 
                onClick={() => handleIconClick(item.id, index)}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
              >
                {/* Si tiene una URl vinculada, creamos un link */}
                {hasUrl ? (
                  <a 
                    href={item.url}
                    tabIndex={0}
                    className="nav-link"
                    aria-label={item.title || item.id}
                  >
                    <IconComponent aria-hidden="true" />
                  </a>
                ) : (
                  <IconComponent aria-hidden="true" />
                )}
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
        onCreateVault={handleVaultCreated}
      />
    </div>
  );
};

export default SidebarPanel;