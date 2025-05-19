//====================================================================================//
//                        FORMULARIO DE DATOS PERSONALES                              //
//====================================================================================//
//  Este componente implementa el primer paso del formulario de registro,             //
//  solicitando información personal básica del usuario.                              //
//====================================================================================//

import React, { useEffect } from 'react';
import './RegisterForms.css';

// Íconos para los campos
import { ReactComponent as UserIcon } from '../../assets/icons/user.svg';
import { ReactComponent as EmailIcon } from '../../assets/icons/email.svg';
import { ReactComponent as CalendarIcon } from '../../assets/icons/calendar.svg';
import { ReactComponent as GenderIcon } from '../../assets/icons/gender.svg';

const PersonalDataForm = ({ formData, errors, onChange, onNext, nameInputRef }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };
  
  // Función para mejorar el efecto de flotación de labels
  // Puedes añadir esto en un useEffect en RegisterPage.jsx o en cada componente de formulario
  useEffect(() => {
    // Seleccionar todos los inputs con labels flotantes
    const inputs = document.querySelectorAll('.input-field');
    
    inputs.forEach(input => {
      // Verificar si el input ya tiene contenido al cargar
      if (input.value !== '') {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('floating-label')) {
          label.classList.add('active');
        }
      }
      
      // Evento focus
      input.addEventListener('focus', () => {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('floating-label')) {
          label.classList.add('active');
        }
      });
      
      // Evento blur
      input.addEventListener('blur', () => {
        if (input.value === '') {
          const label = input.nextElementSibling;
          if (label && label.classList.contains('floating-label')) {
            label.classList.remove('active');
          }
        }
      });
    });
    
    // Limpieza de event listeners
    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', () => {});
        input.removeEventListener('blur', () => {});
      });
    };
  }, []);
  
  return (
    <form className="register-step-form" onSubmit={handleSubmit}>
      <h2 className="form-step-title">Datos personales</h2>
      
      <div className="form-group">
        <div className="input-icon-container">
          <UserIcon className="input-icon" />
          <input
            ref={nameInputRef}
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
            className={`input-field ${errors.fullName ? 'error' : ''}`}
            placeholder=" " // Placeholder vacío pero con espacio para que el :not(:placeholder-shown) funcione
          />
          <label htmlFor="fullName" className="floating-label">
            Nombre completo
          </label>
        </div>
        {errors.fullName && <span className="input-error">{errors.fullName}</span>}
      </div>
      
      <div className="form-group">
        <div className="input-icon-container">
          <EmailIcon className="input-icon" />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className={`input-field ${errors.email ? 'error' : ''}`}
            placeholder=" "
          />
          <label htmlFor="email" className="floating-label">
            Correo electrónico
          </label>
        </div>
        {errors.email && <span className="input-error">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <div className="input-icon-container">
          <CalendarIcon className="input-icon" />
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={onChange}
            className={`input-field ${errors.birthDate ? 'error' : ''}`}
            max={new Date().toISOString().split('T')[0]} // No permite fechas futuras
            placeholder=" "
          />
          <label htmlFor="birthDate" className="floating-label">
            Fecha de nacimiento
          </label>
        </div>
        {errors.birthDate && <span className="input-error">{errors.birthDate}</span>}
      </div>
      
      <div className="form-group">
        <div className="input-icon-container">
          <GenderIcon className="input-icon" />
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={onChange}
            className="input-field"
          >
            <option value="" disabled hidden></option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="non-binary">No binario</option>
            <option value="other">Otro</option>
            <option value="prefer-not-to-say">Prefiero no decirlo</option>
          </select>
          <label htmlFor="gender" className="floating-label">
            Género (opcional)
          </label>
        </div>
      </div>
      
      <div className="form-actions">
        <div></div> {/* Espacio vacío para alinear el botón a la derecha */}
        <button 
          type="submit" 
          className="modal-button primary"
          disabled={!formData.fullName || !formData.email || !formData.birthDate || errors.fullName || errors.email || errors.birthDate}
        >
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default PersonalDataForm;