//====================================================================================//
//                                COMPONENTES                                         //
//====================================================================================//
import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";
import { ReactComponent as VaultIcon } from "../../../assets/icons/vault.svg";
import { ReactComponent as LockIcon } from "../../../assets/icons/lock.svg";
import FolderPickerButton from '../Buttons/FolderPickerButton'; 
//=====================================================================================//

/**
 * Modal para crear una nueva vault con opción de privacidad
 * @param {boolean} isOpen - Determina si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onCreateVault - Función para crear una nueva vault
 */
const CreateVaultModal = ({ isOpen, onClose, onCreateVault }) => {
  //-------------------------// 
  // Estados del formulario 
  //------------------------//
  const [vaultName, setVaultName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // Paso actual del formulario
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFolderPath, setSelectedFolderPath] = useState(''); // Ruta seleccionada

  //-----------------------------------// 
  // Referencias para focus automático 
  //----------------------------------//
  const nameInputRef = useRef(null);
  const pinInputRef = useRef(null);

  //====================================================================================//
  //                                EFECTOS                                             //
  //====================================================================================//

  //-------------------------------------------// 
  // Focus en el input cuando se abre el modal 
  //------------------------------------------//
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

  //====================================================================================//
  //                                FUNCIONES PRINCIPALES                               //
  //====================================================================================//

  //---------------------------------------//
  //  Resetear el formulario al cerrarlo 
  //---------------------------------------//
  const handleClose = () => {
    setVaultName('');
    setIsPrivate(false);
    setPin('');
    setConfirmPin('');
    setStep(1);
    onClose();
  };

  //---------------------------------// 
  // Manejar el cambio de paso
  //---------------------------------//
  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  //-----------------------------// 
  // Volver al paso anterior
  //-----------------------------//
  const handlePrevStep = () => {
    setStep(1);
  };

  //--------------------------// 
  // Crear la vault 
  //--------------------------//
  const handleCreateVault = async () => {
    setIsCreating(true);

    try {
      if (step === 1 && !isPrivate) {
        await onCreateVault({
          name: vaultName.trim(),
          isPrivate: false,
          folderPath: selectedFolderPath
        });
      } else if (step === 2) {
        await onCreateVault({
          name: vaultName.trim(),
          isPrivate: true,
          pin: pin,
          folderPath: selectedFolderPath
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error al crear la vault:', error);
    } finally {
      setIsCreating(false);
    }
  };

  //------------------------------------//
  //  Cerrar modal al presionar Escape 
  //-----------------------------------//
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

  //====================================================================================//
  //                                RENDERIZADO                                         //
  //====================================================================================//

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
          {step === 1 && (
            <>
              <p className="modal-description">
                Las vaults te permiten organizar tus datos en diferentes espacios de trabajo.
              </p>
              
              <div className="input-group">
                <label htmlFor="vault-name" className="input-label">
                  Nombre de la vault
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    style={{ flex: 1 }}
                  />
                  <FolderPickerButton 
                    onFolderSelected={setSelectedFolderPath} 
                    disabled={isCreating} 
                  />
                </div>
                {selectedFolderPath && (
                  <span style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem", display: "block" }}>
                    {selectedFolderPath}
                  </span>
                )}
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

//====================================================================================//
//                                EXPORTACIÓN                                         //
//====================================================================================//

export default CreateVaultModal;