//===========================================================================   //
//                             PÁGINA DE LOGIN DE SYNAPS                        //
//===========================================================================   //
//  Esta página es la vista principal de inicio de sesión de la aplicación.     //
//  Muestra un formulario de login y comprueba la conexión con el servidor.     //
//  Al cargar, realiza una solicitud a la API para verificar la disponibilidad  //
//  del servidor y muestra un mensaje según la respuesta recibida.              //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       
//===========================================================================//
import React, { useEffect, useState } from 'react';
import LoginForm from '../components/LoginForm';
import '../assets/styles/global.css';
//===========================================================================//


//===========================================================================//
//                             COMPONENTE LOGINPAGE                         
//===========================================================================//
const LoginPage = () => {

  //---------------------------------------------------------------------------//
  //  Estado para manejar el mensaje de conexión con el servidor.             //
  //---------------------------------------------------------------------------//
  const [message, set_message] = useState('Cargando...');

  // Efecto para verificar la conexión con el servidor al cargar la página
  useEffect(() => {
    fetch("http://localhost:8010/api/hello", { method: "GET" })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar mensaje");
        return res.json();
      })
      .then(data => {
        set_message(data.message || "Sin mensaje");
      })
      .catch(() => {
        set_message("No se pudo conectar al servidor");
      });
  }, []);

  //---------------------------------------------------------------------------//
  //  Renderizado de la página de login con el formulario correspondiente.     //
  //---------------------------------------------------------------------------//
  return (
    <div className="bg-dark_void" style={{ 
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="pl-8 md:pl-16 w-full">
        <div className="max-w-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

