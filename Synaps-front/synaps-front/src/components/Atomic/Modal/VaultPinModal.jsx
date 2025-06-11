//====================================================================================//
//                            MODAL DE PIN PARA VAULT PRIVADA                        //
//====================================================================================//
//  Este componente implementa un modal para solicitar el PIN de acceso a vaults     //
//  privadas. Incluye validación del PIN, manejo de errores y feedback visual.       //
//====================================================================================//

import React, { useState, useRef, useEffect } from 'react';
import { http_post } from '../../../lib/http';

// Iconos SVG utilizados en la interfaz
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";
import { ReactComponent as LockIcon } from "../../../assets/icons/lock.svg";
import { ReactComponent as VaultIcon } from "../../../assets/icons/vault.svg";

/**
 * Modal para solicitar PIN de acceso a vault privada
 * @param {boolean} isOpen - Determina si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onSuccess - Función que se ejecuta cuando el PIN es correcto
 * @param {Object} vault - Datos de la vault que requiere PIN
 * @returns {JSX.Element|null} - Componente React o null si está cerrado
 */
const VaultPinModal = ({ isOpen, onClose, onSuccess, vault }) => {
  // Estados del formulario
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  
  // Referencia para enfocar el campo de PIN
  const pinInputRef = useRef(null);

  // Efecto para limpiar el estado cuando se abre/cierra el modal
  useEffect(() => {
    if(isOpen) {
      setPin('');
      setErrorMessage('');
      setAttempts(0);
      setIsVerifying(false);
      
      // Enfocar el campo de PIN
      setTimeout(() => {
        if(pinInputRef.current) {
          pinInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, vault]);

  /**
   * Maneja el cambio en el campo de PIN
   * @param {Event} e - Evento de cambio
   */
  const handlePinChange = (e) => {
    const value = e.target.value;
    // Solo permitir números
    const numericValue = value.replace(/\D/g, '');
    setPin(numericValue);
    
    // Limpiar error al empezar a escribir
    if(errorMessage) {
      setErrorMessage('');
    }
  };

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento de envío
   */
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    if(!pin.trim()) {
      setErrorMessage('Por favor ingresa el PIN');
      return;
    }

    if(pin.length < 4) {
      setErrorMessage('El PIN debe tener al menos 4 dígitos');
      return;
    }

    await verifyPin();
  };

  /**
   * Verifica el PIN con el servidor
   */
  const verifyPin = async() => {
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const url = `http://localhost:8010/api/vaults/${vault.vault_id2}/verify-pin`;
      const body = { pin: pin };
      
      const result = await http_post(url, body);

      if(result.result === 1) {
        // PIN correcto
        onSuccess(vault);
        handleClose();
      } else {
        // PIN incorrecto
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if(newAttempts >= 3) {
          setErrorMessage('Demasiados intentos fallidos. Inténtalo más tarde.');
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else {
          setErrorMessage(`PIN incorrecto. Te quedan ${3 - newAttempts} intentos.`);
          setPin('');
          // Reenfocar el campo
          setTimeout(() => {
            if(pinInputRef.current) {
              pinInputRef.current.focus();
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error al verificar PIN:', error);
      setErrorMessage('Error al verificar el PIN. Inténtalo de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Cierra el modal y limpia el estado
   */
  const handleClose = () => {
    setPin('');
    setErrorMessage('');
    setAttempts(0);
    setIsVerifying(false);
    onClose();
  };

  /**
   * Maneja eventos de teclado
   * @param {KeyboardEvent} e - Evento de teclado
   */
  const handleKeyDown = (e) => {
    if(e.key === 'Escape') {
      handleClose();
    }
  };

  // No renderizar si está cerrado
  if(!isOpen || !vault) return null;

  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown}>
      <div className="modal-container vault-pin-modal">
        {/* Cabecera del modal */}
        <div className="modal-header">
          <div className="modal-title-container">
            <LockIcon className="modal-icon" />
            <h2 className="modal-title">Vault Privada</h2>
          </div>
          <button 
            className="modal-close-button" 
            onClick={handleClose} 
            aria-label="Cerrar"
            disabled={isVerifying}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-content">
          <div className="vault-info">
            <VaultIcon className="vault-icon-large" />
            <h3 className="vault-name">{vault.name || vault.vault_title}</h3>
            <p className="vault-description">
              Esta vault está protegida con PIN. Ingresa tu PIN para acceder al contenido.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="pin-form">
            <div className="input-group">
              <label htmlFor="vault-pin" className="input-label">
                PIN de acceso
              </label>
              <input
                ref={pinInputRef}
                id="vault-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`input-field pin-input ${errorMessage ? 'error' : ''}`}
                placeholder="••••"
                value={pin}
                onChange={handlePinChange}
                disabled={isVerifying}
                maxLength={8}
                autoComplete="off"
              />
              {errorMessage && (
                <span className="input-error">{errorMessage}</span>
              )}
            </div>

            {/* Indicador de intentos */}
            {attempts > 0 && attempts < 3 && (
              <div className="attempts-indicator">
                <span>Intentos restantes: {3 - attempts}</span>
              </div>
            )}
          </form>
        </div>

        {/* Pie del modal */}
        <div className="modal-footer">
          <button 
            className="modal-button secondary" 
            onClick={handleClose}
            disabled={isVerifying}
          >
            Cancelar
          </button>
          <button 
            className="modal-button primary" 
            onClick={handleSubmit}
            disabled={isVerifying || !pin.trim() || pin.length < 4}
          >
            {isVerifying ? 'Verificando...' : 'Acceder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultPinModal;
