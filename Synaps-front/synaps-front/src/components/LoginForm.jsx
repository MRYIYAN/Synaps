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
import React, { useState } from "react";
import { http_post } from '../lib/http.js';
// import '../assets/styles/LoginForm.css';
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

  //---------------------------------------------------------------------------//
  //  Función para manejar el envío del formulario. Realiza una solicitud      //
  //  POST al backend con las credenciales del usuario.                        //
  //---------------------------------------------------------------------------//
  const handle_submit = async ( e ) => {

    e.preventDefault();
    e.stopPropagation();

    try {

      // Preparamos los datos para el post
      let url   = 'http://localhost:8010/api/login';
      let body  = {
          email
        , password
      };

      // Realizamos la solicitud para autenticar al usuario.
      const { result, message, http_data } = await http_post( url, body );

      // Si la consulta ha sido incorrecta, hacemos saltar una alerta
      if( http_data.result === 0 ) {

        // Calculamos el mensaje de error y lo lanzamos
        const error_message = ( http_data && http_data.message ) || message || 'Unknown error';
        throw new Error( error_message );
      }

      // Si la consulta ha sido correcta, guardamos el access_token
      localStorage.setItem( 'access_token', http_data.access_token );

    } catch( error ) {

      // Manejamos los errores del servidor
      set_error_msg( error.message );
    }
  };

  //---------------------------------------------------------------------------//
  //  Renderiza el formulario de inicio de sesión y muestra mensajes de error. //
  //---------------------------------------------------------------------------//

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handle_submit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => set_email(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => set_password(e.target.value)}
          required
        /><br />
        <button type="submit">Entrar</button>
      </form>
      {error_msg && <p style={{ color: "red" }}>{error_msg}</p>}
    </div>
  );
  
};

//===========================================================================//
//                             EXPORTACIÓN                                  
//===========================================================================//
export default LoginForm;
//===========================================================================//