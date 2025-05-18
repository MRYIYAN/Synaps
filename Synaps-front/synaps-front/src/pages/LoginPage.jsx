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

