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
import AnimatedElement from '../../Animated/AnimatedElement';
import { ReactComponent as SynapsLogo } from '../../../assets/icons/logo_header_sidebar.svg';

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="footer-grid">
          {/* Columna principal con logo y descripción */}
          <AnimatedElement animation="fade-in-left" className="footer-brand">
            <Link to="/" className="footer-logo">
              <SynapsLogo className="footer-logo-svg" aria-label="Logo de Synaps" />
            </Link>
            <p className="footer-description">
              Una plataforma colaborativa para organizar tus ideas y proyectos
            </p>
            {/* Iconos de redes sociales */}
            <div className="footer-social">
              <a href="https://twitter.com/synaps" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="https://github.com/synaps-project" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
              <a href="https://discord.gg/synaps" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.608 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1634-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path>
                </svg>
              </a>
            </div>
          </AnimatedElement>

          {/* Columna Synaps */}
          <AnimatedElement animation="fade-in-up" delay={200} className="footer-column">
            <h3 className="footer-heading">Synaps</h3>
            <ul className="footer-link-list">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/about">Sobre nosotros</Link></li>
              <li><Link to="/pricing">Precios</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </AnimatedElement>

          {/* Columna Características */}
          <AnimatedElement animation="fade-in-up" delay={400} className="footer-column">
            <h3 className="footer-heading">Características</h3>
            <ul className="footer-link-list">
              <li><Link to="#features">Características</Link></li>
              <li><Link to="#solutions">Soluciones</Link></li>
              <li><Link to="#testimonials">Testimonios</Link></li>
              <li><Link to="#community">Comunidad</Link></li>
            </ul>
          </AnimatedElement>

          {/* Columna Recursos */}
          <AnimatedElement animation="fade-in-up" delay={600} className="footer-column">
            <h3 className="footer-heading">Recursos</h3>
            <ul className="footer-link-list">
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/documentation">Documentación</Link></li>
              <li><Link to="/tutorials">Tutoriales</Link></li>
              <li><a href="https://github.com/synaps-project" target="_blank" rel="noopener noreferrer">Open Source</a></li>
            </ul>
          </AnimatedElement>
        </div>
        
        {/* Copyright con animación desde abajo */}
        <AnimatedElement animation="fade-in-up" delay={800}>
          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} Synaps. Todos los derechos reservados.
            </p>
          </div>
        </AnimatedElement>
      </div>
    </footer>
  );
};

export default Footer;