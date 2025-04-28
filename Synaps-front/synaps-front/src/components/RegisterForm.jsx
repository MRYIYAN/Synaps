// ----------------------------------------------------------------------
// RegisterForm.jsx
// ----------------------------------------------------------------------

// Importamos React, la librería HTTP y el CSS del componente
import React, { useState } from 'react';
import { http_post } from '../lib/http.js';

// import '../assets/styles/RegisterForm.css';


const RegisterForm = () => {

  // Inicializamos las variables para manejar los datos del POST y los errores
  const [username, set_username]    = useState( '' );
  const [email, set_email]          = useState( '' );
  const [password, set_password]    = useState( '' );
  const [error_msg, set_error_msg]  = useState( '' );

  //---------------------------------------------------------------------------//
  //  Función para manejar el envío del formulario. Realiza una solicitud      //
  //  POST al backend con las credenciales del usuario.                        //
  //---------------------------------------------------------------------------//
  const handle_submit = async( e ) => {
    
    // Evitamos los eventos por defecto
    e.preventDefault();
    e.stopPropagation();

    // Preparamos los datos para el post
    let url   = 'http://localhost:8010/api/register';
    let body  = {
        email
      , password
    };

    // Realizamos la llamada por fetch
    let http_response = await http_post( url, body );
    console.log( http_response );


    /*
    try {


      //------------------------------------------------------------------------//
      //  Realiza la solicitud al backend para autenticar al usuario.           //
      //------------------------------------------------------------------------//
      const res = await fetch( 'http://localhost:8010/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: 'include',
      });

      //------------------------------------------------------------------------//
      //  Verifica si la respuesta del servidor es exitosa.                     //
      //------------------------------------------------------------------------//
      if (!res.ok) {
        throw new Error( 'Login fallido' );
      }

      //------------------------------------------------------------------------//
      //  Procesa la respuesta del servidor y muestra un mensaje en la consola. //
      //------------------------------------------------------------------------//
      const data = await res.json();
      console.log( 'Login exitoso:', data);
    } catch (err) {
      //------------------------------------------------------------------------//
      //  Maneja errores y actualiza el mensaje de error en la interfaz.        //
      //------------------------------------------------------------------------//
      set_error_msg( 'Correo o contraseña incorrectos.' );
      console.error(err);
    }
    */
  };

  //---------------------------------------------------------------------------//
  //  Renderiza el formulario de inicio de sesión y muestra mensajes de error. //
  //---------------------------------------------------------------------------//

  return (
    <div>
      <h2>Registrarse</h2>
      <form onSubmit={handle_submit}>
        <input
          type='email'
          placeholder='Correo electrónico'
          value={email}
          onChange={(e) => set_email(e.target.value)}
          required
        /><br />
        <input
          type='password'
          placeholder='Contraseña'
          value={password}
          onChange={(e) => set_password(e.target.value)}
          required
        /><br />
        <button type='submit'>Entrar</button>
      </form>
      {error_msg && <p style={{ color: 'red' }}>{error_msg}</p>}
    </div>
  );
  
};
                      
export default RegisterForm;