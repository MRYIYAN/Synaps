//====================================================================================//
//                        FORMULARIO DE DATOS DE USUARIO                              //
//====================================================================================//
//  Este componente implementa el segundo paso del formulario de registro,            //
//  solicitando información del perfil de usuario.                                    //
//====================================================================================//

import React from 'react';
import './RegisterForms.css';

// Íconos para los campos
import { ReactComponent as UsernameIcon } from '../../assets/icons/username.svg';
import { ReactComponent as ImageIcon } from '../../assets/icons/image.svg';
import { ReactComponent as BioIcon } from '../../assets/icons/bio.svg';
import { ReactComponent as PrivacyIcon } from '../../assets/icons/privacy.svg';

const UserDataForm = ({ 
  formData, 
  errors, 
  onChange, 
  onFileChange, 
  onNestedChange,
  onNext, 
  onPrev,
  usernameInputRef
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };
  
  return (
    <form className="register-step-form" onSubmit={handleSubmit}>
      <h2 className="form-step-title">Perfil de usuario</h2>
      
      <div className="form-group">
        <label htmlFor="username" className="input-label">
          Nombre de usuario
        </label>
        <div className="input-icon-container">
          <UsernameIcon className="input-icon" />
          <input
            ref={usernameInputRef}
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={onChange}
            className={`input-field ${errors.username ? 'error' : ''}`}
            placeholder="Nombre único para identificarte"
          />
        </div>
        {errors.username && <span className="input-error">{errors.username}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="profilePicture" className="input-label">
          Foto de perfil (opcional)
        </label>
        <div className="file-upload-container">
          <ImageIcon className="input-icon" />
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={onFileChange}
            className={`file-input ${errors.profilePicture ? 'error' : ''}`}
          />
          <div className="file-input-label">
            {formData.profilePicture ? formData.profilePicture.name : 'Seleccionar imagen'}
          </div>
        </div>
        {errors.profilePicture && <span className="input-error">{errors.profilePicture}</span>}
        
        {formData.profilePicture && (
          <div className="profile-preview">
            <img 
              src={URL.createObjectURL(formData.profilePicture)} 
              alt="Vista previa" 
            />
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="bio" className="input-label">
          Descripción (opcional)
        </label>
        <div className="input-icon-container textarea-container">
          <BioIcon className="input-icon" />
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={onChange}
            className={`input-field textarea ${errors.bio ? 'error' : ''}`}
            placeholder="Cuéntanos sobre ti"
            rows={3}
          />
        </div>
        {errors.bio && <span className="input-error">{errors.bio}</span>}
        <span className="character-count">
          {formData.bio.length}/500
        </span>
      </div>
      
      <div className="form-group">
        <label htmlFor="profileVisibility" className="input-label">
          Visibilidad del perfil
        </label>
        <div className="input-icon-container">
          <PrivacyIcon className="input-icon" />
          <select
            id="profileVisibility"
            value={formData.privacySettings.profileVisibility}
            onChange={(e) => onNestedChange('privacySettings', 'profileVisibility', e.target.value)}
            className="input-field"
          >
            <option value="public">Público</option>
            <option value="friends">Solo amigos</option>
            <option value="private">Privado</option>
          </select>
        </div>
        <span className="input-help">
          {formData.privacySettings.profileVisibility === 'public' && 
            'Cualquier persona podrá ver tu perfil'}
          {formData.privacySettings.profileVisibility === 'friends' && 
            'Solo tus amigos podrán ver tu perfil completo'}
          {formData.privacySettings.profileVisibility === 'private' && 
            'Tu perfil solo será visible para ti'}
        </span>
      </div>
      
      <div className="form-actions">
        <button type="button" className="modal-button secondary" onClick={onPrev}>
          Anterior
        </button>
        <button 
          type="submit" 
          className="modal-button primary"
          disabled={!formData.username || errors.username || errors.bio || errors.profilePicture}
        >
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default UserDataForm;