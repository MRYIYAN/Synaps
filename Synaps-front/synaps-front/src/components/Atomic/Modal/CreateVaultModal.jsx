//====================================================================================//
//                             CREACIÓN DE VAULT EN SYNAPS                            //
//====================================================================================//
//  Este componente implementa un modal para la creación de vaults en Synaps.         //
//  Permite al usuario:                                                               //
//  1. Crear vaults normales con nombre y directorio                                  //
//  2. Crear vaults privadas protegidas con PIN                                       //
//  Incluye validaciones exhaustivas para todos los campos y feedback visual          //
//  en tiempo real para guiar al usuario durante el proceso de creación.              //
//====================================================================================//

//====================================================================================//
//                                COMPONENTES                                         //
//====================================================================================//
// Importaciones de React y sus hooks para manejo de estado y efectos
import React, { useState, useRef, useEffect } from 'react';

// Iconos SVG utilizados en la interfaz
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";
import { ReactComponent as VaultIcon } from "../../../assets/icons/vault.svg";
import { ReactComponent as LockIcon } from "../../../assets/icons/lock.svg";
import { ReactComponent as FolderIcon } from "../../../assets/icons/folder.svg";
import { ReactComponent as CheckIcon } from "../../../assets/icons/check.svg";
import ArchiveIcon from '../Icons/ArchiveIcon';

// Componentes personalizados para funcionalidades específicas
import FolderPickerButton from '../Buttons/FolderPickerButton'; 
import VaultStatusPopup, { STATUS } from "../PopUp/VaultStatusPopup";

//====================================================================================//
//                                COMPONENTE                                          //
//====================================================================================//

/**
 * Modal para crear una nueva vault con opción de privacidad
 * @param {boolean} isOpen - Determina si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onCreateVault - Función para crear una nueva vault
 * @returns {JSX.Element|null} - Componente React o null si está cerrado
 */
