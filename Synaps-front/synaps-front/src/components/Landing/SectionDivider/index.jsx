//===========================================================================   //
//                     DIVISOR VISUAL ENTRE SECCIONES                          //
//===========================================================================   //
//  Este componente crea una separación visual sutil entre las distintas       //
//  secciones de la landing page. Ofrece una transición elegante mediante      //
//  una línea horizontal con gradiente que ayuda a estructurar el contenido    //
//  sin romper la fluidez visual del diseño ni obstaculizar las partículas     //
//  del fondo. Admite diferentes variantes para ajustar su apariencia.         //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React from 'react';
import './SectionDivider.css';  // Estilos específicos para el divisor
//===========================================================================//

//===========================================================================//
//                         COMPONENTE SECTIONDIVIDER                         //
//===========================================================================//
/**
 * Componente que genera un divisor visual entre secciones de la landing page.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.variant='default'] - Variante del divisor ('default' o 'accent')
 *   - 'default': Versión estándar, más discreta
 *   - 'accent': Versión acentuada, con mayor altura y visibilidad
 * 
 * @returns {JSX.Element} Divisor visual con la variante especificada
 */
const SectionDivider = ({ variant = 'default' }) => {
  //---------------------------------------------------------------------------//
  // Renderizamos un contenedor con la clase correspondiente a la variante     //
  // y dentro un elemento para la línea divisoria propiamente dicha            //
  //---------------------------------------------------------------------------//
  return (
    <div className={`section-divider ${variant}`}>
      {/* Línea divisoria con efecto de gradiente definido en CSS */}
      <div className="divider-line"></div>
    </div>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default SectionDivider;
//===========================================================================//