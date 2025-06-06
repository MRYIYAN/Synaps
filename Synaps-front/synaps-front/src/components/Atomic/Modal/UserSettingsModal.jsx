//====================================================================================//
//                           MODAL DE CONFIGURACIÓN DE USUARIO                        //
//====================================================================================//
//  Este componente implementa un modal para editar los datos del usuario.            //
//  Permite al usuario:                                                               //
//  1. Cambiar el nombre de usuario                                                   //
//  2. Cambiar el email                                                               //
//  3. Cambiar la contraseña                                                          //
//  4. Subir foto de perfil                                                           //
//  NOTA: Los campos nombre y apellido son solo visuales/decorativos                  //
//  y no se envían al backend para actualización.                                     //
//  Sin validaciones - acepta cualquier entrada del usuario.                          //
//====================================================================================//

import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";
import { ReactComponent as CameraIcon } from "../../../assets/icons/camera.svg";

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
  const [userName, setUserName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para cambio de contraseña
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  // TODO: Implementar estados para foto de perfil
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  
  // Estado para detectar cambios
  const [hasChanges, setHasChanges] = useState(false);

  // Referencias
  const firstInputRef = useRef(null);
  // TODO: Implementar referencia para input de archivo
  const fileInputRef = useRef(null);

  // Inicializar los campos cuando se abre el modal o cambia el usuario
  useEffect(() => {
    if (isOpen && currentUser) {
      setUserName(''); // Nombre real del usuario (vacío inicialmente)
      setUserLastName(''); // Apellido del usuario (vacío inicialmente)
      setUserEmail(currentUser.email || '');
      setUsername(currentUser.name || ''); // El name del sidebar va al username
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // TODO: Implementar inicialización de foto de perfil
      setProfilePhoto(null);
      setProfilePhotoPreview(currentUser.profile_photo || null);
      setHasChanges(false);
      setShowPasswordSection(false);
    }
  }, [isOpen, currentUser]);

  // Enfocar el primer campo cuando se abre el modal
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Verificar si hay cambios
  useEffect(() => {
    if (currentUser) {
      // Solo detectar cambios en los campos que realmente se van a actualizar
      const usernameChanged = username !== (currentUser.name || '');
      const emailChanged = userEmail !== (currentUser.email || '');
      const passwordChanged = newPassword.length > 0;
      // TODO: Implementar detección de cambios en foto de perfil
      const photoChanged = profilePhoto !== null;
      
      setHasChanges(usernameChanged || emailChanged || passwordChanged || photoChanged);
    }
  }, [username, userEmail, newPassword, profilePhoto, currentUser]);

  // TODO: Implementar funciones de foto de perfil
  // Manejar selección de foto de perfil
  const handlePhotoSelect = (e) => {
    // TODO: Implementar selección y validación de foto de perfil
    // - Validar tipo de archivo (solo imágenes)
    // - Validar tamaño (máximo 5MB)
    // - Crear preview de la imagen
    // - Manejar errores de validación
    console.log('TODO: Implementar handlePhotoSelect');
  };

  // Manejar clic en el área de foto
  const handlePhotoAreaClick = () => {
    // TODO: Implementar clic en área de foto para abrir selector de archivos
    console.log('TODO: Implementar handlePhotoAreaClick');
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      // Crear objeto de datos solo con los campos que el usuario quiere actualizar
      const userData = {};

      // Solo incluir nombre de usuario si cambió
      if (username.trim() !== (currentUser.name || '')) {
        userData.name = username.trim();
      }

      // Solo incluir email si cambió
      if (userEmail.trim() !== (currentUser.email || '')) {
        userData.email = userEmail.trim();
      }

      // Solo incluir contraseña si se está cambiando
      if (newPassword.length > 0) {
        userData.currentPassword = currentPassword;
        userData.newPassword = newPassword;
      }

      // TODO: Implementar subida de foto de perfil
      if (profilePhoto) {
        userData.profilePhoto = profilePhoto;
      }

      await onSaveUser(userData);
      onClose();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
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

  // Manejar tecla ESC - DESHABILITADO: Solo se puede cerrar con el icono
  // useEffect(() => {
  //   const handleEsc = (event) => {
  //     if (event.keyCode === 27 && isOpen) {
  //       handleCancel();
  //     }
  //   };
  //   document.addEventListener('keydown', handleEsc);
  //   return () => document.removeEventListener('keydown', handleEsc);
  // }, [isOpen, hasChanges]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content user-settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header-modern">
          <button 
            className="modal-close-button" 
            onClick={handleCancel}
            aria-label="Cerrar modal"
          >
            <CloseIcon />
          </button>
          <div className="modal-user-info">
            <div className="user-name-display">Configuración de Usuario</div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={`user-settings-form ${showPasswordSection ? 'password-section-active' : ''}`}>
          {/* Sección de foto de perfil - centrada */}
          <div className="profile-section-centered">
            <div className="profile-photo-wrapper">
              <div 
                className={`profile-photo-container ${profilePhotoPreview ? 'has-image' : ''}`}
                onClick={handlePhotoAreaClick}
              >
                {profilePhotoPreview ? (
                  <>
                    <img 
                      src={profilePhotoPreview} 
                      alt="Foto de perfil" 
                      className="profile-photo-preview"
                    />
                    <div className="photo-overlay">
                      <CameraIcon className="camera-icon" />
                    </div>
                  </>
                ) : (
                  <div className="photo-placeholder">
                    <CameraIcon className="camera-icon-placeholder" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
              {profilePhotoPreview && (
                <button
                  type="button"
                  className="change-photo-text"
                  onClick={handlePhotoAreaClick}
                >
                  Haz clic para cambiar
                </button>
              )}
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="form-fields-container">
            {/* Primera fila: Nombre y Apellido */}
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="userName" className="form-label">
                  Nombre
                </label>
                <div className="input-wrapper">
                  <input
                    ref={firstInputRef}
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder=""
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="form-group half-width">
                <label htmlFor="userLastName" className="form-label">
                  Apellido
                </label>
                <div className="input-wrapper">
                  <input
                    id="userLastName"
                    type="text"
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    placeholder=""
                    disabled={isSaving}
                  />
                </div>
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
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="juan@ejemplo.com"
                  disabled={isSaving}
                />
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
                  className="username-input"
                  placeholder="juanperez"
                  disabled={isSaving}
                />
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
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        disabled={isSaving}
                      />
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
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa una nueva contraseña"
                        disabled={isSaving}
                      />
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        disabled={isSaving}
                      />
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
