//===========================================================================//
//                             Navbar_landing.jsx                            //       
//===========================================================================//

//===========================================================================//
// Este componente renderiza una barra de navegación en la landing page de la
// aplicación. Incluye enlaces a diferentes secciones y botones para iniciar
// sesión y registrarse.

// Utiliza React Router para la navegación interna y está diseñado para
// adaptarse a un diseño responsivo. La barra de navegación incluye un logo,
// enlaces a las secciones de Inicio, Servicios, Nosotros y Contacto, así como
// botones para iniciar sesión y registrarse. El diseño está pensado para ser
// limpio y fácil de usar, con un enfoque en la usabilidad y la accesibilidad.
//===========================================================================//

//===========================================================================//
//                             IMPORTS
//===========================================================================//
import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para navegación interna
import '../assets/styles/style_navbar.css';

//===========================================================================//
//                          COMPONENTE Navbar_landing
//===========================================================================//
//                                                                           //
// Este componente renderiza una barra de navegación en la landing page de la
// aplicación. Incluye enlaces a diferentes secciones y botones para iniciar
// sesión y registrarse.
//                                                                           //
function Navbar_landing() {
  return (
    <nav className="navbar">
      <div className="navbar_container">
        <div className="navbar_logo">
          <h1>Synaps</h1>
        </div>

        <ul className="navbar_menu">
          <li className="navbar_item">
            <Link to="/" className="navbar_link">Inicio</Link>
          </li>
          <li className="navbar_item">
            <Link to="/servicios" className="navbar_link">Servicios</Link>
          </li>
          <li className="navbar_item">
            <Link to="/nosotros" className="navbar_link">Nosotros</Link>
          </li>
          <li className="navbar_item">
            <Link to="/contacto" className="navbar_link">Contacto</Link>
          </li>
        </ul>

        <div className="navbar_buttons">
          <Link to="/login">
            <button className="navbar_button login">Iniciar Sesión</button>
          </Link>
          <Link to="/registro">
            <button className="navbar_button register">Registrarse</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar_landing;


