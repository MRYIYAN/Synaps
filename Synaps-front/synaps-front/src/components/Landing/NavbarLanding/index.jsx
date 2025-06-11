//===========================================================================   //
//                     BARRA DE NAVEGACIÓN DE LA LANDING PAGE                 //
//===========================================================================   //
//  Este componente implementa la barra de navegación principal para la         //
//  landing page de Synaps. Incluye el logo, enlaces a las diferentes           //
//  secciones de la página, botones de autenticación y un menú móvil            //
//  responsivo. La barra cambia su apariencia al hacer scroll para mejorar      //
//  la experiencia del usuario y adaptarse a diferentes dispositivos.           //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NavbarLanding.css';
import logo from '../../../assets/icons/logo_header_sidebar.svg';
//===========================================================================//

//---------------------------------------------------------------------------//
//  Componente principal de la barra de navegación                           //
//---------------------------------------------------------------------------//
const NavbarLanding = () => {
  //---------------------------------------------------------------------------//
  //  Estado para controlar cambios visuales al hacer scroll                    //
  //  - scrolled: true cuando el usuario ha hecho scroll > 50px                 //
  //  - mobileMenuOpen: controla la visibilidad del menú en dispositivos móviles//
  //---------------------------------------------------------------------------//
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  //---------------------------------------------------------------------------//
  //  Efecto para detectar el scroll y actualizar el estado                     //
  //  Se ejecuta una sola vez al montar el componente y configura el listener   //
  //  También limpia el listener cuando el componente se desmonta               //
  //---------------------------------------------------------------------------//
  useEffect(() => {
    // Función que actualiza el estado basado en la posición de scroll
    const handleScroll = () => {
      const offset = window.scrollY;
      if(offset > 50) {
        setScrolled(true);                 // Activa el estilo de navbar con scroll
      } else {
        setScrolled(false);                // Restaura el estilo normal
      }
    };

    // Añade el event listener cuando el componente se monta
    window.addEventListener('scroll', handleScroll);
    
    // Función de limpieza que elimina el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);  // Array vacío significa que se ejecuta solo al montar/desmontar

  //---------------------------------------------------------------------------//
  //  Función para alternar el estado del menú móvil                            //
  //  Invierte el valor actual de mobileMenuOpen                                //
  //---------------------------------------------------------------------------//
  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  //---------------------------------------------------------------------------//
  //  Renderizado del componente de navegación                                  //
  //---------------------------------------------------------------------------//
  return (
    <nav className={`landing-navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="landing-navbar-container">
        {/* Logo con enlace a la página principal */}
        <Link to="/" className="landing-navbar-logo">
          <img src={logo} alt="Synaps Logo" />
        </Link>

        {/* Enlaces de navegación para pantallas de escritorio */}
        <div className="landing-navbar-links-desktop">
          <Link to="#solutions" className="landing-navbar-link">Soluciones</Link>
          <Link to="#features" className="landing-navbar-link">Características</Link>
          <Link to="#community" className="landing-navbar-link">Comunidad</Link>
          <Link to="/blog" className="landing-navbar-link">Blog</Link>
        </div>

        {/* Enlaces de autenticación: iniciar sesión y registro */}
        <div className="landing-navbar-auth">
          <Link to="/login" className="landing-navbar-link login-link">Iniciar sesión</Link>
          <Link to="/register" className="landing-btn landing-btn-primary landing-btn-sm">Registrarse</Link>
        </div>

        {/* Botón para desplegar el menú en dispositivos móviles (hamburguesa) */}
        <button 
          className="landing-navbar-toggle" 
          onClick={toggleMenu} 
          aria-label="Menú"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menú desplegable para dispositivos móviles */}
        <div className={`landing-navbar-mobile ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="landing-navbar-mobile-links">
            {/* Enlaces de navegación para móvil - cierran el menú al hacer clic */}
            <Link to="#solutions" className="landing-navbar-link" onClick={toggleMenu}>Soluciones</Link>
            <Link to="#features" className="landing-navbar-link" onClick={toggleMenu}>Características</Link>
            <Link to="#community" className="landing-navbar-link" onClick={toggleMenu}>Comunidad</Link>
            <Link to="/blog" className="landing-navbar-link" onClick={toggleMenu}>Blog</Link>
            
            {/* Enlaces de autenticación para móvil */}
            <div className="landing-navbar-mobile-auth">
              <Link to="/login" className="landing-navbar-link" onClick={toggleMenu}>Iniciar sesión</Link>
              <Link to="/register" className="landing-btn landing-btn-primary" onClick={toggleMenu}>Registrarse</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default NavbarLanding;