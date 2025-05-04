//===========================================================================   //
//                             LOGIN DE SYNAPS                                  //
//===========================================================================   //
//  Este componente es un formulario de inicio de sesión que permite a los      //
//  usuarios ingresar su correo electrónico y contraseña. Al enviar el          // 
//  formulario, se realiza una solicitud POST a la API de inicio de sesión.     //
//  Si la solicitud es exitosa, se muestra un mensaje de éxito en la consola.   //
//  Si hay un error, se muestra un mensaje de error en la interfaz de usuario.  //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       
//===========================================================================//
import React, { useState, useEffect } from "react";
import '../assets/styles/global.css';
import '../assets/js/pixelCanvas';
//===========================================================================//


//===========================================================================//
//                             COMPONENTE LOGINFORM                         
//===========================================================================//
const LoginForm = () => {

  //---------------------------------------------------------------------------//
  //  Estados para manejar los datos del formulario y los mensajes de error.   //
  //---------------------------------------------------------------------------//
  const [email, set_email]          = useState( '' );
  const [password, set_password]    = useState( '' );
  const [error_msg, set_error_msg]  = useState( '' );

  // Efecto para registrar el componente personalizado al cargar
  useEffect(() => {
    // Asegúrate de que el componente PixelCanvas esté registrado
    if (!customElements.get('pixel-canvas')) {
      try {
        // El componente ya se registra automáticamente cuando se importa el archivo
        console.log('PixelCanvas component registered');
      } catch (e) {
        console.error('Error registering PixelCanvas:', e);
      }
    }
  }, []);

  //---------------------------------------------------------------------------//
  //  Función para manejar el envío del formulario. Realiza una solicitud      //
  //  POST al backend con las credenciales del usuario.                        //
  //---------------------------------------------------------------------------//
  const handle_submit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
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
        throw new Error(error_message);
      }

      // Si la consulta ha sido correcta, guardamos el access_token y redirigimos
      if (http_data.access_token) {
        localStorage.setItem('access_token', http_data.access_token);
        window.location.href = '/home'; // Redirigir a HomePage
      }

    } catch (error) {
      // Manejamos los errores del servidor
      set_error_msg(error.message);
    }
  };

  //---------------------------------------------------------------------------//
  //  Renderiza el formulario de inicio de sesión y muestra mensajes de error. //
  //---------------------------------------------------------------------------//

  return (
    <div className="login-container">
      <h1 className="login-title">
        BIENVENIDO A SYNAPS
      </h1>
      
      <p className="login-subtitle">
        Conecta ideas, personas y proyectos en un solo lugar
      </p>
      
      <form onSubmit={handle_submit} className="login-form">
        <div className="login-form-group">
          <label className="login-label">
            Correo electrónico:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => set_email(e.target.value)}
            required
            className="login-input"
          />
        </div>
        
        <div className="login-form-group">
          <label className="login-label">
            Contraseña:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => set_password(e.target.value)}
            required
            className="login-input"
          />
        </div>
        
        <div className="login-button-container">
          <div className="login-button-pixel">
            <button 
              type="submit"
              className="login-button"
            >
              INICIAR SESION
            </button>
            <pixel-canvas data-colors="#F56E0F,#F56E0F,#F56E0F" data-gap="1"></pixel-canvas>
          </div>
        </div>
      </form>
      
      <div className="login-register-container">
        <p className="login-register-text">
          ¿Todavía no tienes una cuenta? <a href="/register" className="login-register-link">Registrarse</a>
        </p>
      </div>
      
      {error_msg && <p className="login-error">{error_msg}</p>}
    </div>
  );
  
};

//===========================================================================//
//                             EXPORTACIÓN                                  
//===========================================================================//
export default LoginForm;
//===========================================================================//