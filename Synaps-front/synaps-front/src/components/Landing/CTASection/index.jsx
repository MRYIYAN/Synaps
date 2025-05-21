//===========================================================================   //
//                     SECCIÓN DE LLAMADA A LA ACCIÓN                         //
//===========================================================================   //
//  Este componente muestra la sección CTA (Call To Action) en la landing page. //
//  Presenta una invitación para unirse a la comunidad de Synaps, con botones   //
//  de acción principales y características destacadas que incluyen iconos SVG   //
//  personalizados con animaciones y efectos visuales.                          //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React from 'react';
import { Link } from 'react-router-dom';
import './CTASection.css';

// Importamos directamente desde los archivos de componentes individuales
import OrbitIcon from '../../Atomic/Icons/OrbitIcon/index';
import BrainCogIcon from '../../Atomic/Icons/BrainCogIcon/index';
import UsersIcon from '../../Atomic/Icons/UsersIcon/index';
//===========================================================================//

//---------------------------------------------------------------------------//
//  Componente de icono simple como fallback                                 //
//  Se utiliza como respaldo en caso de que alguno de los iconos             //
//  importados no esté disponible o falle durante la carga                   //
//---------------------------------------------------------------------------//
const SimpleIcon = ({ color = 'var(--primary)', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="5" fill={color} />
  </svg>
);

//---------------------------------------------------------------------------//
//  Componente principal de la sección CTA                                   //
//---------------------------------------------------------------------------//
const CTASection = () => {
  // Log para verificar la carga correcta del componente y sus dependencias
  console.log('Rendering CTASection component with direct icon imports');
  
  return (
    <section id="community" className="cta-section landing-section">
      <div className="landing-container cta-container">
        {/***********************************************************************
         *  Fondo estilizado con gradiente y efectos visuales                   *
         ***********************************************************************/}
        <div className="cta-background">
          {/********************************************************************
           *  Contenido principal centrado                                      *
           ********************************************************************/}
          <div className="cta-content">
            {/******************************************************************
             *  Título principal con efecto de gradiente                        *
             ******************************************************************/}
            <h2 className="cta-title landing-heading-lg">Unete a nuestra comunidad de creadores</h2>
            
            {/******************************************************************
             *  Descripción persuasiva que resalta el valor de la comunidad     *
             ******************************************************************/}
            <p className="cta-description landing-text-lg">
              Forma parte de una red global de profesionales que comparten conocimientos, 
              recursos y experiencias para potenciar su productividad y creatividad.
            </p>
            
            {/******************************************************************
             *  Botones de llamada a la acción principales                      *
             ******************************************************************/}
            <div className="cta-buttons">
              {/* Botón principal para registro de usuario */}
              <Link to="/register" className="landing-btn landing-btn-primary cta-btn">
                Crear una cuenta
              </Link>
              
              {/* Botón secundario para contribuir al proyecto */}
              <a 
                href="https://github.com/synaps-project" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="landing-btn landing-btn-secondary cta-btn"
              >
                Contribuir en GitHub
              </a>
            </div>
            
            {/******************************************************************
             *  Características destacadas con iconos personalizados            *
             *  Cada característica incluye un icono SVG animado y texto        *
             ******************************************************************/}
            <div className="cta-features">
              {/* Primera característica: Acceso a recursos exclusivos */}
              <div className="cta-feature">
                <span className="cta-feature-icon">
                  {/* Intentamos usar el OrbitIcon, con fallback a SimpleIcon */}
                  {OrbitIcon ? (
                    <OrbitIcon size={28} color="var(--primary, #FF4500)" strokeWidth={1.5} />
                  ) : (
                    <SimpleIcon size={28} />
                  )}
                </span> 
                <span className="cta-feature-text">Accede a recursos exclusivos</span>
              </div>
              
              {/* Segunda característica: Compartir ideas y proyectos */}
              <div className="cta-feature">
                <span className="cta-feature-icon">
                  {/* Intentamos usar el BrainCogIcon, con fallback a SimpleIcon */}
                  {BrainCogIcon ? (
                    <BrainCogIcon size={28} color="var(--primary, #FF4500)" strokeWidth={1.5} />
                  ) : (
                    <SimpleIcon size={28} />
                  )}
                </span> 
                <span className="cta-feature-text">Comparte tus ideas y proyectos</span>
              </div>
              
              {/* Tercera característica: Conexión con otros creadores */}
              <div className="cta-feature">
                <span className="cta-feature-icon">
                  {/* Intentamos usar el UsersIcon, con fallback a SimpleIcon */}
                  {UsersIcon ? (
                    <UsersIcon size={28} color="var(--primary, #FF4500)" strokeWidth={1.5} />
                  ) : (
                    <SimpleIcon size={28} />
                  )}
                </span> 
                <span className="cta-feature-text">Conecta con otros creadores</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default CTASection;