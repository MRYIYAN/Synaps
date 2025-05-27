//===========================================================================   //
//                             LOGIN DE SYNAPS                                  //
//===========================================================================   //
//  Este componente es un formulario de inicio de sesión que permite a los      //
//  usuarios ingresar su correo electrónico y contraseña. Al enviar el          // 
//  formulario, se realiza una solicitud POST a la API de inicio de sesión.     //
//===========================================================================   //

//===========================================================================//
//                            IMPORTS                                        //
//===========================================================================//
import React, { useState, useEffect } from "react";
// Importación única del CSS de login
import '../../styles/login.css';
//===========================================================================//

//===========================================================================//
//                             COMPONENTE LOGINFORM                         
//===========================================================================//
const LoginForm = () => {
  // Estados para el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para validaciones en tiempo real
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  // Función para validar correo electrónico
  const validateEmail = (value) => {
    if (!value) {
      return 'El correo electrónico no puede estar vacío';
    }
    
    // Comprobar si contiene emojis (rango unicode básico de emojis)
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(value)) {
      return 'El correo electrónico no puede contener emojis';
    }
    
    // Verificar formato de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value)) {
      return 'Formato de correo electrónico inválido';
    }
    
    return '';
  };
  
  // Función para validar contraseña
  const validatePassword = (value) => {
    if (!value) {
      return 'La contraseña no puede estar vacía';
    }
    
    // Comprobar si contiene emojis
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(value)) {
      return 'La contraseña no puede contener emojis';
    }
    
    // Verificar si contiene espacios
    if (value.includes(' ')) {
      return 'La contraseña no puede contener espacios';
    }
    
    return '';
  };
  
  // Manejadores para los cambios en los inputs con validación en tiempo real
  const handleEmailChange = (e) => {
    const newValue = e.target.value;
    setEmail(newValue);
    
    if (isEmailTouched) {
      setEmailError(validateEmail(newValue));
    }
  };
  
  const handlePasswordChange = (e) => {
    const newValue = e.target.value;
    setPassword(newValue);
    
    if (isPasswordTouched) {
      setPasswordError(validatePassword(newValue));
    }
  };
  
  // Manejadores para cuando el campo pierde el foco
  const handleEmailBlur = () => {
    setIsEmailTouched(true);
    setEmailError(validateEmail(email));
  };
  
  const handlePasswordBlur = () => {
    setIsPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  //---------------------------------------------------------------------------//
  //  Función para manejar el envío del formulario. Realiza una solicitud      //
  //  POST al backend con las credenciales del usuario.                        //
  //---------------------------------------------------------------------------//
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validación completa antes de enviar
    const emailErrorMsg = validateEmail(email);
    const passwordErrorMsg = validatePassword(password);
    
    // Marcar los campos como tocados para mostrar errores
    setIsEmailTouched(true);
    setIsPasswordTouched(true);
    
    // Actualizar mensajes de error
    setEmailError(emailErrorMsg);
    setPasswordError(passwordErrorMsg);
    
    // Detener el envío si hay errores de validación
    if (emailErrorMsg || passwordErrorMsg) {
      setError('Por favor, corrige los errores antes de continuar.');
      return;
    }
    
    // Borrar mensaje de error general si todo está correcto
    setError('');
    
    try {
      setLoading(true);
      setError('');
      
      // Actualizamos la URL para apuntar al endpoint /token
      let url = 'http://localhost:5005/token';

      // Ajustamos el formato del body para application/x-www-form-urlencoded
      const body = new URLSearchParams({
        grant_type: 'password',
        username: email,
        password: password
      });

      // Realizamos la solicitud para autenticar al usuario usando fetch
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
      });

      const http_data = await response.json();

      // Log temporal para inspeccionar la respuesta del servidor
      console.log("LOGIN RESPONSE:", http_data);

      // Si la consulta ha sido incorrecta, mostramos un mensaje más informativo
      if (!response.ok) {
        const error_message = http_data?.error || http_data?.message || 'Unknown error';
        
        // Personalizar mensajes de error comunes
        if (error_message.toLowerCase().includes('invalid_grant')) {
          throw new Error('Contraseña incorrecta. Por favor, verifica tus credenciales.');
        }
        else if (error_message.toLowerCase().includes('invalid_username') || 
            error_message.toLowerCase().includes('incorrect')) {
          throw new Error('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
        }
        
        throw new Error(error_message);
      }
      
      // Si la consulta ha sido correcta, guardamos el access_token y redirigimos
      if (http_data.access_token) {
        localStorage.setItem('access_token', http_data.access_token);
        window.location.href = '/markdowneditor'; // Redirigir a Markdown Editor
      }
      
    } catch (error) {
      // Manejamos los errores del servidor
      setError(error.message);
      console.error('Error al iniciar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  //---------------------------------------------------------------------------//
  //  Renderiza el formulario de inicio de sesión y muestra mensajes de error. //
  //---------------------------------------------------------------------------//
  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="login-title">
          BIENVENIDO A SYNAPS
        </h1>
        <div className="title-underline"></div>
        
        <div className="login-subtitle-container">
          <span className="login-subtitle">
            Conecta ideas, personas y proyectos en un solo lugar
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className={`login-form-group ${emailError && isEmailTouched ? 'has-error' : ''}`}>
          <label htmlFor="email" className="login-label">
            Correo electrónico:
          </label>
          <input 
            type="text" /* Cambiado de "email" a "text" para manejar la validación personalizada */
            id="email"
            className={`login-input ${emailError && isEmailTouched ? 'input-error' : ''}`}
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            required
          />
          {emailError && isEmailTouched && (
            <p className="input-error-message">
              <svg className="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {emailError}
            </p>
          )}
        </div>
        
        <div className={`login-form-group ${passwordError && isPasswordTouched ? 'has-error' : ''}`}>
          <label htmlFor="password" className="login-label">
            Contraseña:
          </label>
          <input 
            type="password"
            id="password"
            className={`login-input ${passwordError && isPasswordTouched ? 'input-error' : ''}`}
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            required
          />
          {passwordError && isPasswordTouched && (
            <p className="input-error-message">
              <svg className="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {passwordError}
            </p>
          )}
        </div>
        
        {/* Botón de inicio de sesión */}
        <div className="login-button-container">
          <button 
            type="submit" 
            className="login-button"
            disabled={loading || (isEmailTouched && emailError) || (isPasswordTouched && passwordError)}
          >
            <span className="login-button-text">
              {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESION'}
            </span>
          </button>
        </div>

        {/* Mostrar mensaje de error general si existe */}
        {error && (
          <div className="login-error-container">
            <p className="login-error">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

//===========================================================================//
//                             EXPORTACIÓN
//===========================================================================//
export default LoginForm;
//===========================================================================//