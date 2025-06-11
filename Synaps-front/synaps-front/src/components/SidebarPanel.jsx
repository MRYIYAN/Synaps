import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as FoldersIcon } from "../assets/icons/folders.svg";
import { ReactComponent as GalaxyViewIcon } from "../assets/icons/waypoints.svg";
import { ReactComponent as ListTodoIcon } from "../assets/icons/list-todo.svg";
import { ReactComponent as LogoutIcon } from "../assets/icons/logout.svg";

import "../assets/styles/SidebarPanel.css";

// Importaciones de componentes
import LogoutConfirmModal from "./Atomic/Modal/LogoutConfirmModal";
import CreateVaultModal from "./Atomic/Modal/CreateVaultModal";
import EditVaultModal from "./Atomic/Modal/EditVaultModal";
import VaultPinModal from "./Atomic/Modal/VaultPinModal";
import UserSettingsModal from "./Atomic/Modal/UserSettingsModal";
import UserProfileBar from "./Atomic/Panels/UserProfileBar";
import FilesPanel      from './Atomic/Panels/FilesPanel';
import GalaxyViewPanel  from './Atomic/Panels/GalaxyViewPanel';
import ListTodoPanel    from './Atomic/Panels/ListTodoPanel';
import { NotesHelper } from '../lib/Helpers/NotesHelper.jsx';
import { FoldersHelper } from '../lib/Helpers/FoldersHelper.jsx';
import { http_get, http_post } from '../lib/http.js';
import VaultSessionManager from '../lib/vaultSessionManager.js';

// Componente de debug (solo en desarrollo)
import VaultSessionDebug from './Debug/VaultSessionDebug.jsx';

const { getFolders } = FoldersHelper(); 

// Configuración de los elementos de navegación
const navigationItems = [
  { id: "files", label: "Archivos", icon: FoldersIcon, url: '/markdowneditor' },
  { id: "galaxyview", label: "Vista de galaxia", icon: GalaxyViewIcon, url: '/galaxyview' },
  { id: "list-todo", label: "Lista de tareas", icon: ListTodoIcon, url: '/todo' },
  // { id: "secret-notes", label: "Notas secretas", icon: SecretNotesIcon },
];

// Mapeo de componentes de panel por ID
const panelComponents = {
  "files": FilesPanel,
  "galaxyview": GalaxyViewPanel,
  "list-todo": ListTodoPanel,
  // "secret-notes": SecretNotesPanel,
};

