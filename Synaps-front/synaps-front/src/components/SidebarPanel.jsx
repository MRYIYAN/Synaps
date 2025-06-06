import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as FoldersIcon } from "../assets/icons/folders.svg";
import { ReactComponent as GalaxyViewIcon } from "../assets/icons/waypoints.svg";
import { ReactComponent as ListTodoIcon } from "../assets/icons/list-todo.svg";
import { ReactComponent as LogoutIcon } from "../assets/icons/logout.svg";


import logo_header from "../assets/icons/logo_header_sidebar.svg";
import "../assets/styles/SidebarPanel.css";

// Importaciones de componentes
import LogoutConfirmModal from "./Atomic/Modal/LogoutConfirmModal";
import CreateVaultModal from "./Atomic/Modal/CreateVaultModal";
import UserSettingsModal from "./Atomic/Modal/UserSettingsModal";
import UserProfileBar from "./Atomic/Panels/UserProfileBar";
import FilesPanel      from './Atomic/Panels/FilesPanel';
import GalaxyViewPanel  from './Atomic/Panels/GalaxyViewPanel';
import TaskListPanel      from './Atomic/Panels/TaskListPanel';
import { NotesHelper } from '../lib/Helpers/NotesHelper.jsx';
import { FoldersHelper } from '../lib/Helpers/FoldersHelper.jsx';

// Configuración de los elementos de navegación
const navigationItems = [
  { id: "files", label: "Archivos", icon: FoldersIcon, url: "/markdowneditor" },
  { id: "galaxyview", label: "Vista de galaxia", icon: GalaxyViewIcon, url: "/galaxyview" },
  { id: "list-todo", label: "Lista de tareas", icon: ListTodoIcon, url: "/todo" },
];

// Mapeo de componentes de panel por ID
const panelComponents = {
  "files": FilesPanel,
  "galaxyview": GalaxyViewPanel,
  "list-todo": TaskListPanel,
};

