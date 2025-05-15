import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";
import { ReactComponent as VaultIcon } from "../../../assets/icons/vault.svg";
import { ReactComponent as LockIcon } from "../../../assets/icons/lock.svg";
import VaultStatusPopup, { STATUS } from "../PopUp/VaultStatusPopup";

/**
 * Modal para crear una nueva vault con opción de privacidad
 * @param {boolean} isOpen - Determina si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onCreateVault - Función para crear una nueva vault
 */
const CreateVaultModal = ({ isOpen, onClose, onCreateVault }) => {
  // Estado del formulario
  const [vaultName, setVaultName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // Paso actual del formulario
  const [isCreating, setIsCreating] = useState(false);

  // Estado del popup
  const [statusPopup, setStatusPopup] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Referencias para focus automático
  const nameInputRef = useRef(null);
  const pinInputRef = useRef(null);

  // Focus en el input cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (step === 1 && nameInputRef.current) {
          nameInputRef.current.focus();
        } else if (step === 2 && pinInputRef.current) {
          pinInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, step]);

  // Resetear el formulario al cerrarlo
  const handleClose = () => {
    // TODO: Implementar lógica de confirmación si hay datos no guardados
    setVaultName('');
    setIsPrivate(false);
    setPin('');
    setConfirmPin('');
    setStep(1);
    setStatusPopup(null);
    setStatusMessage('');
    setErrorMessage('');
    onClose();
  };

  // Manejar el cambio de paso
  const handleNextStep = () => {
    // TODO: Implementar validación del nombre antes de avanzar
    if (step === 1) {
      setStep(2);
    }
  };

  // Volver al paso anterior
  const handlePrevStep = () => {
    setStep(1);
  };

  // Validación de datos
  const validateForm = () => {
    // TODO: Implementar validación completa de los datos del formulario
    return true;
  };

  // Modificamos handleCreateVault para mejorar la experiencia con la animación
  const handleCreateVault = async () => {
    // Evitar múltiples envíos
    if (isCreating) return;
    
    // Validar el PIN si estamos en el paso 2
    if (step === 2) {
      if (pin !== confirmPin) {
        setStatusPopup(STATUS.ERROR);
        setStatusMessage('Los PINs no coinciden');
        setErrorMessage('Verifica que ambos PINs sean iguales');
        return;
      }
      
      if (pin.length < 4) {
        setStatusPopup(STATUS.ERROR);
        setStatusMessage('PIN demasiado corto');
        setErrorMessage('El PIN debe tener al menos 4 dígitos');
        return;
      }
    }
    
    setIsCreating(true);
    setStatusPopup(STATUS.LOADING);
    setStatusMessage('Creando vault...');
    
    try {
      // Simular delay para ver la animación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (step === 1 && !isPrivate) {
        // Crear vault normal
        await onCreateVault({
          name: vaultName.trim(),
          isPrivate: false
        });
      } else if (step === 2) {
        // Crear vault privada
        await onCreateVault({
          name: vaultName.trim(),
          isPrivate: true,
          pin: pin
        });
      }
      
      // Mostrar estado de éxito
      setStatusPopup(STATUS.SUCCESS);
      setStatusMessage('¡Vault creada con éxito!');
      
      // El modal se cerrará automáticamente
    } catch (error) {
      // Mostrar estado de error
      setStatusPopup(STATUS.ERROR);
      setStatusMessage('Error al crear la vault');
      setErrorMessage(error.message || 'Ya existe una vault con ese nombre.');
    } finally {
      setIsCreating(false);
    }
  };

  // Manejar la finalización del estado del popup
  const handleStatusComplete = () => {
    // Cuando el estado es SUCCESS, cerramos todo el modal
    if (statusPopup === STATUS.SUCCESS) {
      handleClose();
    } else {
      // Para estados de ERROR o cualquier otro, solo quitamos el popup
      setStatusPopup(null);
    }
  };

  // Cerrar modal al presionar Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' && !isCreating) {
      if (step === 1 && !isPrivate) {
        handleCreateVault();
      } else if (step === 1 && isPrivate) {
        handleNextStep();
      } else if (step === 2) {
        handleCreateVault();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown}>
      <div className="modal-container create-vault-modal">
        <div className="modal-header">
          <div className="modal-title-container">
            <VaultIcon className="modal-icon" />
            <h2 className="modal-title">
              {step === 1 ? "Nueva Vault" : "Configurar Vault Privada"}
            </h2>
          </div>
          <button 
            className="modal-close-button" 
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="modal-content">
          {/* Popup de estado */}
          {statusPopup && (
            <VaultStatusPopup
              status={statusPopup}
              message={statusMessage}
              errorMessage={errorMessage}
              onComplete={handleStatusComplete}
              autoCloseDelay={statusPopup === STATUS.SUCCESS ? 2000 : 0}
            />
          )}

          {step === 1 && (
            <>
              <p className="modal-description">
                Las vaults te permiten organizar tus datos en diferentes espacios de trabajo.
              </p>
              
              <div className="input-group">
                <label htmlFor="vault-name" className="input-label">
                  Nombre de la vault
                </label>
                <input
                  ref={nameInputRef}
                  id="vault-name"
                  type="text"
                  className="input-field"
                  placeholder="Ej: Trabajo, Personal, Proyectos..."
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  disabled={isCreating}
                  maxLength={50}
                  autoComplete="off"
                />
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    disabled={isCreating}
                  />
                  <span className="checkbox-label">
                    <LockIcon className="checkbox-icon" /> Vault privada con PIN
                  </span>
                </label>
                {isPrivate && (
                  <p className="checkbox-description">
                    Las vaults privadas requieren un PIN para acceder a su contenido.
                  </p>
                )}
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <p className="modal-description">
                Establece un PIN para proteger tu vault. Necesitarás ingresarlo cada vez que quieras acceder a esta vault.
              </p>
              
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
                  className="input-field"
                  placeholder="Mínimo 4 dígitos"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  disabled={isCreating}
                  maxLength={8}
                  autoComplete="new-password"
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="vault-pin-confirm" className="input-label">
                  Confirmar PIN
                </label>
                <input
                  id="vault-pin-confirm"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input-field"
                  placeholder="Vuelve a ingresar el PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  disabled={isCreating}
                  maxLength={8}
                  autoComplete="new-password"
                />
              </div>
              
              <p className="security-note">
                <strong>Nota de seguridad:</strong> No podrás recuperar el contenido de esta vault si olvidas el PIN.
              </p>
            </>
          )}
        </div>
        
        <div className="modal-footer">
          {step === 1 && (
            <>
              <button 
                className="modal-button secondary" 
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button 
                className="modal-button primary" 
                onClick={isPrivate ? handleNextStep : handleCreateVault}
                disabled={isCreating || !vaultName.trim()}
              >
                {isPrivate ? "Siguiente" : (isCreating ? "Creando..." : "Crear Vault")}
              </button>
            </>
          )}
          
          {step === 2 && (
            <>
              <button 
                className="modal-button secondary" 
                onClick={handlePrevStep}
                disabled={isCreating}
              >
                Volver
              </button>
              <button 
                className="modal-button primary" 
                onClick={handleCreateVault}
                disabled={isCreating || !pin || !confirmPin}
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

export default CreateVaultModal;