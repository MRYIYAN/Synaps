//===========================================================================//
//                            IMPORTS                                        //
//===========================================================================//
import React from 'react';
// Importación del formulario de registro
import RegisterForm from '../components/Register/RegisterForm';
// Rutas de los componentes de la landing
import NavbarLanding from '../components/Landing/NavbarLanding';
import Footer from '../components/Landing/Footer';
// Importar el fondo de partículas
import RegisterParticles from '../components/Register/RegisterParticles/RegisterParticles';
// Importar estilos
import '../styles/register.css';

//===========================================================================//
//                         COMPONENTE REGISTERPAGE                           //
//===========================================================================//
const RegisterPage = () => {
  return (
    <div className="register-page-container">
      {/* Fondo de partículas animadas */}
      <RegisterParticles />
      
      {/* Navbar de la landing */}
      <header className="register-navbar">
        <NavbarLanding />
      </header>
      
      {/* Contenedor principal alineado a la izquierda */}
      <main className="register-main-container">
        <div className="register-form-wrapper">
          <RegisterForm />
        </div>
      </main>
      
      {/* Espacio adicional para crear scroll */}
      <div className="register-spacer"></div>
      
      {/* Footer de la landing - visible al hacer scroll */}
      <footer className="register-footer-container">
        <Footer />
      </footer>
    </div>
  );
};

export default RegisterPage;