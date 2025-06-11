//====================================================================================//
//                             EDICIÓN DE VAULT EN SYNAPS                            //
//====================================================================================//
//  Este componente implementa un modal para la edición de vaults en Synaps.         //
//  Permite al usuario:                                                               //
//  1. Cambiar el nombre de la vault                                                  //
//  2. Editar el PIN si la vault tiene uno                                          //
//  3. Añadir PIN si la vault no lo tiene                                           //
//  4. Quitar el PIN de una vault privada                                           //
//  Incluye validaciones exhaustivas para todos los campos y feedback visual         //
//  en tiempo real para guiar al usuario durante el proceso de edición.              //
//====================================================================================//

//====================================================================================//
//                                COMPONENTES                                         //
//====================================================================================//
// Importaciones de React y sus hooks para manejo de estado y efectos
import React, { useState, useRef, useEffect } from 'react';
import { http_put } from '../../../lib/http';

// Iconos SVG utilizados en la interfaz
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";
import { ReactComponent as VaultIcon } from "../../../assets/icons/vault.svg";
import { ReactComponent as LockIcon } from "../../../assets/icons/lock.svg";
import { ReactComponent as CheckIcon } from "../../../assets/icons/check.svg";

// Componentes personalizados para funcionalidades específicas
import VaultStatusPopup, { STATUS } from "../PopUp/VaultStatusPopup";

//====================================================================================//
//                                COMPONENTE                                          //
//====================================================================================//

/**
 * Modal para editar una vault existente
 * @param {boolean} isOpen - Determina si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onEditVault - Función para guardar cambios en la vault
 * @param {Object} vault - Datos de la vault a editar
 * @returns {JSX.Element|null} - Componente React o null si está cerrado
 */
