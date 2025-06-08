import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as VaultIcon } from "../../../assets/icons/vault.svg";
import { ReactComponent as SettingsHexIcon } from "../../../assets/icons/settings-hex.svg";
import { ReactComponent as AddVaultIcon } from "../../../assets/icons/add-vault.svg";

/**
 * Componente que muestra información del usuario y selector de vault en la parte inferior del sidebar
 * @param {Object} currentUser - Datos del usuario actual
 * @param {Array} vaults - Lista de vaults disponibles
 * @param {Object} currentVault - Vault seleccionada actualmente
 * @param {Function} onVaultSelect - Función para manejar la selección de vault
 * @param {Function} onSettingsClick - Función para manejar el clic en configuración
 * @param {Function} onCreateVault - Función para manejar la creación de una nueva vault
 */
const UserProfileBar = ({ currentUser, vaults = [], currentVault, onVaultSelect, onSettingsClick, onCreateVault }) => {
  // Estado para controlar la visibilidad del selector de vault
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVaultSelector]);
  
  /**
   * Alterna la visibilidad del selector de vaults
   */
  const handleVaultClick = () => {
    setShowVaultSelector(!showVaultSelector);
    // TODO: Implementar carga de vaults si no están cargadas
  };
  
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

  return (
    <div className="user-profile-bar">
      {/* Selector de Vault */}
      <div className="vault-section" ref={vaultButtonRef} onClick={handleVaultClick}>
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
                    onClick={() => selectVault(vault)}
                    style={{"--item-index": index}}
                  >
                    {vault.name || vault.vault_title || 'Sin nombre'}
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
    </div>
  );
};

export default UserProfileBar;