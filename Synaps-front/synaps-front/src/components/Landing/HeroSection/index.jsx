//===========================================================================   //
//                     SECCIÓN HERO DE LA LANDING PAGE                        //
//===========================================================================   //
//  Este componente representa la sección principal de bienvenida (Hero) en la  //
//  landing page de Synaps. Contiene un badge destacado, título con efecto de   //
//  gradiente animado, subtítulo descriptivo y botones de llamada a la acción.  //
//  Es la primera sección que ven los usuarios al entrar en el sitio web y      //
//  busca transmitir rápidamente el valor principal de la plataforma.           //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';
//===========================================================================//

//---------------------------------------------------------------------------//
//  Componente principal de la sección Hero                                  //
//---------------------------------------------------------------------------//
const HeroSection = () => {
  return (
    <section className="hero-section landing-section">
      <div className="landing-container hero-container">
        {/********************************************************************
         *  Badge destacado con icono y texto animado                         *
         *  Utiliza un efecto de gradiente líquido animado para destacar      *
         ********************************************************************/}
        <div className="hero-badge">
          <span className="hero-badge-icon">⚡</span>
          <span className="hero-badge-text">
            Colaboración en tiempo real
          </span>
        </div>
        
        {/********************************************************************
         *  Título principal con parte destacada                              *
         *  La segunda línea tiene un efecto de gradiente tipo "lava líquida" *
         ********************************************************************/}
        <h1 className="hero-title landing-heading-xl">
          Organiza tus ideas, 
          <span className="hero-highlight">colabora en tiempo real</span>
        </h1>
        
        {/********************************************************************
         *  Subtítulo descriptivo que explica brevemente el valor principal   *
         *  de la aplicación Synaps para el usuario                           *
         ********************************************************************/}
        <p className="hero-subtitle landing-text-lg">
          Synaps es la aplicación de notas que transforma la manera en que trabajas en equipo.
        </p>
        
        {/********************************************************************
         *  Contenedor de botones de llamada a la acción (CTA)                *
         *  Incluye un botón primario para registro y uno secundario para     *
         *  la demostración del producto                                      *
         ********************************************************************/}
        <div className="hero-cta-container">
          {/* Botón principal que dirige al registro de usuario */}
          <Link to="/register" className="landing-btn landing-btn-primary hero-cta-btn">
            Comienza gratis
          </Link>
          
          {/* Botón secundario que lleva a la sección de demostración */}
          <Link to="#demo" className="landing-btn landing-btn-secondary hero-cta-btn">
            Ver demo
          </Link>
        </div>
      </div>
    </section>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default HeroSection;