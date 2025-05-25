//===========================================================================//
//                FORMULARIO DE REGISTRO CON VALIDACIONES EN TIEMPO REAL     //
//===========================================================================//
//  Este componente implementa un formulario de registro de dos pasos con     //
//  validaciones exhaustivas en tiempo real. Incluye validación de formato,  //
//  detección de emojis, caracteres especiales y feedback visual inmediato   //
//  para mejorar la experiencia del usuario durante el proceso de registro.  //
//===========================================================================//

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useState, useEffect } from 'react';
import { http_post } from '../../lib/http.js';
import '../../styles/register.css';
//===========================================================================//

/**
 * Componente principal del formulario de registro con validaciones en tiempo real
 * Implementa un flujo de dos pasos: datos personales y configuración de contraseña
 * @returns {JSX.Element} Formulario de registro completo con validaciones
 */
const RegisterForm = () => {
  //---------------------------------------------------------------------------//
  //  Estados para el control del flujo del formulario de dos pasos            //
  //---------------------------------------------------------------------------//
  const [formStep, setFormStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('');
  const [error_msg, set_error_msg] = useState('');

  //---------------------------------------------------------------------------//
  //  Estados para los campos de entrada del formulario                        //
  //---------------------------------------------------------------------------//
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //---------------------------------------------------------------------------//
  //  Estados para mensajes de error específicos de cada campo                 //
  //---------------------------------------------------------------------------//
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  //---------------------------------------------------------------------------//
  //  Estados para controlar si un campo ha sido tocado (interactuado)         //
  //---------------------------------------------------------------------------//
  const [nameTouched, setNameTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  //---------------------------------------------------------------------------//
  //  Estados para habilitar/deshabilitar botones de navegación                //
  //---------------------------------------------------------------------------//
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [isStep2Valid, setIsStep2Valid] = useState(false);

  //---------------------------------------------------------------------------//
  //  Función para validar el nombre completo del usuario                      //
  //---------------------------------------------------------------------------//
  /**
   * Valida el campo nombre con múltiples criterios de seguridad
   * @param {string} value - Valor del campo nombre a validar
   * @returns {boolean} - true si es válido, false si hay errores
   */
  const validateName = (value) => {
    // Verificar que el nombre no esté vacío
    if (value.trim() === '') {
      setNameError('El nombre no puede estar vacío');
      return false;
    }
    
    // Evitar más de un espacio consecutivo para mantener formato limpio
    if (value.includes('  ')) {
      setNameError('El nombre no puede contener más de un espacio consecutivo');
      return false;
    }
    
    // Prohibir números en el nombre para mayor autenticidad
    if (/\d/.test(value)) {
      setNameError('El nombre no puede contener números');
      return false;
    }
    
    // Solo permitir letras y espacios - caracteres especiales prohibidos
    if (/[^\p{L}\p{M}\s]/u.test(value)) {
      setNameError('El nombre no puede contener caracteres especiales');
      return false;
    }
    
    // Detección de emojis y caracteres unicode especiales
    if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
      setNameError('El nombre no puede contener emojis');
      return false;
    }
    
    // Limpiar error si todas las validaciones pasan
    setNameError('');
    return true;
  };

  //---------------------------------------------------------------------------//
  //  Función para validar el nombre de usuario único                          //
  //---------------------------------------------------------------------------//
  /**
   * Valida el campo username con criterios específicos para identificadores
   * @param {string} value - Valor del campo username a validar
   * @returns {boolean} - true si es válido, false si hay errores
   */
  const validateUsername = (value) => {
    // Verificar que el usuario no esté vacío
    if (value.trim() === '') {
      setUsernameError('El nombre de usuario no puede estar vacío');
      return false;
    }
    
    // Los usernames no pueden contener espacios para evitar ambigüedad
    if (/\s/.test(value)) {
      setUsernameError('El nombre de usuario no puede contener espacios');
      return false;
    }
    
    // Solo permitir letras, números, guiones y subrayados
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError('El nombre de usuario no puede contener caracteres especiales');
      return false;
    }
    
    // Detección de emojis para mantener compatibilidad con sistemas
    if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
      setUsernameError('El nombre de usuario no puede contener emojis');
      return false;
    }
    
    // Limpiar error si todas las validaciones pasan
    setUsernameError('');
    return true;
  };

  //---------------------------------------------------------------------------//
  //  Función para validar el formato y contenido del correo electrónico       //
  //---------------------------------------------------------------------------//
  /**
   * Valida el campo email con verificación de formato RFC compliant
   * @param {string} value - Valor del campo email a validar
   * @returns {boolean} - true si es válido, false si hay errores
   */
  const validateEmail = (value) => {
    // Verificar que el email no esté vacío
    if (value.trim() === '') {
      setEmailError('El correo electrónico no puede estar vacío');
      return false;
    }
    
    // Los emails no pueden contener espacios según RFC
    if (/\s/.test(value)) {
      setEmailError('El correo electrónico no puede contener espacios');
      return false;
    }
    
    // Validación de formato básico de email con regex RFC-like
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Formato de correo incorrecto (ejemplo: usuario@dominio.com)');
      return false;
    }
    
    // Detección de emojis para evitar problemas de compatibilidad
    if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
      setEmailError('El correo electrónico no puede contener emojis');
      return false;
    }
    
    // Limpiar error si todas las validaciones pasan
    setEmailError('');
    return true;
  };

  //---------------------------------------------------------------------------//
  //  Función para validar la contraseña con múltiples criterios de seguridad  //
  //---------------------------------------------------------------------------//
  /**
   * Valida la contraseña con criterios estrictos de seguridad
   * @param {string} value - Valor del campo contraseña a validar
   * @returns {boolean} - true si es válido, false si hay errores
   */
  const validatePassword = (value) => {
    // Verificar que la contraseña no esté vacía
    if (value === '') {
      setPasswordError('La contraseña no puede estar vacía');
      return false;
    }
    
    // Las contraseñas no pueden contener espacios por seguridad
    if (/\s/.test(value)) {
      setPasswordError('La contraseña no puede contener espacios');
      return false;
    }
    
    // Longitud mínima de 6 caracteres para seguridad básica
    if (value.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    // Debe contener al menos una letra mayúscula
    if (!/[A-Z]/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una mayúscula');
      return false;
    }
    
    // Debe contener al menos una letra minúscula
    if (!/[a-z]/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una minúscula');
      return false;
    }
    
    // Debe contener al menos un dígito numérico
    if (!/\d/.test(value)) {
      setPasswordError('La contraseña debe contener al menos un número');
      return false;
    }
    
    // Debe contener al menos un carácter especial para mayor seguridad
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
      setPasswordError('La contraseña debe contener al menos un carácter especial');
      return false;
    }
    
    // Detección de emojis para evitar problemas de codificación
    if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
      setPasswordError('La contraseña no puede contener emojis');
      return false;
    }
    
    // Limpiar error si todas las validaciones pasan
    setPasswordError('');
    return true;
  };

  //---------------------------------------------------------------------------//
  //  Función para validar la confirmación de contraseña                       //
  //---------------------------------------------------------------------------//
  /**
   * Valida que la confirmación de contraseña coincida con la original
   * @param {string} value - Valor del campo confirmación a validar
   * @returns {boolean} - true si es válido, false si hay errores
   */
  const validateConfirmPassword = (value) => {
    // Verificar que la confirmación no esté vacía
    if (value === '') {
      setConfirmPasswordError('Debe confirmar la contraseña');
      return false;
    }
    
    // Detección de emojis en la confirmación
    if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
      setConfirmPasswordError('La confirmación de contraseña no puede contener emojis');
      return false;
    }
    
    // Verificar que las contraseñas coincidan exactamente
    if (value !== password) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      return false;
    }
    
    // Limpiar error si todas las validaciones pasan
    setConfirmPasswordError('');
    return true;
  };

  //---------------------------------------------------------------------------//
  //  Efecto para validación en tiempo real del Paso 1                         //
  //---------------------------------------------------------------------------//
  /**
   * Hook effect que valida los campos del primer paso cuando cambian
   * Solo habilita el botón "Siguiente" cuando todos los campos son válidos
   */
  useEffect(() => {
    // Solo validar campos que han sido tocados por el usuario
    const nameValid = !nameTouched || (name ? validateName(name) : false);
    const usernameValid = !usernameTouched || (username ? validateUsername(username) : false);
    const emailValid = !emailTouched || (email ? validateEmail(email) : false);
    
    // Verificar que todos los campos han sido completados y tocados
    const allFieldsTouched = nameTouched && usernameTouched && emailTouched;
    const allFieldsValid = nameValid && usernameValid && emailValid;
    
    // Habilitar botón solo si todos los campos son válidos y han sido tocados
    setIsStep1Valid(allFieldsTouched && allFieldsValid);
  }, [name, username, email, nameTouched, usernameTouched, emailTouched]);

  //---------------------------------------------------------------------------//
  //  Efecto para validación en tiempo real del Paso 2                         //
  //---------------------------------------------------------------------------//
  /**
   * Hook effect que valida los campos del segundo paso cuando cambian
   * Solo habilita el botón "Crear Cuenta" cuando ambos campos son válidos
   */
  useEffect(() => {
    // Solo validar campos que han sido tocados por el usuario
    const passwordValid = !passwordTouched || (password ? validatePassword(password) : false);
    const confirmValid = !confirmPasswordTouched || (confirmPassword ? validateConfirmPassword(confirmPassword) : false);
    
    // Verificar que ambos campos han sido completados y tocados
    const allFieldsTouched = passwordTouched && confirmPasswordTouched;
    const allFieldsValid = passwordValid && confirmValid;
    
    // Habilitar botón solo si ambos campos son válidos y han sido tocados
    setIsStep2Valid(allFieldsTouched && allFieldsValid);
  }, [password, confirmPassword, passwordTouched, confirmPasswordTouched]);

  //---------------------------------------------------------------------------//
  //  Manejadores de eventos onChange para campos de entrada                   //
  //---------------------------------------------------------------------------//
  
  /**
   * Maneja los cambios en el campo nombre con validación condicional
   */
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    // Solo validar si el campo ya ha sido tocado previamente
    if (nameTouched) {
      validateName(value);
    }
  };
  
  /**
   * Maneja los cambios en el campo username con validación condicional
   */
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    // Solo validar si el campo ya ha sido tocado previamente
    if (usernameTouched) {
      validateUsername(value);
    }
  };
  
  /**
   * Maneja los cambios en el campo email con validación condicional
   */
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Solo validar si el campo ya ha sido tocado previamente
    if (emailTouched) {
      validateEmail(value);
    }
  };
  
  /**
   * Maneja los cambios en el campo contraseña con validación cruzada
   */
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    // Solo validar si el campo ya ha sido tocado previamente
    if (passwordTouched) {
      validatePassword(value);
    }
    
    // Re-validar confirmación si ya ha sido completada
    if (confirmPasswordTouched && confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };
  
  /**
   * Maneja los cambios en el campo confirmación de contraseña
   */
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    // Solo validar si el campo ya ha sido tocado previamente
    if (confirmPasswordTouched) {
      validateConfirmPassword(value);
    }
  };

  //---------------------------------------------------------------------------//
  //  Manejadores de eventos onBlur para activar validaciones                  //
  //---------------------------------------------------------------------------//
  
  /**
   * Marca el campo nombre como tocado y ejecuta validación
   */
  const handleNameBlur = () => {
    setNameTouched(true);
    validateName(name);
  };
  
  /**
   * Marca el campo username como tocado y ejecuta validación
   */
  const handleUsernameBlur = () => {
    setUsernameTouched(true);
    validateUsername(username);
  };
  
  /**
   * Marca el campo email como tocado y ejecuta validación
   */
  const handleEmailBlur = () => {
    setEmailTouched(true);
    validateEmail(email);
  };
  
  /**
   * Marca el campo contraseña como tocado y ejecuta validación
   */
  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    validatePassword(password);
  };
  
  /**
   * Marca el campo confirmación como tocado y ejecuta validación
   */
  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordTouched(true);
    validateConfirmPassword(confirmPassword);
  };

  //---------------------------------------------------------------------------//
  //  Funciones para navegación entre pasos del formulario                     //
  //---------------------------------------------------------------------------//
  
  /**
   * Maneja la navegación al siguiente paso con validación forzada
   */
  const handleNextStep = (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados para mostrar errores
    setNameTouched(true);
    setUsernameTouched(true);
    setEmailTouched(true);
    
    // Ejecutar validación completa del paso 1
    const nameValid = validateName(name);
    const usernameValid = validateUsername(username);
    const emailValid = validateEmail(email);
    
    // Solo proceder si todos los campos son válidos
    if (!(nameValid && usernameValid && emailValid)) {
      return;
    }
    
    // Iniciar animación de transición hacia el siguiente paso
    setAnimationDirection('next');
    setIsAnimating(true);
    
    // Cambiar al paso 2 después de la animación
    setTimeout(() => {
      setFormStep(2);
      set_error_msg('');
      
      // Finalizar animación
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 300);
  };

  /**
   * Maneja la navegación al paso anterior con animación
   */
  const handlePrevStep = (e) => {
    e.preventDefault();
    
    // Iniciar animación de transición hacia el paso anterior
    setAnimationDirection('prev');
    setIsAnimating(true);
    
    // Cambiar al paso 1 después de la animación
    setTimeout(() => {
      setFormStep(1);
      set_error_msg('');
      
      // Finalizar animación
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 300);
  };

  //---------------------------------------------------------------------------//
  //  Función para enviar el formulario al servidor                            //
  //---------------------------------------------------------------------------//
  /**
   * Maneja el envío final del formulario con validación completa
   * 
   * async: Función asíncrona que maneja el envío del formulario
   * @param {Event} e - Evento de envío del formulario
   */
  const handle_submit = async(e) => { 
    e.preventDefault();
    
    // Marcar todos los campos del paso 2 como tocados
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    
    // Ejecutar validación completa del paso 2
    const passwordValid = validatePassword(password);
    const confirmValid = validateConfirmPassword(confirmPassword);
    
    // Solo proceder si ambos campos son válidos
    if (!(passwordValid && confirmValid)) {
      return;
    }

    // Configuración de la petición HTTP, no se si esta bien xd
    let url = 'http://localhost:8010/api/register';
    let body = { name, username, email, password };

    try {
      // Enviar datos al servidor
      let http_response = await http_post(url, body);
      console.log(http_response);
      // TODO: Implementar redirección o mensaje de éxito :)
    } catch (error) {
      console.error('Error al registrar:', error);
      set_error_msg('Error al crear la cuenta. Inténtalo de nuevo.');
    }
  };

  //---------------------------------------------------------------------------//
  //  Renderizado del componente con estructura de dos pasos                   //
  //---------------------------------------------------------------------------//
  return (
    <div className="register-form-container">
      {/* Encabezado del formulario */}
      <div className="register-form-header">
        <h2>Crea tu cuenta</h2>
        <p>Conecta ideas, personas y proyectos en un solo lugar</p>
      </div>
      
      {/* Contenedor con animaciones de transición */}
      <div className="form-transition-container">
        <div className={`register-form ${
          isAnimating 
            ? (animationDirection === 'next' ? 'slide-out-left' : 'slide-out-right') 
            : 'slide-in'
        }`}>
          {formStep === 1 ? (
            //-----------------------------------------------------------------//
            //  PASO 1: Recolección de datos personales                       //
            //-----------------------------------------------------------------//
            <div className="form-content">
              {/* Campo: Nombre completo */}
              <div className="form-group">
                <label htmlFor="name">Nombre completo</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  className={nameTouched && nameError ? 'error' : ''}
                  required
                />
                {nameTouched && nameError && <div className="field-error">{nameError}</div>}
              </div>
              
              {/* Campo: Nombre de usuario */}
              <div className="form-group">
                <label htmlFor="username">Nombre de usuario</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  className={usernameTouched && usernameError ? 'error' : ''}
                  required
                />
                {usernameTouched && usernameError && <div className="field-error">{usernameError}</div>}
              </div>
              
              {/* Campo: Correo electrónico */}
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  className={emailTouched && emailError ? 'error' : ''}
                  required
                />
                {emailTouched && emailError && <div className="field-error">{emailError}</div>}
              </div>
              
              {/* Botón de navegación al siguiente paso */}
              <button 
                className="register-button" 
                onClick={handleNextStep}
                disabled={!isStep1Valid}
                type="button"
              >
                <span>Siguiente</span>
              </button>
            </div>
          ) : (
            //-----------------------------------------------------------------//
            //  PASO 2: Configuración de contraseña y confirmación            //
            //-----------------------------------------------------------------//
            <div className="form-content">
              {/* Campo: Contraseña */}
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={passwordTouched && passwordError ? 'error' : ''}
                  required
                />
                {passwordTouched && passwordError && <div className="field-error">{passwordError}</div>}
              </div>
              
              {/* Campo: Confirmación de contraseña */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  className={confirmPasswordTouched && confirmPasswordError ? 'error' : ''}
                  required
                />
                {confirmPasswordTouched && confirmPasswordError && 
                  <div className="field-error">{confirmPasswordError}</div>
                }
              </div>
              
              {/* Botones de navegación y envío */}
              <div className="form-buttons">
                <button className="back-button" onClick={handlePrevStep} type="button">
                  <span>ATRÁS</span>
                </button>
                
                <button 
                  className="register-button" 
                  onClick={handle_submit} 
                  type="button"
                  disabled={!isStep2Valid}
                >
                  <span>CREAR CUENTA</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mensaje de error general */}
      {error_msg && <div className="error-message">{error_msg}</div>}
    </div>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default RegisterForm;
//===========================================================================//