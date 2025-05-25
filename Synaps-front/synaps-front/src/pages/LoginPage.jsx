//===========================================================================//
//                    PÁGINA PRINCIPAL DE INICIO DE SESIÓN                   //
//===========================================================================//
//  Este componente orquesta la página completa de login, integrando el      //
//  fondo animado de partículas, el formulario de autenticación, la          //
//  navegación superior y el footer. Proporciona una experiencia visual      //
//  cohesiva y profesional para el acceso a la plataforma Synaps.            //
//===========================================================================//

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React from 'react';
// Importación del formulario principal de autenticación
import LoginForm from '../components/Login/LoginForm';
// Importación del sistema de partículas para fondo interactivo
import LoginParticles from '../components/Login/LoginParticles/LoginParticles';
// Importación de componentes de navegación y estructura de la landing
import NavbarLanding from '../components/Landing/NavbarLanding';
import Footer from '../components/Landing/Footer';
// Importación de estilos específicos para la página de login
import '../styles/login.css';
//===========================================================================//

//===========================================================================//
//                         COMPONENTE LOGINPAGE                              //
//===========================================================================//
/**
 * Componente principal que estructura la página completa de inicio de sesión
 * Integra todos los elementos visuales y funcionales necesarios para la autenticación
 * @returns {JSX.Element} Página completa de login con fondo animado y formulario
 */
const LoginPage = () => {
  //---------------------------------------------------------------------------//
  //  Estructura principal de la página con capas ordenadas                    //
  //---------------------------------------------------------------------------//
  return (
    <div className="login-page-container">
      {/*---------------------------------------------------------------------*/}
      /*  Capa de fondo - Sistema de partículas interactivas                */
      /*---------------------------------------------------------------------*/
      {/* Componente de partículas como fondo animado de toda la página */}
      <LoginParticles />
      
      {/*---------------------------------------------------------------------*/}
      /*  Capa de navegación - Header superior con enlaces de la landing    */
      /*---------------------------------------------------------------------*/
      {/* Barra de navegación superior heredada de la landing page */}
      <header className="login-navbar">
        <NavbarLanding />
      </header>
      
      {/*---------------------------------------------------------------------*/}
      /*  Capa principal - Contenedor centrado del formulario de login      */
      /*---------------------------------------------------------------------*/
      {/* Contenedor principal que centra el formulario sobre las partículas */}
      <main className="login-main-container">
        <div className="login-form-wrapper">
          {/* Formulario de autenticación con validaciones en tiempo real */}
          <LoginForm />
        </div>
      </main>
      
      {/*---------------------------------------------------------------------*/}
      /*  Espaciador - Área para permitir scroll y mostrar el footer        */
      /*---------------------------------------------------------------------*/
      {/* Espacio adicional que permite hacer scroll para revelar el footer */}
      <div className="login-spacer"></div>
      
      {/*---------------------------------------------------------------------*/}
      /*  Capa de pie - Footer con información adicional                    */
      /*---------------------------------------------------------------------*/
      {/* Footer de la landing - visible al hacer scroll hacia abajo */}
      <footer className="login-footer">
        <Footer />
      </footer>
    </div>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default LoginPage;
//===========================================================================//

//===========================================================================//
//                        ARQUITECTURA DE LA PÁGINA                          //
//===========================================================================//
/*  1. LoginParticles - Fondo animado (z-index: 0)                          */
/*  2. NavbarLanding - Navegación superior (z-index: superior)               */
/*  3. LoginForm - Formulario principal (z-index: máximo)                    */
/*  4. Footer - Información adicional (z-index: estándar)                    */
//===========================================================================//
