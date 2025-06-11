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
  const [success_msg, set_success_msg] = useState('');
  const [countdown, setCountdown] = useState(null);

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
  //  Estados para mostrar/ocultar contraseñas                                 //
  //---------------------------------------------------------------------------//
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //---------------------------------------------------------------------------//
  //  Función para validar el nombre completo del usuario                      //
  //---------------------------------------------------------------------------//
  /**
   * Valida el campo nombre con múltiples criterios de seguridad
   * @param {string} value - Valor del campo nombre a validar
   * @returns {boolean} - true si es válido, false si hay errores
   */
  const validateName = ( value ) => {
    // Inicializar value con valor por defecto
    let validationResult = false;
    
    // Verificar que el nombre no esté vacío
    if( value.trim() === '' ) {
      setNameError( 'El nombre no puede estar vacío' );
      return validationResult;
    }
    
    // Evitar más de un espacio consecutivo para mantener formato limpio
    if( value.includes( '  ' ) ) {
      setNameError( 'El nombre no puede contener más de un espacio consecutivo' );
      return validationResult;
    }
    
    // Prohibir números en el nombre para mayor autenticidad
    if( /\d/.test( value ) ) {
      setNameError( 'El nombre no puede contener números' );
      return validationResult;
    }
    
    // Solo permitir letras y espacios - caracteres especiales prohibidos
    if( /[^\p{L}\p{M}\s]/u.test( value ) ) {
      setNameError( 'El nombre no puede contener caracteres especiales' );
      return validationResult;
    }
    
    // Detección de emojis y caracteres unicode especiales
    if( /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test( value ) ) {
      setNameError( 'El nombre no puede contener emojis' );
      return validationResult;
    }
    
    // Limpiar error si todas las validaciones pasan
    setNameError( '' );
    validationResult = true;
    
    // Retornar value
    return validationResult;
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
    if(value.trim() === '') {
      setUsernameError('El nombre de usuario no puede estar vacío');
      return false;
    }
    
    // Los usernames no pueden contener espacios para evitar ambigüedad
    if(/\s/.test(value)) {
      setUsernameError('El nombre de usuario no puede contener espacios');
      return false;
    }
    
    // Solo permitir letras, números, guiones y subrayados
    if(!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError('El nombre de usuario no puede contener caracteres especiales');
      return false;
    }
    
    // Detección de emojis para mantener compatibilidad con sistemas
    if(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
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
    if(value.trim() === '') {
      setEmailError('El correo electrónico no puede estar vacío');
      return false;
    }
    
    // Los emails no pueden contener espacios según RFC
    if(/\s/.test(value)) {
      setEmailError('El correo electrónico no puede contener espacios');
      return false;
    }
    
    // Validación de formato básico de email con regex RFC-like
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(value)) {
      setEmailError('Formato de correo incorrecto (ejemplo: usuario@dominio.com)');
      return false;
    }
    
    // Detección de emojis para evitar problemas de compatibilidad
    if(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
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
    if(value === '') {
      setPasswordError('La contraseña no puede estar vacía');
      return false;
    }
    
    // Las contraseñas no pueden contener espacios por seguridad
    if(/\s/.test(value)) {
      setPasswordError('La contraseña no puede contener espacios');
      return false;
    }
    
    // Longitud mínima de 6 caracteres para seguridad básica
    if(value.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    // Debe contener al menos una letra mayúscula
    if(!/[A-Z]/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una mayúscula');
      return false;
    }
    
    // Debe contener al menos una letra minúscula
    if(!/[a-z]/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una minúscula');
      return false;
    }
    
    // Debe contener al menos un dígito numérico
    if(!/\d/.test(value)) {
      setPasswordError('La contraseña debe contener al menos un número');
      return false;
    }
    
    // Debe contener al menos un carácter especial para mayor seguridad
    if(!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
      setPasswordError('La contraseña debe contener al menos un carácter especial');
      return false;
    }
    
    // Detección de emojis para evitar problemas de codificación
    if(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
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
    if(value === '') {
      setConfirmPasswordError('Debe confirmar la contraseña');
      return false;
    }
    
    // Detección de emojis en la confirmación
    if(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)) {
      setConfirmPasswordError('La confirmación de contraseña no puede contener emojis');
      return false;
    }
    
    // Verificar que las contraseñas coincidan exactamente
    if(value !== password) {
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
    if(nameTouched) {
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
    if(usernameTouched) {
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
    if(emailTouched) {
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
    if(passwordTouched) {
      validatePassword(value);
    }
    
    // Re-validar confirmación si ya ha sido completada
    if(confirmPasswordTouched && confirmPassword) {
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
    if(confirmPasswordTouched) {
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
  const handleNextStep = ( e ) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados para mostrar errores
    setNameTouched( true );
    setUsernameTouched( true );
    setEmailTouched( true );
    
    // Ejecutar validación completa del paso 1
    const nameValid = validateName( name );
    const usernameValid = validateUsername( username );
    const emailValid = validateEmail( email );
    
    // Solo proceder si todos los campos son válidos
    if( !( nameValid && usernameValid && emailValid ) )
      return;
    
    // Iniciar animación de transición hacia el siguiente paso
    setAnimationDirection( 'next' );
    setIsAnimating( true );
    
    // Cambiar al paso 2 después de la animación
    setTimeout( () => {
      setFormStep( 2 );
      set_error_msg( '' );
      
      // Finalizar animación
      setTimeout( () => {
        setIsAnimating( false );
      }, 50 );
    }, 300 );
  };

  /**
   * Maneja la navegación al paso anterior con animación
   */
  const handlePrevStep = ( e ) => {
    e.preventDefault();
    
    // Iniciar animación de transición hacia el paso anterior
    setAnimationDirection( 'prev' );
    setIsAnimating( true );
    
    // Cambiar al paso 1 después de la animación
    setTimeout( () => {
      setFormStep( 1 );
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
   * @param {Event} e - Evento de envío del formulario
   * @returns {Promise<boolean>} true si el registro fue exitoso
   */
  const handle_submit = async( e ) => { 
    // Inicializar value con valor por defecto
    let value = false;
    
    e.preventDefault();
    
    // Marcar todos los campos del paso 2 como tocados
    setPasswordTouched( true );
    setConfirmPasswordTouched( true );
    
    // Ejecutar validación completa del paso 2
    const passwordValid = validatePassword( password );
    const confirmValid = validateConfirmPassword( confirmPassword );
    
    // Solo proceder si ambos campos son válidos
    if( !( passwordValid && confirmValid ) )
      return value;

    // Configuración de la petición HTTP
    let url = 'http://localhost:8010/api/register';
    let body = { name, username, email, password };

    try {

      // Enviar datos al servidor
      let { result, message, http_response } = await http_post( url, body );
      
      // Verificar si el registro fue exitoso
      if( result === 1 ) {
        set_error_msg( '' ); // Limpiar mensajes de error
        set_success_msg( '¡Registro exitoso! Redirigiendo al login en' );
        setCountdown( 3 ); // Inicializar countdown
        
        // Crear intervalo para la cuenta regresiva
        const countdownInterval = setInterval( () => {
          setCountdown( prevCount => {
            if( prevCount <= 1 ) {
              clearInterval( countdownInterval );
              window.location.href = '/login';
              return 0;
            }
            return prevCount - 1;
          } );
        }, 1000 );
        
        value = true;
      } else {
        // Mostrar mensaje de error del servidor
        const errorMessage = http_response?.message || 'Error al crear la cuenta. Inténtalo de nuevo.';
        set_success_msg( '' ); // Limpiar mensajes de éxito
        set_error_msg( errorMessage );
      }
    } catch( error ) {
      set_error_msg( 'Error al crear la cuenta. Inténtalo de nuevo.' );
    }
    
    // Retornar value
    return value;
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
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    className={`password-input ${passwordTouched && passwordError ? 'error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                        <path d="m2 2 20 20"/>
                      </svg>
                    ) : (
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordTouched && passwordError && <div className="field-error">{passwordError}</div>}
              </div>
              
              {/* Campo: Confirmación de contraseña */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <div className="password-input-container">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onBlur={handleConfirmPasswordBlur}
                    className={`password-input ${confirmPasswordTouched && confirmPasswordError ? 'error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                  >
                    {showConfirmPassword ? (
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                        <path d="m2 2 20 20"/>
                      </svg>
                    ) : (
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
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
      
      {/* Mensaje de éxito */}
      {success_msg && (
        <div className="success-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>
            {success_msg} {countdown !== null && (
              <span className="countdown-number">{countdown}</span>
            )} {countdown !== null && countdown > 1 ? 'segundos...' : countdown === 1 ? 'segundo...' : ''}
          </span>
        </div>
      )}
      
      {/* Enlace para login */}
      <div className="auth-link-container">
        <p className="auth-link-text">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="auth-link">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>

  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default RegisterForm;
//===========================================================================//