const SidebarPanel = ({ defaultSelectedItem = 'files' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estados para la interfaz de usuario
  const [rightPanelOpen, setRightPanelOpen]       = useState(true);
  const [selectedItem, setSelectedItem]           = useState(defaultSelectedItem);
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [isClosing, setIsClosing]                 = useState(false);
  const [showLogoutModal, setShowLogoutModal]     = useState(false);
  const [showCreateVaultModal, setShowCreateVaultModal] = useState(false);
  const [showEditVaultModal, setShowEditVaultModal] = useState(false);
  const [editingVault, setEditingVault] = useState(null);
  
  // Estados para el modal de PIN de vault privada
  const [showVaultPinModal, setShowVaultPinModal] = useState(false);
  const [pendingVault, setPendingVault] = useState(null);

  // Estados para los datos del usuario y las vaults
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    avatar: null
  });

  const [vaults, setVaults] = useState([]);
  const [currentVault, setCurrentVault] = useState(null);
  
  // Estado para el modal de configuración de usuario
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);

  // Usar NotesHelper para obtener notas y función getNotes
  const { notes, getNotes } = NotesHelper();

  // Función para manejar el selector de vault
  const handleVaultSelect = useCallback((vault) => {
    // Verificar si la vault necesita autenticación por PIN
    if(VaultSessionManager.vaultNeedsAuthentication(vault)) {
      setPendingVault(vault);
      setShowVaultPinModal(true);
      return;
    }
    
    // Si no necesita autenticación, proceder directamente
    performVaultSelection(vault);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentVault]);

  // Función separada para realizar la selección de vault después de autenticación exitosa
  const performVaultSelection = useCallback((vault) => {
    setCurrentVault(vault);
    window.currentVaultId = parseInt(vault?.vault_id || 0, 10);

    // Notificar a FilesPanel que cambió la vault
    window.dispatchEvent(new Event("vaultChanged"));

    // SOLO cargar notas - la API ya incluye carpetas y notas juntas
    // Esto evita la duplicación causada por llamar getFolders() y getNotes() por separado
    getNotes(vault?.vault_id);

    // Opcional: reiniciar nota seleccionada
    window.readNote?.('', vault?.vault_id);
  }, [getNotes]);

  // Función para manejar autenticación exitosa de PIN
  const handleVaultPinSuccess = useCallback((vault) => {
    console.log('PIN authentication successful for vault:', vault);
    
    // Marcar la vault como autenticada en la sesión
    VaultSessionManager.markVaultAsAuthenticated(vault.vault_id2);
    
    setShowVaultPinModal(false);
    setPendingVault(null);
    performVaultSelection(vault);
  }, [performVaultSelection]);

  // Función para manejar cierre del modal de PIN
  const handleVaultPinClose = useCallback(() => {
    console.log('PIN authentication cancelled');
    setShowVaultPinModal(false);
    setPendingVault(null);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    // Función para cargar datos del usuario desde la API
    const fetchUserData = async() => {
      try {
        const token = localStorage.getItem('access_token');
        if(!token) {
          console.warn('No hay token de autenticación');
          setCurrentUser({
            name: "Usuario",
            email: "usuario@ejemplo.com",
            avatar: null
          });
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if(response.ok) {
          const data = await response.json();
          if(data.result === 1 && data.user) {
            setCurrentUser({
              name: data.user.user_full_name || data.user.user_name || "Usuario",
              email: data.user.user_email || "usuario@ejemplo.com",
              avatar: data.user.profile_photo || null
            });
          } else {
            // Fallback si no se puede obtener los datos
            setCurrentUser({
              name: "Usuario",
              email: "usuario@ejemplo.com", 
              avatar: null
            });
          }
        } else {
          console.error('Error al obtener datos del usuario');
          setCurrentUser({
            name: "Usuario",
            email: "usuario@ejemplo.com",
            avatar: null
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setCurrentUser({
          name: "Usuario", 
          email: "usuario@ejemplo.com",
          avatar: null
        });
      }
    };

    // Cargar datos del usuario
    fetchUserData();

    // Cargar vaults reales desde la API
    const fetchVaults = async() => {
      try {
        const url = 'http://localhost:8010/api/vaults';
        const { result, http_data } = await http_get(url);
        
        if(result === 1) {
          const vaults = http_data || [];
          console.log('Vaults loaded from API:', vaults);
          
          // Asegurar que cada vault tenga una propiedad name
          const processedVaults = vaults.map((vault, index) => ({
            ...vault,
            name: vault.name || vault.vault_title || `Vault ${index + 1}`
          }));
          
          setVaults(processedVaults);

          if(processedVaults.length > 0) {
            handleVaultSelect(processedVaults[0]); //  reutiliza la lógica centralizada
          }
        } else {
          console.error("Error al cargar vaults desde la API");
          setVaults([]);
        }

      } catch (e) {
        console.error(" Error al cargar vaults:", e);
        setVaults([]);
      }
    };

    fetchVaults();
  }, [handleVaultSelect]); // Include handleVaultSelect in dependency array

  // Establecer la posición inicial del indicador basada en defaultSelectedItem
  useEffect(() => {
    const itemIndex = navigationItems.findIndex(item => item.id === defaultSelectedItem);
    if(itemIndex !== -1) {
      setIndicatorPosition(itemIndex * 48);
    }
  }, [defaultSelectedItem]);

  // Sincronizar selección con la URL actual
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = navigationItems.find(item => item.url === currentPath);
    
    if(currentItem && currentItem.id !== selectedItem) {
      setSelectedItem(currentItem.id);
      const itemIndex = navigationItems.findIndex(item => item.id === currentItem.id);
      setIndicatorPosition(itemIndex * 48);
      
      // Solo mostrar panel si no es galaxy view
      if(currentItem.id !== 'galaxyview') {
        setRightPanelOpen(true);
      } else {
        setRightPanelOpen(false);
      }
    }
  }, [location.pathname]);

  // Manejo de clics en la barra de navegación
  const handleIconClick = (item, index) => {
    const { id, url } = item;
    
    // Si el item ya está seleccionado, toggle del panel
    if(selectedItem === id) {
      if(rightPanelOpen) {
        handleCloseSidebar();
      } else {
        setRightPanelOpen(true);
      }
    } else {
      // Cambiar selección
      setSelectedItem(id);
      
      // Si tiene URL, navegar usando SPA
      if(url) {
        navigate(url);
      }
      
      // Solo abrir el panel si no estamos navegando a galaxy view
      if(id !== 'galaxyview') {
        setRightPanelOpen(true);
      } else {
        setRightPanelOpen(false);
      }
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
    // Limpiar datos de sesión
    localStorage.removeItem('access_token');
    
    // Limpiar autenticaciones de vaults de la sesión
    VaultSessionManager.handleUserLogout();
    
    // Limpiar datos globales
    window.currentNotes = [];
    window.currentVaultId = 0;
    window.selectedItemId2 = '';
    
    // Cerrar el modal
    setShowLogoutModal(false);
    
    // Redirigir a la página de login
    window.location.href = '/login';
  };
  
  // Función para cancelar el cierre de sesión
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  
  // Nueva función para manejar el menú de configuración
  const handleSettingsClick = () => {
    setShowUserSettingsModal(true);
  };
  
  // Función para cerrar el modal de configuración de usuario
  const handleUserSettingsClose = () => {
    setShowUserSettingsModal(false);
  };
  
  /**
 * Función para manejar la creación de nuevas vaults con animación.
 * Realiza validaciones frontend y luego llama al backend usando fetch.
 * Retorna una Promise para que el modal pueda usar async/await y mostrar animaciones.
 */
const handleCreateVault = async(vaultData) => {
  // Retornamos Promise para poder usar async/await desde el modal
  return new Promise(async(resolve, reject) => {
    // Simular un retraso para ver la animación de carga
    setTimeout(async() => {
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

        // Preparar datos para http_post
        const url = "http://localhost:8010/api/vaults";
        const body = vaultData;
        
        // Realizar la solicitud POST al backend usando http_post
        const http_response = await http_post(url, body);

        // Verificar si la respuesta es exitosa
        if(http_response.result !== 1) {
          reject(new Error(http_response.message || "Error al crear la vault."));
          return;
        }

        // Obtener la vault creada desde la respuesta
        const responseData = http_response.http_data;
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

  // Función para abrir el modal de creación de vault
  const openCreateVaultModal = () => {
    setShowCreateVaultModal(true);
  };

  // Función para abrir el modal de edición de vault
  const openEditVaultModal = (vault) => {
    console.log('openEditVaultModal called with:', vault);
    console.log('Setting showEditVaultModal to true');
    setEditingVault(vault);
    setShowEditVaultModal(true);
  };

  // Función para manejar la edición de vault
  const handleEditVault = async(updatedVaultData) => {
    try {
      // Si se cambió el PIN o se removió la privacidad, limpiar autenticación
      if(currentVault && currentVault.vault_id2 === updatedVaultData.vault_id2) {
        const pinChanged = currentVault.pin !== updatedVaultData.pin;
        const privacyChanged = currentVault.is_private !== updatedVaultData.is_private;
        
        if(pinChanged || privacyChanged) {
          VaultSessionManager.removeVaultAuthentication(updatedVaultData.vault_id2);
        }
      }

      // Actualizar la vault en el estado local
      setVaults(prevVaults => 
        prevVaults.map(vault => 
          vault.vault_id2 === updatedVaultData.vault_id2 ? updatedVaultData : vault
        )
      );

      // Actualizar currentVault si es la que se está editando
      if(currentVault && currentVault.vault_id2 === updatedVaultData.vault_id2) {
        setCurrentVault(updatedVaultData);
      }

      // Cerrar modal
      setShowEditVaultModal(false);
      setEditingVault(null);

      // Opcional: recargar notas si cambió algo importante
      if(currentVault && currentVault.vault_id2 === updatedVaultData.vault_id2) {
        getNotes(updatedVaultData.vault_id);
      }

    } catch (error) {
      console.error("Error al actualizar vault:", error);
    }
  };

  // Función para actualizar el usuario actual después de guardar cambios
  const handleUserSave = (updatedUser) => {
    setCurrentUser(prev => ({
      ...prev,
      name: updatedUser.user_full_name || updatedUser.user_name || prev.name,
      email: updatedUser.user_email || prev.email,
      avatar: updatedUser.profile_photo || prev.avatar
    }));
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
                onClick={() => handleIconClick(item, index)}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
                style={{ cursor: 'pointer' }}
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
      {(rightPanelOpen || isClosing) && CurrentPanelComponent && selectedItem !== 'galaxyview' && (
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
            <CurrentPanelComponent
              notes={notes}
              getNotes={getNotes}
              viewType={selectedItem === "list-todo" ? "list" : undefined}
            />
          </div>
          {/* Componente de perfil de usuario en la parte inferior */}
          <UserProfileBar 
            currentUser={currentUser}
            vaults={vaults}
            currentVault={currentVault}
            onVaultSelect={handleVaultSelect}
            onSettingsClick={handleSettingsClick}
            onCreateVault={openCreateVaultModal}
            onEditVault={openEditVaultModal}
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

      {/* Modal para editar vault */}
      <EditVaultModal 
        isOpen={showEditVaultModal}
        onClose={() => {
          console.log('Closing EditVaultModal');
          setShowEditVaultModal(false);
          setEditingVault(null);
        }}
        onEditVault={handleEditVault}
        vault={editingVault}
      />

      {/* Modal para autenticación por PIN en vaults privadas */}
      <VaultPinModal
        isOpen={showVaultPinModal}
        onClose={handleVaultPinClose}
        onSuccess={handleVaultPinSuccess}
        vault={pendingVault}
      />

      {/* Modal de configuración de usuario */}
      <UserSettingsModal
        isOpen={showUserSettingsModal}
        onClose={handleUserSettingsClose}
        currentUser={currentUser}
        onSaveUser={handleUserSave}
      />

      {/* Debug component - Solo en desarrollo */}
      {/*<VaultSessionDebug vaults={vaults} />*/}
    </div>
  );
};

export default SidebarPanel;
