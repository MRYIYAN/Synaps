//====================================================================================//
//                           MODAL DE CONFIGURACIÓN DE USUARIO                        //
//====================================================================================//
//  Este componente implementa un modal para editar los datos del usuario.            //
//  Permite al usuario:                                                               //
//  1. Cambiar el nombre de usuario                                                   //
//  2. Cambiar el email                                                               //
//  3. Cambiar la contraseña                                                          //
//  NOTA: Los campos nombre y apellido son solo visuales/decorativos                  //
//  y no se envían al backend para actualización.                                     //
//  Sin validaciones - acepta cualquier entrada del usuario.                          //
//====================================================================================//

import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";
import { http_get, http_put } from '../../../lib/http';
import '../../styles/UserSettingsModal.css';  

/**
 * Modal para editar la configuración del usuario
 * @param {boolean} isOpen - Determina si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Object} currentUser - Datos actuales del usuario
 * @param {Function} onSaveUser - Función para guardar los cambios del usuario
 * @returns {JSX.Element|null} - Componente React o null si está cerrado
 */
const UserSettingsModal = ({ isOpen, onClose, currentUser, onSaveUser }) => {
  // Estados del formulario
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Estados para cambio de contraseña
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  // Estado para detectar cambios
  const [hasChanges, setHasChanges] = useState(false);

  // Estados para validación
  const [errors, setErrors] = useState({});
  const [validationMessages, setValidationMessages] = useState({});

  // Referencias
  const firstInputRef = useRef(null);

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  // Función para obtener el perfil del usuario usando http_get
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const url = `http://localhost:8010/api/user`;
      const { result, http_data } = await http_get(url);

      if (result === 1 && http_data.user) {
        setUserData(http_data.user);
        setUserFullName(http_data.user.user_full_name || '');
        setUserEmail(http_data.user.user_email || '');
        setUsername(http_data.user.user_name || '');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setHasChanges(false);
        setShowPasswordSection(false);
        setErrors({});
        setValidationMessages({});
      } else {
        throw new Error('Error al cargar perfil del usuario');
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar los datos del usuario'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si hay cambios
  useEffect(() => {
    if (userData) {
      const usernameChanged = username !== (userData.user_name || '');
      const fullNameChanged = userFullName !== (userData.user_full_name || '');
      const passwordChanged = newPassword.length > 0;
      
      setHasChanges(usernameChanged || fullNameChanged || passwordChanged);
    }
  }, [username, userFullName, newPassword, userData]);

  // Funciones de validación
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Al menos un símbolo especial');
    }
    return errors;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    setErrors({});
    setValidationMessages({});

    // Validaciones
    let hasValidationErrors = false;
    const newErrors = {};
    const newMessages = {};

    if (newPassword && newPassword !== confirmPassword) {
      hasValidationErrors = true;
      newErrors.confirmPassword = true;
      newMessages.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (newPassword) {
      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        hasValidationErrors = true;
        newErrors.newPassword = true;
        newMessages.newPassword = passwordErrors.join(', ');
      }
    }

    if (newPassword && !currentPassword) {
      hasValidationErrors = true;
      newErrors.currentPassword = true;
      newMessages.currentPassword = 'Debes ingresar tu contraseña actual';
    }

    if (hasValidationErrors) {
      setErrors(newErrors);
      setValidationMessages(newMessages);
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          title: 'Error de validación',
          message: 'Por favor corrige los errores antes de continuar'
        });
      }
      return;
    }

    setIsSaving(true);

    try {
      const url = `http://localhost:8010/api/user`;
      const updateData = {};

      // Solo incluir campos que cambiaron
      if (username.trim() !== (userData.user_name || '')) {
        updateData.name = username.trim(); // El backend espera 'name' para user_name
      }

      if (userFullName.trim() !== (userData.user_full_name || '')) {
        updateData.full_name = userFullName.trim(); // El backend espera 'full_name' para user_full_name
      }

      // Solo incluir contraseña si se está cambiando
      if (newPassword.length > 0) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const response = await http_put(url, updateData);
      const result = response.result;
      const http_data = response.http_data;

      if (result !== 1) {
        throw new Error(http_data?.message || 'Error al actualizar perfil');
      }

      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Perfil actualizado exitosamente'
        });
      }
      
      // Actualizar datos locales si se proporciona callback
      if (onSaveUser) {
        // Si la respuesta incluye los datos actualizados del usuario, usarlos
        if (http_data && http_data.user) {
          const updatedUserData = {
            ...userData,
            user_name: http_data.user.name || username.trim(),
            user_full_name: http_data.user.full_name || userFullName.trim()
          };
          onSaveUser(updatedUserData);
        } else {
          // Fallback con los datos locales
          const updatedUserData = {
            ...userData,
            user_name: username.trim(),
            user_full_name: userFullName.trim()
          };
          onSaveUser(updatedUserData);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          title: 'Error',
          message: error.message || 'Error al guardar los cambios'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (hasChanges) {
      const confirmClose = window.confirm('¿Estás seguro de que quieres cerrar? Se perderán los cambios no guardados.');
      if (!confirmClose) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content user-settings-modal">
          <div className="loading-container">
            <span className="loading-spinner"></span>
            <p>Cargando datos del usuario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content user-settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header-modern">
          <div className="modal-user-info">
            <div className="user-name-display">Configuración de Usuario</div>
          </div>
          <button 
            className="modal-close-button" 
            onClick={handleCancel}
            aria-label="Cerrar modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={`user-settings-form ${showPasswordSection ? 'password-section-active' : ''}`}>
          {/* Campos del formulario */}
          <div className="form-fields-container">
            {/* Campo de nombre completo */}
            <div className="form-group">
              <label htmlFor="userFullName" className="form-label">
                Nombre completo
              </label>
              <div className="input-wrapper">
                <input
                  ref={firstInputRef}
                  id="userFullName"
                  type="text"
                  className={errors.userFullName ? 'error' : ''}
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  disabled={isSaving}
                />
                {validationMessages.userFullName && (
                  <span className="error-message">{validationMessages.userFullName}</span>
                )}
              </div>
            </div>

            {/* Campo de email */}
            <div className="form-group">
              <label htmlFor="userEmail" className="form-label">
                Correo electrónico
              </label>
              <div className="input-wrapper">
                <input
                  id="userEmail"
                  type="email"
                  className={errors.userEmail ? 'error' : ''}
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="juan@ejemplo.com"
                  disabled={true}
                />
                {validationMessages.userEmail && (
                  <span className="error-message">{validationMessages.userEmail}</span>
                )}
              </div>
            </div>

            {/* Campo de username */}
            <div className="form-group username-group">
              <label htmlFor="username" className="form-label">
                Nombre de usuario
              </label>
              <div className="username-input-wrapper">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`username-input ${errors.username ? 'error' : ''}`}
                  placeholder="juanperez"
                  disabled={isSaving}
                />
                {validationMessages.username && (
                  <span className="error-message">{validationMessages.username}</span>
                )}
              </div>
            </div>

            {/* Sección de contraseña */}
            <div className="password-section">
              {!showPasswordSection ? (
                <button
                  type="button"
                  className="change-password-btn"
                  onClick={() => setShowPasswordSection(true)}
                  disabled={isSaving}
                >
                  Cambiar contraseña
                </button>
              ) : (
                <div className="password-fields">
                  <div className="form-group">
                    <label htmlFor="currentPassword" className="form-label">
                      Contraseña actual
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="currentPassword"
                        type="password"
                        className={errors.currentPassword ? 'error' : ''}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        disabled={isSaving}
                      />
                      {validationMessages.currentPassword && (
                        <span className="error-message">{validationMessages.currentPassword}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">
                      Nueva contraseña
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="newPassword"
                        type="password"
                        className={errors.newPassword ? 'error' : ''}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo"
                        disabled={isSaving}
                      />
                      {validationMessages.newPassword && (
                        <span className="error-message">{validationMessages.newPassword}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirmar nueva contraseña
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="confirmPassword"
                        type="password"
                        className={errors.confirmPassword ? 'error' : ''}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        disabled={isSaving}
                      />
                      {validationMessages.confirmPassword && (
                        <span className="error-message">{validationMessages.confirmPassword}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cancel-password-btn"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={isSaving}
                  >
                    Cancelar cambio de contraseña
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botones del modal */}
          <div className="modal-footer-modern">
            <div className="footer-right">
              <button 
                type="button" 
                className="modal-button secondary" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={`modal-button primary ${!hasChanges ? 'disabled' : ''}`}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <span className="loading-spinner"></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettingsModal;
