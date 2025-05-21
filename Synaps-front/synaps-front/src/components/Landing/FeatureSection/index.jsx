//===========================================================================   //
//                     SECCIÓN DE CARACTERÍSTICAS PRINCIPALES                  //
//===========================================================================   //
//  Este componente muestra la sección de características destacadas en la      //
//  landing page de Synaps. Presenta las funcionalidades más importantes de     //
//  la plataforma mediante tarjetas visuales que incluyen iconos SVG, títulos   //
//  y descripciones. El diseño está optimizado para mostrar clara y             //
//  atractivamente los beneficios clave de la aplicación.                       //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React from 'react';
import { SearchIcon, CollaborateIcon, BlocksIcon } from '../../Atomic/Icons';
import './FeatureSection.css';
//===========================================================================//

//---------------------------------------------------------------------------//
//  Componente principal de la sección de características                    //
//---------------------------------------------------------------------------//
const FeatureSection = () => {
  //---------------------------------------------------------------------------//
  //  Array de datos de características                                         //
  //  Cada objeto contiene:                                                     //
  //  - id: Identificador único para la característica                          //
  //  - icon: Componente SVG que representa visualmente la funcionalidad        //
  //  - title: Título descriptivo de la característica                          //
  //  - description: Explicación detallada del beneficio o funcionalidad        //
  //---------------------------------------------------------------------------//
  const features = [
    {
      id: 1,
      // Aumentamos el tamaño del icono de búsqueda para que visualmente parezca del mismo tamaño que los otros
      icon: <SearchIcon size={42} color="var(--liquid_lava)" />,
      title: "Búsqueda Inteligente",
      description: "Encuentra rápidamente cualquier información guardada con nuestra potente herramienta de búsqueda semántica."
    },
    {
      id: 2,
      icon: <CollaborateIcon size={36} color="var(--liquid_lava)" />,
      title: "Colaboración en Tiempo Real",
      description: "Trabaja simultáneamente con tu equipo, comparte ideas y realiza cambios en tiempo real."
    },
    {
      id: 3,
      icon: <BlocksIcon size={36} color="var(--liquid_lava)" />,
      title: "Accesibilidad Multiplataforma",
      description: "Accede a tus proyectos desde cualquier dispositivo, sincronización automática y experiencia consistente."
    },
  ];

  //---------------------------------------------------------------------------//
  //  Renderizado de la sección de características                              //
  //---------------------------------------------------------------------------//
  return (
    <section id="features" className="feature-section landing-section">
      <div className="landing-container">
        {/* Título principal de la sección */}
        <h2 className="feature-title landing-heading-lg">Características principales</h2>
        
        {/* Subtítulo explicativo */}
        <p className="feature-subtitle landing-text-lg">
          Herramientas diseñadas para potenciar tu productividad y creatividad
        </p>

        {/* Cuadrícula de tarjetas de características */}
        <div className="feature-grid">
          {/* Generamos dinámicamente cada tarjeta de característica a partir del array */}
          {features.map(feature => (
            <div key={feature.id} className="feature-card">
              {/* Contenedor del icono con fondo y estilizado */}
              <div className="feature-icon">{feature.icon}</div>
              
              {/* Título de la característica */}
              <h3 className="feature-name landing-heading-md">{feature.title}</h3>
              
              {/* Descripción detallada */}
              <p className="feature-description landing-text-md">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default FeatureSection;