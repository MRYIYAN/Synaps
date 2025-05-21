//===========================================================================   //
//                     COMPONENTE DE TARJETA DE CARACTERÍSTICA                 //
//===========================================================================   //
//  Este componente representa una tarjeta individual dentro de la sección      //
//  de características de la landing page. Muestra un icono SVG personalizado,  //
//  un título y una descripción que resalta una característica específica de    //
//  la plataforma Synaps. Se utiliza como elemento modular y reutilizable       //
//  para presentar las diferentes funcionalidades de forma visual y atractiva.  //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React from 'react';

//---------------------------------------------------------------------------//
//  Componente principal de tarjeta de característica                        //
//---------------------------------------------------------------------------//
const FeatureCard = ({ icon, title, description }) => {
  //---------------------------------------------------------------------------//
  //  Props recibidas:                                                          //
  //  - icon: Elemento React que representa el icono SVG de la característica   //
  //  - title: String con el título de la característica                        //
  //  - description: String con la descripción detallada de la característica   //
  //---------------------------------------------------------------------------//
  
  return (
    <div className="feature-card">
      {/* Contenedor del icono SVG */}
      <div className="feature-icon">
        {/* Renderiza el icono recibido como prop */}
        {icon}
      </div>
      
      {/* Título de la característica con estilo definido */}
      <h3 className="feature-card-title landing-heading-md">
        {title}
      </h3>
      
      {/* Descripción detallada de la característica */}
      <p className="feature-description landing-text-md">
        {description}
      </p>
    </div>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default FeatureCard;