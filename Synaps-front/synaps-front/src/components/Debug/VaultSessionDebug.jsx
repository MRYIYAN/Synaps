//====================================================================================//
//                          COMPONENTE DEBUG PARA VAULT SESSION                      //
//====================================================================================//
//  Este componente es útil para desarrollo y debug. Muestra información sobre       //
//  las vaults autenticadas en la sesión actual.                                     //
//====================================================================================//

import React, { useState, useEffect } from 'react';
import VaultSessionManager from '../../lib/vaultSessionManager.js';

/**
 * Componente de debug para mostrar información de sesión de vaults
 * Solo se debe usar en desarrollo
 */
const VaultSessionDebug = ({ vaults = [] }) => {
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  // Actualizar información de debug cada segundo
  useEffect(() => {
    if(!isVisible) return;

    const updateDebugInfo = () => {
      setDebugInfo(VaultSessionManager.getDebugInfo());
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Solo mostrar en desarrollo
  if(process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearAll = () => {
    VaultSessionManager.clearAllAuthentications();
    setDebugInfo(VaultSessionManager.getDebugInfo());
  };

  const handleClearVault = (vaultId) => {
    VaultSessionManager.removeVaultAuthentication(vaultId);
    setDebugInfo(VaultSessionManager.getDebugInfo());
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px'
    }}>
      <button 
        onClick={() => setIsVisible(!isVisible)}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: isVisible ? '10px' : '0'
        }}
      >
        {isVisible ? 'Ocultar' : 'Mostrar'} Vault Session Debug
      </button>

      {isVisible && (
        <div>
          <h4 style={{ margin: '0 0 10px 0' }}>Vault Session Manager Debug</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Session Storage:</strong> {debugInfo.sessionStorageSupported ? '✅' : '❌'}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Vaults autenticadas:</strong> {debugInfo.authenticatedVaults?.length || 0}
            {debugInfo.authenticatedVaults?.length > 0 && (
              <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                {debugInfo.authenticatedVaults.map(vaultId => (
                  <div key={vaultId} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '5px'
                  }}>
                    <span>{vaultId.substring(0, 8)}...</span>
                    <button 
                      onClick={() => handleClearVault(vaultId)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Total vaults:</strong> {vaults.length}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Vaults privadas:</strong> {vaults.filter(v => v.is_private).length}
          </div>

          <button 
            onClick={handleClearAll}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Limpiar todas las autenticaciones
          </button>
        </div>
      )}
    </div>
  );
};

export default VaultSessionDebug;