const EditVaultModal = ({ isOpen, onClose, onEditVault, vault }) => {
  //-------------------------// 
  // Estados del formulario 
  //------------------------//
  // Estados principales para los campos del formulario
  const [vaultName, setVaultName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);           // Si es una vault privada con PIN
  const [pin, setPin] = useState('');                          // PIN de acceso para vault privada
  const [confirmPin, setConfirmPin] = useState('');            // Confirmación del PIN
  const [isEditing, setIsEditing] = useState(false);           // Si está en proceso de edición
  const [removePIN, setRemovePIN] = useState(false);           // Si se quiere remover el PIN

  // Estados para el popup de estado (éxito, error, cargando)
  const [statusPopup, setStatusPopup] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para mensajes de error específicos de cada campo
  const [nameError, setNameError] = useState('');
  const [pinError, setPinError] = useState('');
  const [confirmPinError, setConfirmPinError] = useState('');

  // Referencias para enfocar elementos específicos
  const nameInputRef = useRef(null);
  const pinInputRef = useRef(null);

  //====================================================================================//
  //                          FUNCIONES DE VALIDACIÓN                                  //
  //====================================================================================//

  /**
   * Valida el nombre de la vault
   * @param {string} name - Nombre a validar
   * @returns {Object} - Objeto con isValid y errorMessage
   */
  const validateVaultName = (name) => {
    if (!name.trim()) {
      return { isValid: false, errorMessage: 'El nombre es obligatorio' };
    }
    if (name.trim().length < 2) {
      return { isValid: false, errorMessage: 'El nombre debe tener al menos 2 caracteres' };
    }
    if (name.trim().length > 50) {
      return { isValid: false, errorMessage: 'El nombre no puede exceder 50 caracteres' };
    }
    return { isValid: true, errorMessage: '' };
  };

  /**
   * Valida el PIN de acceso
   * @param {string} pinValue - PIN a validar
   * @returns {Object} - Objeto con isValid y errorMessage
   */
  const validatePin = (pinValue) => {
    if (isPrivate && !removePIN) {
      if (!pinValue) {
        return { isValid: false, errorMessage: 'El PIN es obligatorio para vaults privadas' };
      }
      if (pinValue.length < 4) {
        return { isValid: false, errorMessage: 'El PIN debe tener al menos 4 dígitos' };
      }
      if (pinValue.length > 8) {
        return { isValid: false, errorMessage: 'El PIN no puede exceder 8 dígitos' };
      }
      if (!/^\d+$/.test(pinValue)) {
        return { isValid: false, errorMessage: 'El PIN solo puede contener números' };
      }
    }
    return { isValid: true, errorMessage: '' };
  };

  /**
   * Valida todo el formulario
   * @returns {boolean} - true si es válido, false en caso contrario
   */
  const validateForm = () => {
    // Validar nombre
    const nameValidation = validateVaultName(vaultName);
    setNameError(nameValidation.errorMessage);

    // Validar PIN si es necesario
    const pinValidation = validatePin(pin);
    setPinError(pinValidation.errorMessage);

    // Verificar que los PINs coincidan si es vault privada y no se está removiendo el PIN
    let pinsMatch = true;
    if (isPrivate && !removePIN && pin) {
      pinsMatch = pin === confirmPin;
      setConfirmPinError(pinsMatch ? '' : 'Los PINs no coinciden');
    } else {
      setConfirmPinError('');
    }

    // Validamos todo el formulario
    return nameValidation.isValid && pinValidation.isValid && pinsMatch;
  };

  //====================================================================================//
  //                        FUNCIONES DE MANEJO DE EVENTOS                             //
  //====================================================================================//

  /**
   * Cierra el modal y resetea todos los estados a sus valores iniciales
   */
  const handleClose = () => {
    setVaultName('');
    setIsPrivate(false);
    setPin('');
    setConfirmPin('');
    setRemovePIN(false);
    setStatusPopup(null);
    setStatusMessage('');
    setErrorMessage('');
    setNameError('');
    setPinError('');
    setConfirmPinError('');
    onClose();
  };

  /**
   * Maneja el cambio en el campo de nombre y actualiza el estado
   * @param {Event} e - Evento de cambio
   */
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setVaultName(newName);
    
    // Limpiar error si existe
    if (nameError) {
      setNameError('');
    }
  };

  /**
   * Maneja el cambio en el campo de PIN y filtra caracteres no numéricos
   * @param {Event} e - Evento de cambio
   */
  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    setPin(value);
    
    // Limpiar error si existe
    if (pinError) {
      setPinError('');
    }
  };

  /**
   * Maneja el cambio en el campo de confirmación de PIN
   * @param {Event} e - Evento de cambio
   */
  const handleConfirmPinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    setConfirmPin(value);
    
    // Limpiar error si existe
    if (confirmPinError) {
      setConfirmPinError('');
    }
  };

  /**
   * Valida el nombre cuando el campo pierde el foco
   */
  const handleNameBlur = () => {
    const { isValid, errorMessage } = validateVaultName(vaultName);
    setNameError(isValid ? '' : errorMessage);
  };

  /**
   * Valida el PIN cuando el campo pierde el foco
   */
  const handlePinBlur = () => {
    const { isValid, errorMessage } = validatePin(pin);
    setPinError(isValid ? '' : errorMessage);
  };

  /**
   * Valida la coincidencia de PINs cuando el campo de confirmación pierde el foco
   */
  const handleConfirmPinBlur = () => {
    if (confirmPin && isPrivate && !removePIN) {
      setConfirmPinError(pin === confirmPin ? '' : 'Los PINs no coinciden');
    }
  };

  /**
   * Maneja el cambio en el checkbox de vault privada
   */
  const handlePrivateChange = (e) => {
    const checked = e.target.checked;
    setIsPrivate(checked);
    
    // Si se desactiva vault privada, limpiar PIN y errores
    if (!checked) {
      setPin('');
      setConfirmPin('');
      setPinError('');
      setConfirmPinError('');
      setRemovePIN(false);
    }
  };

  /**
   * Maneja el cambio en el checkbox de remover PIN
   */
  const handleRemovePINChange = (e) => {
    const checked = e.target.checked;
    setRemovePIN(checked);
    
    // Si se va a remover PIN, limpiar campos y errores
    if (checked) {
      setPin('');
      setConfirmPin('');
      setPinError('');
      setConfirmPinError('');
    }
  };

  /**
   * Maneja el evento de teclado para cerrar con Escape
   * @param {KeyboardEvent} e - Evento de teclado
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  /**
   * Función que se ejecuta cuando se completa la animación del popup de estado
   */
  const handleStatusComplete = () => {
    if (statusPopup === STATUS.SUCCESS) {
      handleClose(); // Cerrar modal tras éxito
    }
    setStatusPopup(null);
  };

  //----------------------------------------------------------------------------------//
  // Inicia el proceso de edición de vault después de validar todos los campos necesarios
  //----------------------------------------------------------------------------------//
  const handleEditVault = async () => {
    if (isEditing) return;
    setIsEditing(true);

    if (!validateForm()) {
      setStatusPopup(STATUS.ERROR);
      setStatusMessage('Error en el formulario');
      setErrorMessage('Por favor corrige los errores antes de continuar');
      setIsEditing(false);
      return;
    }

    setStatusPopup(STATUS.LOADING);
    setStatusMessage('Actualizando vault...');

    try {
      const url = `http://localhost:8010/api/vaults/${vault.vault_id2}`;
      const body = {
        vault_title: vaultName.trim(),
        is_private: isPrivate && !removePIN,
        pin: (isPrivate && !removePIN) ? pin : null
      };

      const result = await http_put(url, body);

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (result.result !== 1) {
        throw new Error(result.message || 'Error desconocido al actualizar vault');
      }

      // Muestra el popup de éxito
      setStatusPopup(STATUS.SUCCESS);
      setStatusMessage('¡Vault actualizada con éxito!');

      // Espera antes de cerrar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Llama al callback para actualizar el sidebar
      onEditVault({
        ...vault,
        vault_title: vaultName.trim(),
        is_private: isPrivate && !removePIN,
        name: vaultName.trim()
      });

    } catch (error) {
      console.error('Error al actualizar vault:', error);
      setStatusPopup(STATUS.ERROR);
      setStatusMessage('Error al actualizar vault');
      setErrorMessage(error.message || 'Ha ocurrido un error inesperado');
    } finally {
      setIsEditing(false);
    }
  };

  //====================================================================================//
  //                                EFECTOS                                            //
  //====================================================================================//

  // Efecto para cargar datos de la vault cuando se abre el modal
  useEffect(() => {
    if (isOpen && vault) {
      setVaultName(vault.vault_title || vault.name || '');
      setIsPrivate(Boolean(vault.is_private));
      setPin('');
      setConfirmPin('');
      setRemovePIN(false);
      
      // Limpiar estados de error y popup
      setNameError('');
      setPinError('');
      setConfirmPinError('');
      setStatusPopup(null);
      setStatusMessage('');
      setErrorMessage('');
      
      // Enfocar el campo de nombre
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, vault]);

  //====================================================================================//
  //                                RENDERIZADO                                         //
  //====================================================================================//

  // No renderizar nada si el modal está cerrado
  if (!isOpen || !vault) return null;

  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown}>
      <div className="modal-container create-vault-modal">
        {/* Cabecera del modal con título e icono */}
        <div className="modal-header">
          <div className="modal-title-container">
            <VaultIcon className="modal-icon" />
            <h2 className="modal-title">Editar Vault</h2>
          </div>
          <button className="modal-close-button" onClick={handleClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        {/* Contenido principal del modal */}
        <div className="modal-content">
          {/* Popup de estado (carga, éxito, error) */}
          {statusPopup && (
            <VaultStatusPopup
              status={statusPopup}
              message={statusMessage}
              errorMessage={errorMessage}
              onComplete={handleStatusComplete}
              autoCloseDelay={statusPopup === STATUS.SUCCESS ? 1000 : 0}
            />
          )}

          <p className="modal-description">
            Modifica la configuración de tu vault.
          </p>
          
          {/* Campo para el nombre de la vault */}
          <div className="input-group">
            <label htmlFor="vault-name" className="input-label">
              Nombre de la vault
            </label>
            <input
              ref={nameInputRef}
              id="vault-name"
              type="text"
              className={`input-field ${nameError ? 'error' : ''}`}
              placeholder="Ej: Trabajo, Personal, Proyectos..."
              value={vaultName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              disabled={isEditing}
              maxLength={50}
              autoComplete="off"
            />
            {/* Mensaje de error para el campo de nombre */}
            {nameError && (
              <span className="input-error">{nameError}</span>
            )}
          </div>

          {/* Configuración de privacidad */}
          <div className="input-group">
            <label className="input-label">Configuración de privacidad</label>
            
            {/* Opción de vault privada con checkbox personalizado circular */}
            <div className="checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={handlePrivateChange}
                  disabled={isEditing}
                />
                <span className="custom-checkbox">
                  <CheckIcon />
                </span>
                <span className="checkbox-label">
                  <LockIcon className="checkbox-icon" /> Vault privada con PIN
                </span>
              </label>
              {/* Texto descriptivo que aparece al seleccionar vault privada */}
              {isPrivate && (
                <p className="checkbox-description">
                  Las vaults privadas requieren un PIN para acceder a su contenido.
                </p>
              )}
            </div>

            {/* Si la vault ya era privada, mostrar opción para remover PIN */}
            {vault.is_private && isPrivate && (
              <div className="checkbox-group" style={{ marginTop: '12px' }}>
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={removePIN}
                    onChange={handleRemovePINChange}
                    disabled={isEditing}
                  />
                  <span className="custom-checkbox">
                    <CheckIcon />
                  </span>
                  <span className="checkbox-label">
                    Remover PIN existente
                  </span>
                </label>
                {removePIN && (
                  <p className="checkbox-description">
                    La vault se convertirá en una vault pública sin protección por PIN.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Configuración de PIN */}
          {isPrivate && !removePIN && (
            <div className="input-group">
              <label className="input-label">
                {vault.is_private ? 'Nuevo PIN de acceso' : 'PIN de acceso'}
              </label>
              <p className="modal-description" style={{ fontSize: '0.9em', margin: '0 0 12px 0' }}>
                {vault.is_private ? 
                  'Deja en blanco para mantener el PIN actual o ingresa uno nuevo.' :
                  'Establece un PIN para proteger tu vault.'
                }
              </p>
              
              {/* Campo para el PIN de acceso */}
              <div className="input-group">
                <input
                  ref={pinInputRef}
                  id="vault-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`input-field ${pinError ? 'error' : ''}`}
                  placeholder="Mínimo 4 dígitos"
                  value={pin}
                  onChange={handlePinChange}
                  onBlur={handlePinBlur}
                  disabled={isEditing}
                  maxLength={8}
                  autoComplete="new-password"
                />
                {/* Mensaje de error para el campo de PIN */}
                {pinError && (
                  <span className="input-error">{pinError}</span>
                )}
              </div>

              {/* Campo para confirmar el PIN - solo si se está estableciendo un nuevo PIN */}
              {pin && (
                <div className="input-group">
                  <label htmlFor="vault-pin-confirm" className="input-label">
                    Confirmar PIN
                  </label>
                  <input
                    id="vault-pin-confirm"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`input-field ${confirmPinError ? 'error' : ''}`}
                    placeholder="Vuelve a ingresar el PIN"
                    value={confirmPin}
                    onChange={handleConfirmPinChange}
                    onBlur={handleConfirmPinBlur}
                    disabled={isEditing}
                    maxLength={8}
                    autoComplete="new-password"
                  />
                  {/* Mensaje de error para el campo de confirmación de PIN */}
                  {confirmPinError && (
                    <span className="input-error">{confirmPinError}</span>
                  )}
                </div>
              )}

              {/* Nota de seguridad sobre el PIN */}
              <p className="security-note">
                <strong>Nota de seguridad:</strong> No podrás recuperar el contenido de esta vault si olvidas el PIN.
              </p>
            </div>
          )}
        </div>

        {/* Pie del modal con botones de acción */}
        <div className="modal-footer">
          <button className="modal-button secondary" onClick={handleClose} disabled={isEditing}>
            Cancelar
          </button>
          <button 
            className="modal-button primary" 
            onClick={handleEditVault}
            disabled={isEditing || !vaultName.trim() || nameError}
          >
            {isEditing ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVaultModal;
