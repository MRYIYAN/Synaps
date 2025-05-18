//====================================================================================//
//                       FORMULARIO DE CONTRASEÑA Y SEGURIDAD                         //
//====================================================================================//
//  Este componente implementa el tercer paso del formulario de registro,             //
//  solicitando información de seguridad y aceptación de términos.                    //
//====================================================================================//

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RegisterForms.css';

// Íconos para los campos
import { ReactComponent as LockIcon } from '../../assets/icons/lock.svg';
import { ReactComponent as CheckIcon } from '../../assets/icons/check.svg';
import { ReactComponent as EyeIcon } from '../../assets/icons/eye.svg';
import { ReactComponent as EyeSlashIcon } from '../../assets/icons/eye-slash.svg';
import { ReactComponent as QuestionIcon } from '../../assets/icons/question.svg';

const PasswordForm = ({ 
  formData, 
  errors, 
  onChange, 
  onPrev, 
  onSubmit,
  isSubmitting,
  submitResult,
  passwordInputRef
}) => {
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado para la fortaleza de la contraseña
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  
  // Calcular fortaleza de contraseña
  const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = '';
    
    if (!password) {
      return { score, feedback: 'Ingresa una contraseña' };
    }
    
    // Longitud mínima
    if (password.length >= 8) {
      score += 1;
    }
    
    // Contiene letra minúscula
    if (/[a-z]/.test(password)) {
      score += 1;
    }
    
    // Contiene letra mayúscula
    if (/[A-Z]/.test(password)) {
      score += 1;
    }
    
    // Contiene número
    if (/\d/.test(password)) {
      score += 1;
    }
    
    // Contiene caracter especial
    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    }
    
    // Feedback basado en la puntuación
    switch (true) {
      case (score <= 2):
        feedback = 'Contraseña débil';
        break;
      case (score === 3):
        feedback = 'Contraseña moderada';
        break;
      case (score === 4):
        feedback = 'Contraseña fuerte';
        break;
      case (score === 5):
        feedback = 'Contraseña muy fuerte';
        break;
      default:
        feedback = '';
    }
    
    return { score, feedback };
  };
  
  // Manejar cambio de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar el estado del formulario
    onChange(e);
    
    // Si es el campo de contraseña principal, calcular fortaleza
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };
  
  return (
    <form className="register-step-form" onSubmit={onSubmit}>
      <h2 className="form-step-title">Seguridad</h2>
      
      <div className="form-group">
        <label htmlFor="password" className="input-label">
          Contraseña
        </label>
        <div className="input-icon-container password-container">
          <LockIcon className="input-icon" />
          <input
            ref={passwordInputRef}
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handlePasswordChange}
            className={`input-field ${errors.password ? 'error' : ''}`}
            placeholder="Mínimo 8 caracteres"
          />
          <button 
            type="button" 
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password ? (
          <span className="input-error">{errors.password}</span>
        ) : passwordStrength.feedback && (
          <div className="password-strength-container">
            <div className="password-strength-bar">
              <div 
                className={`password-strength-indicator score-${passwordStrength.score}`}
                style={{ width: `${passwordStrength.score * 20}%` }}
              ></div>
            </div>
            <span className={`password-strength-text score-${passwordStrength.score}`}>
              {passwordStrength.feedback}
            </span>
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword" className="input-label">
          Confirmar contraseña
        </label>
        <div className="input-icon-container password-container">
          <LockIcon className="input-icon" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Repite tu contraseña"
          />
          <button 
            type="button" 
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex="-1"
          >
            {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="securityQuestion" className="input-label">
          Pregunta de seguridad (opcional)
        </label>
        <div className="input-icon-container">
          <QuestionIcon className="input-icon" />
          <select
            id="securityQuestion"
            name="securityQuestion"
            value={formData.securityQuestion}
            onChange={onChange}
            className="input-field"
          >
            <option value="">Selecciona una pregunta</option>
            <option value="first-pet">¿Cómo se llamaba tu primera mascota?</option>
            <option value="mother-maiden">¿Cuál es el apellido de soltera de tu madre?</option>
            <option value="birth-city">¿En qué ciudad naciste?</option>
            <option value="school">¿Cuál fue tu primera escuela?</option>
          </select>
        </div>
      </div>
      
      {formData.securityQuestion && (
        <div className="form-group">
          <label htmlFor="securityAnswer" className="input-label">
            Respuesta
          </label>
          <div className="input-icon-container">
            <input
              type="text"
              id="securityAnswer"
              name="securityAnswer"
              value={formData.securityAnswer}
              onChange={onChange}
              className={`input-field ${errors.securityAnswer ? 'error' : ''}`}
              placeholder="Tu respuesta"
            />
          </div>
          {errors.securityAnswer && <span className="input-error">{errors.securityAnswer}</span>}
        </div>
      )}
      
      <div className="checkbox-group">
        <label className="checkbox-container">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={onChange}
          />
          <span className="custom-checkbox">
            <CheckIcon />
          </span>
          <span className="checkbox-label">
            Acepto los <Link to="/terms" className="terms-link" target="_blank">términos y condiciones</Link>
          </span>
        </label>
        {errors.termsAccepted && <span className="input-error">{errors.termsAccepted}</span>}
      </div>
      
      {submitResult && (
        <div className={`submit-result ${submitResult.success ? 'success' : 'error'}`}>
          {submitResult.message}
        </div>
      )}
      
      <div className="form-actions">
        <button 
          type="button" 
          className="modal-button secondary" 
          onClick={onPrev}
          disabled={isSubmitting}
        >
          Anterior
        </button>
        <button 
          type="submit" 
          className="modal-button primary"
          disabled={isSubmitting || !formData.password || !formData.confirmPassword || errors.password || errors.confirmPassword || errors.securityAnswer || !formData.termsAccepted}
        >
          {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;