const CreateVaultModal = ({ isOpen, onClose, onCreateVault }) => {
  //-------------------------// 
  // Estados del formulario 
  //------------------------//
  // Estados principales para los campos del formulario
  const [vaultName, setVaultName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);           // Si es una vault privada con PIN
  const [pin, setPin] = useState('');                          // PIN de acceso para vault privada
  const [confirmPin, setConfirmPin] = useState('');            // Confirmación del PIN
  const [step, setStep] = useState(1);                         // Paso actual del proceso (1: info básica, 2: configurar PIN)
  const [isCreating, setIsCreating] = useState(false);         // Si está en proceso de creación
  const [logicalPath, setLogicalPath] = useState('');          // Ruta lógica

  // Estados para el popup de estado (éxito, error, cargando)
  const [statusPopup, setStatusPopup] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para los mensajes de error de validación
  const [nameError, setNameError] = useState('');
  const [folderPathError, setFolderPathError] = useState('');
  const [pinError, setPinError] = useState('');
  const [confirmPinError, setConfirmPinError] = useState('');

  // Referencias para enfocar automáticamente ciertos campos
  const nameInputRef = useRef(null);
  const folderPathInputRef = useRef(null);
  const pinInputRef = useRef(null);

  //====================================================================================//
  //                                EFECTOS                                             //
  //====================================================================================//

  //----------------------------------------------------------------------------------//
   // Efecto para manejar el enfoque automático en los campos según el paso actual
   // Cuando el modal se abre, enfoca el campo de nombre en el paso 1 o el PIN en el paso 2
  //----------------------------------------------------------------------------------//
  useEffect(() => {
    if (isOpen) {
      // Pequeño timeout para asegurar que los elementos ya estén renderizados
      setTimeout(() => {
        if (step === 1 && nameInputRef.current) {
          nameInputRef.current.focus();  // Enfoca el campo de nombre en el paso 1
        } else if (step === 2 && pinInputRef.current) {
          pinInputRef.current.focus();   // Enfoca el campo de PIN en el paso 2
        }
      }, 100);
    }
  }, [isOpen, step]);  // Se ejecuta cuando cambia isOpen o step

  //====================================================================================//
  //                        FUNCIONES DE VALIDACIÓN                                     //
  //====================================================================================//

  /**
   * Valida el nombre de la vault según las reglas especificadas
   * @param {string} name - Nombre a validar
   * @returns {Object} - Resultado de la validación {isValid, errorMessage}
   */
  const validateVaultName = (name) => {
    // Validar que no esté vacío
    if (!name || name.trim() === '') {
      return { isValid: false, errorMessage: 'El nombre no puede estar vacío' };
    }
    
    // Validar que no contenga espacios
    if (name.includes(' ')) {
      return { isValid: false, errorMessage: 'El nombre no puede contener espacios' };
    }
    
    // Validar que no contenga caracteres especiales (solo letras, números, guiones y guiones bajos)
    const specialCharsRegex = /[^a-zA-Z0-9\-_]/;
    if (specialCharsRegex.test(name)) {
      return { isValid: false, errorMessage: 'El nombre solo puede contener letras, números, guiones y guiones bajos' };
    }
    
    // Validar que no contenga emojis
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
    if (emojiRegex.test(name)) {
      return { isValid: false, errorMessage: 'El nombre no puede contener emojis' };
    }
    
    // Si pasa todas las validaciones
    return { isValid: true, errorMessage: '' };
  };

  /**
   * Valida la ruta del directorio seleccionado para la vault
   * @param {string} path - Ruta a validar
   * @returns {Object} - Resultado de la validación {isValid, errorMessage}
   */
  const validateFolderPath = (path) => {
    // Validar que no esté vacío
    if (!path || path.trim() === '') {
      return { isValid: false, errorMessage: 'Debes seleccionar un directorio' };
    }
    
    // Validación simulada de existencia de directorio
    // En un entorno real, esto sería una verificación asíncrona al sistema de archivos
    // TODO: Implementar verificación real de existencia de directorio en entorno de producción
    const pathExistsSimulation = path.toLowerCase() !== 'invalid';
    if (!pathExistsSimulation) {
      return { isValid: false, errorMessage: 'El directorio no existe o no es accesible' };
    }
    
    // Si pasa todas las validaciones
    return { isValid: true, errorMessage: '' };
  };

  /**
   * Valida el PIN de acceso para vault privada
   * @param {string} pin - PIN a validar
   * @returns {Object} - Resultado de la validación {isValid, errorMessage}
   */
  const validatePin = (pin) => {
    // Validar que no esté vacío
    if (!pin || pin.trim() === '') {
      return { isValid: false, errorMessage: 'El PIN no puede estar vacío' };
    }
    
    // Validar que solo contenga números
    const numbersOnlyRegex = /^\d+$/;
    if (!numbersOnlyRegex.test(pin)) {
      return { isValid: false, errorMessage: 'El PIN solo puede contener números' };
    }
    
    // Validar longitud mínima (4 dígitos)
    if (pin.length < 4) {
      return { isValid: false, errorMessage: 'El PIN debe tener al menos 4 dígitos' };
    }
    
    // Validar longitud máxima (8 dígitos)
    if (pin.length > 8) {
      return { isValid: false, errorMessage: 'El PIN no puede tener más de 8 dígitos' };
    }
    
    // Si pasa todas las validaciones
    return { isValid: true, errorMessage: '' };
  };

  /**
   * Valida el formulario completo según el paso actual
   * @returns {boolean} - true si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    // Validar campos comunes para ambos pasos
    const nameValidation = validateVaultName(vaultName);
    const folderValidation = validateFolderPath(logicalPath);

    // Actualizar estados de error
    setNameError(nameValidation.errorMessage);
    setFolderPathError(folderValidation.errorMessage);

    // Si estamos en el paso 1, solo validamos nombre y directorio
    if (step === 1) {
      return nameValidation.isValid && folderValidation.isValid;
    }

    // Si estamos en el paso 2, también validamos PIN y su confirmación
    const pinValidation = validatePin(pin);
    setPinError(pinValidation.errorMessage);

    // Verificar que los PINs coincidan
    const pinsMatch = pin === confirmPin;
    setConfirmPinError(pinsMatch ? '' : 'Los PINs no coinciden');

    // Validamos todo el formulario
    return nameValidation.isValid && folderValidation.isValid && 
           pinValidation.isValid && pinsMatch;
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
    setStep(1);
    setLogicalPath('');
    setStatusPopup(null);
    setStatusMessage('');
    setErrorMessage('');
    setNameError('');
    setFolderPathError('');
    setPinError('');
    setConfirmPinError('');
    onClose();
  };

  //----------------------------------------------------------------------------------//
   // Avanza al siguiente paso del formulario después de validar los campos del paso actual
  //----------------------------------------------------------------------------------//
  const handleNextStep = () => {
    if (step === 1) {
      // Validar los campos del paso 1
      const nameValidation = validateVaultName(vaultName);
      const folderValidation = validateFolderPath(logicalPath);

      // Actualizar estados de error
      setNameError(nameValidation.errorMessage);
      setFolderPathError(folderValidation.errorMessage);

      // Solo avanzar si los campos son válidos
      if (nameValidation.isValid && folderValidation.isValid) {
        setStep(2); // Avanzar al paso de configuración del PIN
      } else {
        // Mostrar mensaje de error general
        setStatusPopup(STATUS.ERROR);
        setStatusMessage('Error en el formulario');
        setErrorMessage('Por favor corrige los errores antes de continuar');
      }
    }
  };

  //----------------------------------------------------------------------------------//
   // Regresa al paso anterior del formulario
  //----------------------------------------------------------------------------------//
  const handlePrevStep = () => {
    setStep(1); // Volver al paso de información básica
  };

  //----------------------------------------------------------------------------------//
  // Inicia el proceso de creación de vault después de validar  todos los campos necesarios
  //----------------------------------------------------------------------------------//
  const handleCreateVault = async () => {
    if (isCreating) return;
    setIsCreating(true); // <- Bloquea de inmediato para evitar doble click

    if (!validateForm()) {
      setStatusPopup(STATUS.ERROR);
      setStatusMessage('Error en el formulario');
      setErrorMessage('Por favor corrige los errores antes de continuar');
      setIsCreating(false); // <- Libera si hay error de validación
      return;
    }

    setStatusPopup(STATUS.LOADING);
    setStatusMessage('Creando vault...');

    try {
      const access_token = localStorage.getItem('access_token');
      console.log(" Enviando petición para crear vault:", {
        vault_title: vaultName.trim(),
        logical_path: logicalPath.trim(),
        is_private: isPrivate
      });

      const response = await fetch('http://localhost:8010/api/vaults', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,   //  obligatorio SIEMPRE RECORDAR CHICOS
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vault_title: vaultName.trim(),
          logical_path: logicalPath.trim(),
          is_private: isPrivate
        }),
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await response.json();

      if( result.result !== 1 )
        throw new Error( result.message || 'Error desconocido al crear vault' );

      // Muestra el popup de éxito inmediatamente
      setStatusPopup(STATUS.SUCCESS);
      setStatusMessage('¡Vault creada con éxito!');

      // Espera 2 segundos antes de cerrar el popup (ya tienes autoCloseDelay)
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(" Vault creada correctamente:", result.data);

      // Llama al callback para actualizar el sidebar
      onCreateVault({
        ...result.data,
        name: result.data.vault_title,
        id: result.data.vault_id2
      });

    } catch (error) {
      console.error(" Error al crear vault:", error);
      setStatusPopup(STATUS.ERROR);
      setStatusMessage('Error al crear la vault');
      setErrorMessage(error.message || 'Error desconocido');
    } finally {
      setIsCreating(false);
    }
  };

  //----------------------------------------------------------------------------------//
   // Maneja la finalización del mensaje de estado (éxito o error)
  //----------------------------------------------------------------------------------//
  const handleStatusComplete = () => {
    if (statusPopup === STATUS.SUCCESS) {
      // Si fue exitoso, cerrar el modal
      handleClose();
    } else {
      // Si fue error, solo ocultar el popup
      setStatusPopup(null);
    }
  };

  /**
   * Maneja eventos de teclado para navegación y acciones
   * @param {KeyboardEvent} e - Evento de teclado
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      // Cerrar modal con Escape
      handleClose();
    } else if (e.key === 'Enter' && !isCreating) {
      e.preventDefault(); // Previene un submit doble
      if (step === 1 && !isPrivate) {
       
        // Solo se crea desde el botón
      } else if (step === 1 && isPrivate) {
        handleNextStep();
      } else if (step === 2) {
        handleCreateVault();
      }
    }
  };

  //====================================================================================//
  //                  MANEJADORES DE CAMBIO EN CAMPOS DEL FORMULARIO                   //
  //====================================================================================//

  /**
   * Maneja el cambio en el campo de nombre de la vault
   * y valida en tiempo real
   * @param {Event} e - Evento de cambio
   */
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setVaultName(newName);

    // Validar nombre y actualizar estado de error
    const { isValid, errorMessage } = validateVaultName(newName);
    setNameError(isValid ? '' : errorMessage);
  };

  /**
   * Maneja el cambio en el campo de ruta del directorio
   * y valida en tiempo real
   * @param {Event} e - Evento de cambio
   */
  const handleFolderPathChange = (e) => {
    const newPath = e.target.value;
    setLogicalPath(newPath);

    // Validar ruta y actualizar estado de error
    const { isValid, errorMessage } = validateFolderPath(newPath);
    setFolderPathError(isValid ? '' : errorMessage);
  };

  /**
   * Maneja la selección de directorio desde el componente FolderPickerButton
   * @param {string} folderPath - Ruta del directorio seleccionado
   */
  const handleFolderSelected = (folderPath) => {
    setLogicalPath(folderPath);
    setFolderPathError('');
  };

  /**
   * Maneja el cambio en el campo de PIN y filtra caracteres no numéricos
   * @param {Event} e - Evento de cambio
   */
  const handlePinChange = (e) => {
    const originalValue = e.target.value;
    // Filtrar caracteres no numéricos del PIN
    const numericValue = originalValue.replace(/\D/g, '');

    // Si se eliminaron caracteres no numéricos, mostrar error
    if (originalValue !== numericValue) {
      setPin(numericValue);
      setPinError('El PIN solo puede contener números');
      return;
    }

    setPin(numericValue);

    // Validar PIN y actualizar estado de error
    const { isValid, errorMessage } = validatePin(numericValue);
    setPinError(isValid ? '' : errorMessage);

    // Validar coincidencia con confirmación si ya existe
    if (confirmPin) {
      setConfirmPinError(numericValue === confirmPin ? '' : 'Los PINs no coinciden');
    }
  };

  /**
   * Maneja el cambio en el campo de confirmación de PIN y filtra caracteres no numéricos
   * @param {Event} e - Evento de cambio
   */
  const handleConfirmPinChange = (e) => {
    const originalValue = e.target.value;
    // Filtrar caracteres no numéricos del PIN
    const numericValue = originalValue.replace(/\D/g, '');

    // Si se eliminaron caracteres no numéricos, mostrar error
    if (originalValue !== numericValue) {
      setConfirmPin(numericValue);
      setConfirmPinError('El PIN solo puede contener números');
      return;
    }

    setConfirmPin(numericValue);

    // Validar coincidencia con PIN principal
    setConfirmPinError(pin === numericValue ? '' : 'Los PINs no coinciden');
  };

  //====================================================================================//
  //                  MANEJADORES DE EVENTOS BLUR (PÉRDIDA DE FOCO)                    //
  //====================================================================================//

  //----------------------------------------------------------------------------------//
  // Valida el nombre cuando el campo pierde el foco
  //----------------------------------------------------------------------------------//
  const handleNameBlur = () => {
    const { isValid, errorMessage } = validateVaultName(vaultName);
    setNameError(isValid ? '' : errorMessage);
  };

  /**
   * Valida la ruta cuando el campo pierde el foco
   */
  const handleFolderPathBlur = () => {
    const { isValid, errorMessage } = validateFolderPath(logicalPath);
    setFolderPathError(isValid ? '' : errorMessage);
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
    if (confirmPin) {
      // Verificar que los PINs coincidan
      setConfirmPinError(pin === confirmPin ? '' : 'Los PINs no coinciden');
    } else if (pin) {
      // Si hay pin principal pero no de confirmación
      setConfirmPinError('Debes confirmar el PIN');
    }
  };

  //====================================================================================//
  //                                RENDERIZADO                                         //
  //====================================================================================//

  // No renderizar nada si el modal está cerrado
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown}>
      <div className="modal-container create-vault-modal">
        {/* Cabecera del modal con título e icono */}
        <div className="modal-header">
          <div className="modal-title-container">
            <VaultIcon className="modal-icon" />
            <h2 className="modal-title">
              {step === 1 ? "Nueva Vault" : "Configurar Vault Privada"}
            </h2>
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

          {/* Paso 1: Información básica de la vault */}
          {step === 1 && (
            <>
              <p className="modal-description">
                Las vaults te permiten organizar tus datos en diferentes espacios de trabajo.
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
                  onChange={(e) => {
                    const newName = e.target.value;
                    setVaultName(newName);

                    // Si la ruta lógica empieza por /SynapsVaults/, actualízala dinámicamente
                    if (logicalPath.startsWith('/SynapsVaults/')) {
                      setLogicalPath(`/SynapsVaults/${newName}`);
                    }
                  }}
                  onBlur={handleNameBlur}
                  disabled={isCreating}
                  maxLength={50}
                  autoComplete="off"
                />
                {/* Mensaje de error para el campo de nombre */}
                {nameError && (
                  <span className="input-error">{nameError}</span>
                )}
              </div>
              
              {/* Campo para la ruta lógica */}
              <div className="input-group">
                <label className="input-label">Ruta lógica</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Ej: /Trabajo/2025"
                    value={logicalPath}
                    onChange={(e) => setLogicalPath(e.target.value)}
                    className="input-field"
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                      const name = vaultName.trim() || '';
                      setLogicalPath(`/SynapsVaults/${name}`);
                    }}
                  >
                    <ArchiveIcon size={20} />
                  </button>
                </div>
                {/* Mensaje de error o ayuda */}
                {folderPathError ? (
                  <span className="input-error">{folderPathError}</span>
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem", display: "block" }}>
                    {logicalPath ? 
                      "Ubicación seleccionada." : 
                      "Selecciona una ruta lógica para guardar los archivos de la vault."}
                  </span>
                )}
              </div>

              {/* Opción de vault privada con checkbox personalizado circular */}
              <div className="checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    disabled={isCreating}
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
            </>
          )}

          {/* Paso 2: Configuración de PIN para vault privada */}
          {step === 2 && (
            <>
              <p className="modal-description">
                Establece un PIN para proteger tu vault. Necesitarás ingresarlo cada vez que quieras acceder a esta vault.
              </p>
              
              {/* Campo para el PIN de acceso */}
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
                  className={`input-field ${pinError ? 'error' : ''}`}
                  placeholder="Mínimo 4 dígitos"
                  value={pin}
                  onChange={handlePinChange}
                  onBlur={handlePinBlur}
                  disabled={isCreating}
                  maxLength={8}
                  autoComplete="new-password"
                />
                {/* Mensaje de error para el campo de PIN */}
                {pinError && (
                  <span className="input-error">{pinError}</span>
                )}
              </div>

              {/* Campo para confirmar el PIN */}
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
                  disabled={isCreating}
                  maxLength={8}
                  autoComplete="new-password"
                />
                {/* Mensaje de error para el campo de confirmación de PIN */}
                {confirmPinError && (
                  <span className="input-error">{confirmPinError}</span>
                )}
              </div>

              {/* Nota de seguridad sobre el PIN */}
              <p className="security-note">
                <strong>Nota de seguridad:</strong> No podrás recuperar el contenido de esta vault si olvidas el PIN.
              </p>
            </>
          )}
        </div>

        {/* Pie del modal con botones de acción */}
        <div className="modal-footer">
          {/* Botones para el paso 1 */}
          {step === 1 && (
            <>
              <button className="modal-button secondary" onClick={handleClose} disabled={isCreating}>
                Cancelar
              </button>
              <button 
                className="modal-button primary" 
                onClick={isPrivate ? handleNextStep : handleCreateVault}
                disabled={isCreating || !vaultName.trim() || nameError || !logicalPath.trim() || folderPathError}
              >
                {isPrivate ? "Siguiente" : (isCreating ? "Creando..." : "Crear Vault")}
              </button>
            </>
          )}

          {/* Botones para el paso 2 */}
          {step === 2 && (
            <>
              <button className="modal-button secondary" onClick={handlePrevStep} disabled={isCreating}>
                Volver
              </button>
              <button 
                className="modal-button primary" 
                onClick={handleCreateVault}
                disabled={isCreating || !pin || pinError || !confirmPin || confirmPinError}
              >
                {isCreating ? "Creando..." : "Crear Vault Privada"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

//=====================================================================================//
//                          FUNCIÓN PARA OBTENER NOMBRE DE USUARIO                     //
//=====================================================================================//
const getUsernameFromEmail = () => {
  const token = localStorage.getItem('token');
  if (!token) return 'usuario';

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email || payload.preferred_username || '';
    return email.split('@')[0] || 'usuario';
  } catch {
    return 'usuario';
  }
};


//====================================================================================//
//                                EXPORTACIÓN                                         //
//====================================================================================//

export default CreateVaultModal;
