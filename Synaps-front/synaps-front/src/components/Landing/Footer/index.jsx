//===========================================================================   //
//                     COMPONENTE DE PIE DE PÁGINA (FOOTER)                    //
//===========================================================================   //
//  Este componente representa el pie de página de la landing page de Synaps.   //
//  Contiene el logo, una breve descripción de la plataforma, iconos de redes   //
//  sociales con efectos de gradiente animado, y enlaces organizados en         //
//  categorías: enlaces rápidos, recursos y legal. También incluye una sección  //
//  de copyright con el año actualizado automáticamente.                        //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

// Importación de imágenes e iconos
import logo from '../../../assets/icons/logo_header_sidebar.svg';
import discordIcon from '../../../assets/icons/discord.svg';
import linkedinIcon from '../../../assets/icons/linkedin.svg';
import githubIcon from '../../../assets/icons/github.svg';
//===========================================================================//

//---------------------------------------------------------------------------//
//  Componente principal del pie de página                                   //
//---------------------------------------------------------------------------//
const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-container footer-container">
        {/* Sistema de grid para organizar el contenido en columnas */}
        <div className="footer-grid">
          {/********************************************************************
           *  Primera columna: Branding, descripción y redes sociales           *
           ********************************************************************/}
          <div className="footer-brand">
            {/* Logo con enlace a la página principal */}
            <Link to="/" className="footer-logo">
              <img src={logo} alt="Synaps Logo" />
              <span></span>
            </Link>
            
            {/* Descripción breve de la plataforma */}
            <p className="footer-description">
              Transformando la manera en que organizamos las ideas y colaboramos en equipo.
            </p>
            
            {/* Iconos de redes sociales con efecto de gradiente líquido */}
            <div className="footer-social">
              {/* Enlace a Discord con icono SVG */}
              <a href="https://discord.com" aria-label="Discord" className="social-icon">
                <img src={discordIcon} alt="Discord" className="social-svg" />
              </a>
              
              {/* Enlace a LinkedIn con icono SVG */}
              <a href="https://linkedin.com" aria-label="LinkedIn" className="social-icon">
                <img src={linkedinIcon} alt="LinkedIn" className="social-svg" />
              </a>
              
              {/* Enlace a GitHub con icono SVG */}
              <a href="https://github.com" aria-label="GitHub" className="social-icon">
                <img src={githubIcon} alt="GitHub" className="social-svg" />
              </a>
            </div>
          </div>

          {/********************************************************************
           *  Segunda columna: Enlaces rápidos a secciones de la landing page   *
           ********************************************************************/}
          <div className="footer-links">
            <h3 className="footer-heading">Enlaces rápidos</h3>
            <ul className="footer-link-list">
              <li><Link to="#features">Características</Link></li>
              <li><Link to="#solutions">Soluciones</Link></li>
              <li><Link to="#testimonials">Testimonios</Link></li>
              <li><Link to="#community">Comunidad</Link></li>
            </ul>
          </div>

          {/********************************************************************
           *  Tercera columna: Recursos adicionales y documentación             *
           ********************************************************************/}
          <div className="footer-links">
            <h3 className="footer-heading">Recursos</h3>
            <ul className="footer-link-list">
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/documentation">Documentación</Link></li>
              <li><Link to="/tutorials">Tutoriales</Link></li>
              <li><a href="https://github.com/synaps-project">Open Source</a></li>
            </ul>
          </div>

          {/********************************************************************
           *  Cuarta columna: Información legal y políticas                     *
           ********************************************************************/}
          <div className="footer-links">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-link-list">
              <li><Link to="/privacy">Política de privacidad</Link></li>
              <li><Link to="/terms">Términos de servicio</Link></li>
              <li><Link to="/cookies">Política de cookies</Link></li>
            </ul>
          </div>
        </div>

        {/********************************************************************
         *  Sección de copyright con año actualizado automáticamente          *
         ********************************************************************/}
        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Synaps. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default Footer;