const SidebarPanel = () => {

  // Usar React Router hooks para navegación y ubicación actual
  const location = useLocation();
  const navigate = useNavigate();

  // Usar los helpers
  const { getFolders } = FoldersHelper();
  const { getNotes, notes } = NotesHelper();


    // Estados para la interfaz de usuario
  const [rightPanelOpen, setRightPanelOpen]       = useState(true);
  const [selectedItem, setSelectedItem]           = useState('files');
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [isClosing, setIsClosing]                 = useState(false);  
  const [showLogoutModal, setShowLogoutModal]     = useState(false);
  const [showSettingsMenu, setShowSettingsMenu]   = useState(false);
  const [showCreateVaultModal, setShowCreateVaultModal] = useState(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
  const [showTasksSidebar, setShowTasksSidebar]   = useState(false); // Estado para el sidebar de tareas
  // Estados para los datos del usuario y las vaults
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    avatar: null
  });

  const [vaults, setVaults] = useState([]);
  const [currentVault, setCurrentVault] = useState(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    // Cargar datos del usuario desde la API
    const fetchUserData = async () => {
      try {
        console.log("🔍 Solicitando datos del usuario desde la API...");
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8010/api/user', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const userData = await response.json();
        
        if (userData.result === 1 && userData.user) {
          console.log("👤 Datos del usuario cargados:", userData.user);
          setCurrentUser({
            name: userData.user.name || "",
            email: userData.user.email || "",
            avatar: null
          });
        } else {
          console.error("❌ Error al cargar usuario:", userData.message);
          // Fallback a datos por defecto
          setCurrentUser({
            name: "Usuario",
            email: "",
            avatar: null
          });
        }
      } catch (e) {
        console.error("❌ Error al cargar datos del usuario:", e);
        // Fallback a datos por defecto
        setCurrentUser({
          name: "Usuario", 
          email: "",
          avatar: null
        });
      }
    };    fetchUserData();

    // Cargar vaults reales desde la API
    const fetchVaults = async () => {
      try {
        console.log(" Solicitando vaults desde la API...");
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8010/api/vaults', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const vaults = await response.json();
        console.log(' Vaults cargados de la DB:', vaults);
        setVaults(vaults);

        if (vaults.length > 0) {
          handleVaultSelect(vaults[0]); //  reutiliza la lógica centralizada
        }      } catch (e) {
        console.error(" Error al cargar vaults:", e);
        setVaults([]);
      }    };    fetchVaults();
  }, []);  // Efecto para actualizar el indicador visual basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Manejo especial para rutas del markdown editor
    if (currentPath.startsWith('/markdowneditor')) {
      setSelectedItem('files');
      setIndicatorPosition(0 * 48); // Primer item (files)
    } else {
      const currentItemIndex = navigationItems.findIndex(item => item.url === currentPath);
      
      if (currentItemIndex !== -1) {
        setSelectedItem(navigationItems[currentItemIndex].id);
        setIndicatorPosition(currentItemIndex * 48);
      }
    }

    // Mostrar el sidebar de tareas por defecto cuando navegamos a /todo
    if (currentPath === '/todo') {
      setShowTasksSidebar(true);
    } else {
      setShowTasksSidebar(false);
    }
  }, [location.pathname]);
  // Manejo de clics en la barra de navegación
  const handleIconClick = (itemId, index) => {
    // Buscar el item correspondiente para obtener su URL
    const item = navigationItems.find(navItem => navItem.id === itemId);
    
    if (item && item.url) {
      // Caso especial: si estamos en la página de tareas y hacemos clic en el icono de tareas
      if (itemId === 'list-todo' && location.pathname === '/todo') {
        // Alternar la visibilidad del sidebar de tareas
        setShowTasksSidebar(!showTasksSidebar);
      } else {
        // Navegar a la URL correspondiente
        navigate(item.url);
        
        // Si navegamos a la página de tareas, mostrar el sidebar por defecto
        if (itemId === 'list-todo') {
          setShowTasksSidebar(true);
        } else {
          setShowTasksSidebar(false);
        }
      }
      
      setSelectedItem(itemId);
      setIndicatorPosition(index * 48);
    }
  };

  // Manejo de doble click para cerrar completamente el sidebar
  const handleIconDoubleClick = (itemId, index) => {
    setRightPanelOpen(false);
    setSelectedItem(null);
    setIndicatorPosition(-48); // Ocultar el indicador
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
    setCurrentVault(vault);
    window.currentVaultId = parseInt(vault?.vault_id || 0, 10);

    // Notificar a FilesPanel que cambió el vault
    window.dispatchEvent(new Event("vaultChanged"));

    getFolders(vault?.vault_id); 
    getNotes(vault?.vault_id);  // Cargar notas del vault seleccionado

    // Opcional: resetear nota seleccionada
    window.readNote?.('', vault?.vault_id);
  };
    // Nueva función para manejar el menú de configuración
  const handleSettingsClick = () => {
    setShowUserSettingsModal(true);
  };

  // Función para manejar el guardado de datos del usuario
  const handleSaveUser = async (userData) => {
    try {
      console.log("💾 Guardando datos del usuario:", userData);
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8010/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (result.result === 1 && result.user) {
        console.log("✅ Usuario actualizado exitosamente:", result.user);
        
        // Actualizar el estado local con los nuevos datos
        setCurrentUser({
          name: result.user.name || "",
          email: result.user.email || "",
          avatar: null
        });
        
        return result;
      } else {
        throw new Error(result.message || 'Error al actualizar el usuario');
      }
    } catch (error) {
      console.error("❌ Error al guardar usuario:", error);
      throw error;
    }
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

            return (              <li 
                key={item.id} 
                className={isActive ? "active" : ""} 
                onClick={() => handleIconClick(item.id, index)}
                onDoubleClick={() => handleIconDoubleClick(item.id, index)}
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
      </aside>      {/* Side Bar - panel que aparece a la derecha de Activity Bar */}
      {(location.pathname === '/home' || location.pathname.startsWith('/markdowneditor') || (location.pathname === '/todo' && showTasksSidebar)) && (
        <div className="right-options-panel">
          {/* Logo en la parte superior */}

          {/*
          <div className="logo-container">
            <img 
              src={logo_header} 
              alt="Synaps Logo" 
              className="header-logo"
            />
          </div>
          */}          {/* Componente del panel seleccionado */}
          <div className="panel-content">
            {(location.pathname === '/home' || location.pathname.startsWith('/markdowneditor')) && (
              <FilesPanel
                notes={notes}
                getNotes={getNotes}
              />
            )}
            {location.pathname === '/todo' && showTasksSidebar && (
              <TaskListPanel
                notes={notes}
                getNotes={getNotes}
              />
            )}
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

      {/* Modal de configuración de usuario */}
      <UserSettingsModal 
        isOpen={showUserSettingsModal}
        onClose={() => setShowUserSettingsModal(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
      />
    </div>
  );
};

export default SidebarPanel;
