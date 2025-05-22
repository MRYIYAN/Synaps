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
import AnimatedElement from '../../Animated/AnimatedElement';
import OrbitIcon from '../../Atomic/Icons/OrbitIcon/index';
import BrainCogIcon from '../../Atomic/Icons/BrainCogIcon/index';
import UsersIcon from '../../Atomic/Icons/UsersIcon/index';
//===========================================================================//

//---------------------------------------------------------------------------//
//  Componente de icono simple como fallback                                 //
//  Se utiliza como respaldo en caso de que alguno de los iconos             //
//  importados no esté disponible o falle durante la carga                   //
//---------------------------------------------------------------------------//
const SimpleIcon = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

//---------------------------------------------------------------------------//
//  Componente principal de la sección CTA                                   //
//---------------------------------------------------------------------------//
const CTASection = () => {
  // Log para verificar la carga correcta del componente y sus dependencias
  console.log('Rendering CTASection component with direct icon imports');
  
  return (
    <section className="cta-section landing-section">
      <div className="landing-container">
        {/***********************************************************************
         *  Fondo estilizado con gradiente y efectos visuales                   *
         ***********************************************************************/}
        <AnimatedElement animation="zoom-in" className="cta-background">
          {/********************************************************************
           *  Contenido principal centrado                                      *
           ********************************************************************/}
          <div className="cta-content">
            {/******************************************************************
             *  Título principal con efecto de gradiente                        *
             ******************************************************************/}
            <AnimatedElement animation="fade-in-up">
              <h2 className="cta-title landing-heading-lg" style={{ width: "100%", maxWidth: "100%" }}>
                Unete a la comunidad
              </h2>
            </AnimatedElement>
            
            {/******************************************************************
             *  Descripción persuasiva que resalta el valor de la comunidad     *
             ******************************************************************/}
            <AnimatedElement animation="fade-in-up" delay={200}>
              <p className="cta-description landing-text-lg">
                Forma parte de una red global de creadores, desarrolladores y pensadores
              </p>
            </AnimatedElement>
            
            {/******************************************************************
             *  Botones de llamada a la acción principales                      *
             ******************************************************************/}
            <AnimatedElement animation="fade-in-up" delay={400}>
              <div className="cta-buttons">
                {/* Botón principal para registro de usuario */}
                <Link to="/register" className="landing-btn landing-btn-primary cta-btn shine-effect">
                  Crear una cuenta
                </Link>
                
                {/* Botón secundario para contribuir al proyecto */}
                <a 
                  href="https://github.com/synaps-project" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="landing-btn landing-btn-secondary cta-btn shine-effect"
                >
                  Contribuir en GitHub
                </a>
              </div>
            </AnimatedElement>
            
            {/******************************************************************
             *  Características destacadas con iconos personalizados            *
             *  Cada característica incluye un icono SVG animado y texto        *
             ******************************************************************/}
            <AnimatedElement animation="fade-in-up" delay={600}>
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
            </AnimatedElement>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default CTASection;