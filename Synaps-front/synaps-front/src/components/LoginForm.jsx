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
//===========================================================================//


//===========================================================================//
//                             COMPONENTE LOGINFORM                         
//===========================================================================//
const LoginForm = () => {

  //---------------------------------------------------------------------------//
  //  Estados para manejar los datos del formulario y los mensajes de error.   //
  //---------------------------------------------------------------------------//
  const [email, set_email]          = useState("");
  const [password, set_password]    = useState("");
  const [error_msg, set_error_msg]  = useState("");

  //---------------------------------------------------------------------------//
  //  Función para manejar el envío del formulario. Realiza una solicitud      //
  //  POST al backend con las credenciales del usuario.                        //
  //---------------------------------------------------------------------------//
  const handle_submit = async (e) => {
    e.preventDefault();

    try {
      //------------------------------------------------------------------------//
      //  Realiza la solicitud al backend para autenticar al usuario.           //
      //------------------------------------------------------------------------//
      const res = await fetch("http://localhost:8010/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: "include",
      });

      //------------------------------------------------------------------------//
      //  Verifica si la respuesta del servidor es exitosa.                     //
      //------------------------------------------------------------------------//
      if (!res.ok) {
        throw new Error("Login fallido");
      }

      //------------------------------------------------------------------------//
      //  Procesa la respuesta del servidor y muestra un mensaje en la consola. //
      //------------------------------------------------------------------------//
      const data = await res.json();
      console.log("Login exitoso:", data);
    } catch (err) {
      //------------------------------------------------------------------------//
      //  Maneja errores y actualiza el mensaje de error en la interfaz.        //
      //------------------------------------------------------------------------//
      set_error_msg("Correo o contraseña incorrectos.");
      console.error(err);
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