import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as VaultIcon } from "../../../assets/icons/vault.svg";
import { ReactComponent as SettingsHexIcon } from "../../../assets/icons/settings-hex.svg";
import { ReactComponent as AddVaultIcon } from "../../../assets/icons/add-vault.svg";
import { ReactComponent as LockIcon } from "../../../assets/icons/lock.svg";
import { ReactComponent as EditIcon } from "../../../assets/icons/edit.svg";
import ContextMenu from "../Menu/ContextMenu";

/**
 * Componente que muestra información del usuario y selector de vault en la parte inferior del sidebar
 * @param {Object} currentUser - Datos del usuario actual
 * @param {Array} vaults - Lista de vaults disponibles
 * @param {Object} currentVault - Vault seleccionada actualmente
 * @param {Function} onVaultSelect - Función para manejar la selección de vault
 * @param {Function} onSettingsClick - Función para manejar el clic en configuración
 * @param {Function} onCreateVault - Función para manejar la creación de una nueva vault
 * @param {Function} onEditVault - Función para manejar la edición de una vault
 */
const UserProfileBar = ({ currentUser, vaults = [], currentVault, onVaultSelect, onSettingsClick, onCreateVault, onEditVault }) => {
  // Estado para controlar la visibilidad del selector de vault
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  
  // Estado para el menú contextual
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    vault: null
  });
  
  // Referencias para detectar clics fuera del selector
  const vaultSelectorRef = useRef(null);
  const vaultButtonRef = useRef(null);

  /**
   * Cierra el selector de vaults cuando se hace clic fuera del componente
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showVaultSelector &&
        vaultSelectorRef.current &&
        vaultButtonRef.current &&
        !vaultSelectorRef.current.contains(event.target) &&
        !vaultButtonRef.current.contains(event.target)
      ) {
        setShowVaultSelector(false);
      }
      
      // Cerrar menú contextual
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, vault: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVaultSelector, contextMenu.visible]);
  
  /**
   * Alterna la visibilidad del selector de vaults
   */
  const handleVaultSelectorClick = () => {
    setShowVaultSelector(!showVaultSelector);
    // TODO: Implementar carga de vaults si no están cargadas
  };
  
  /**
     /**
   * Selecciona una vault y cierra el selector
   * @param {Object} vault - La vault seleccionada
   */
  const selectVault = (vault) => {
    if (typeof onVaultSelect === 'function') {
      onVaultSelect(vault);
    }
    setShowVaultSelector(false);
  };

  /**
   * Maneja la creación de una nueva vault
   */
  const handleCreateNewVault = () => {
    if (typeof onCreateVault === 'function') {
      onCreateVault();
    }
    setShowVaultSelector(false);
  };

  /**
   * Maneja el clic derecho en un vault para mostrar menú contextual
   * @param {Event} e - Evento del clic derecho
   * @param {Object} vault - La vault sobre la que se hizo clic derecho
   */
  const handleVaultRightClick = (e, vault) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate better positioning to avoid sidebar overlap
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX;
    let y = e.clientY;
    
    // If too close to the right edge, position to the left of the cursor
    if (x + 200 > window.innerWidth) {
      x = Math.max(10, x - 200);
    }
    
    // If too close to the bottom, position above
    if (y + 100 > window.innerHeight) {
      y = Math.max(10, y - 100);
    }
    
    setContextMenu({
      visible: true,
      x: x,
      y: y,
      vault: vault
    });
  };

  /**
   * Maneja el clic izquierdo en un vault (selección o edición)
   * @param {Event} e - Evento del clic
   * @param {Object} vault - La vault sobre la que se hizo clic
   */
  const handleVaultClick = (e, vault) => {
    e.stopPropagation();
    
    // Si es el vault activo, abrir modal de edición
    const isActive = currentVault && (
      (vault.vault_id2 && currentVault.vault_id2 && vault.vault_id2 === currentVault.vault_id2) || 
      (vault.id && currentVault.id && vault.id === currentVault.id)
    );
    
    if (isActive && typeof onEditVault === 'function') {
      console.log('Opening edit modal for active vault:', vault);
      onEditVault(vault);
      setShowVaultSelector(false);
    } else {
      selectVault(vault);
    }
  };

  /**
   * Maneja las acciones del menú contextual
   * @param {string} action - La acción seleccionada
   */
  const handleContextMenuAction = (action) => {
    console.log('handleContextMenuAction called with:', action, contextMenu.vault);
    if (action === 'edit' && contextMenu.vault && typeof onEditVault === 'function') {
      console.log('Calling onEditVault with vault:', contextMenu.vault);
      onEditVault(contextMenu.vault);
    }
    
    // Cerrar menú contextual
    setContextMenu({ visible: false, x: 0, y: 0, vault: null });
    setShowVaultSelector(false);
  };

  return (
    <div className="user-profile-bar">
      {/* Selector de Vault */}
      <div className="vault-section-container">
        <div className="vault-section" ref={vaultButtonRef} onClick={handleVaultSelectorClick}>
          <div className="vault-icon-wrapper">
            <VaultIcon className="vault-icon" />
          </div>
          <div className="vault-selector">
            <span className="vault-name">
              {currentVault ? 
                (currentVault.name || currentVault.vault_title || 'Vault sin nombre') : 
                "Seleccionar Vault"
              }
            </span>
          </div>
          {/* Mostrar icono de lock si la vault actual es privada */}
          {currentVault && currentVault.is_private && (
            <div className="vault-lock-icon">
              <LockIcon />
            </div>
          )}
        </div>
        {/* Botón de edición directo */}
        {currentVault && (
          <button 
            className="vault-edit-button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onEditVault === 'function') {
                onEditVault(currentVault);
              }
            }}
            title="Editar vault"
          >
            <EditIcon />
          </button>
        )}
      </div>
      
      {/* Selector desplegable de vaults */}
      {showVaultSelector && (
        <div className="vault-dropdown-container" ref={vaultSelectorRef}>
          <ul className="vault-dropdown">
            {vaults.length === 0 ? (
              <li className="vault-item empty-state">
                <span>No hay vaults disponibles</span>
              </li>
            ) : (
              vaults.map((vault, index) => {
                // Determinar si este vault es el seleccionado actualmente
                const isActive = currentVault && (
                  // Comparar por vault_id2 si ambos existen
                  (vault.vault_id2 && currentVault.vault_id2 && vault.vault_id2 === currentVault.vault_id2) || 
                  // O comparar por id si ambos existen
                  (vault.id && currentVault.id && vault.id === currentVault.id)
                );
                
                return (
                  <li 
                    key={vault.vault_id2 || vault.id || index}
                    className={`vault-item ${isActive ? 'active' : ''}`}
                    onClick={(e) => handleVaultClick(e, vault)}
                    onContextMenu={(e) => handleVaultRightClick(e, vault)}
                    style={{"--item-index": index}}
                  >
                    <span className="vault-item-name">
                      {vault.name || vault.vault_title || `Vault ${index + 1}`}
                    </span>
                    {/* Mostrar icono de lock si la vault es privada */}
                    {vault.is_private && (
                      <div className="vault-item-lock">
                        <LockIcon />
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
          <button className="create-vault-button" onClick={handleCreateNewVault}>
            <span className="create-vault-button-icon">
              <AddVaultIcon />
            </span>
            <span className="create-vault-button-text">Nueva Vault</span>
          </button>
        </div>
      )}
      
      {/* Información del usuario */}
      <div className="user-profile-section">
        <div className="user-avatar">
          {currentUser && currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} />
          ) : (
            <div className="user-avatar-placeholder"></div>
          )}
        </div>
        <div className="user-info">
          <div className="user-label">Usuario</div>
          {/* Usar operador de acceso seguro para currentUser */}
          <div className="user-name">{currentUser ? currentUser.name : "..."}</div>
        </div>
        <button 
          className="settings-button"
          onClick={onSettingsClick}
          aria-label="Ajustes de usuario"
          title="Ajustes"
        >
          <SettingsHexIcon aria-hidden="true" />
        </button>
      </div>
      
      {/* Menú contextual para vaults */}
      {contextMenu.visible && (
        <ContextMenu
          options={[
            {
              label: 'Editar vault',
              onClick: () => handleContextMenuAction('edit')
            }
          ]}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0, vault: null })}
        />
      )}
    </div>
  );
};

export default UserProfileBar;
