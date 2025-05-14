//====================================================================================//
//                                COMPONENTE ARCHIVE ICON                             //
//====================================================================================//

import React, { useState } from 'react';
import './styles/ArchiveIcon.css'; //-----// Estilos específicos para el icono //-----//

//====================================================================================//
//                                FUNCION PRINCIPAL                                   //
//====================================================================================//

/**
 * Icono de archivo con animaciones al pasar el cursor.
 * @param {number} size - Tamaño del icono.
 * @param {string} color - Color del trazo.
 * @param {number} strokeWidth - Grosor del trazo.
 * @param {string} className - Clases adicionales para el contenedor.
 */
const ArchiveIcon = ({ size = 28, color = 'currentColor', strokeWidth = 2, className = '' }) => {
  //------------------------------// 
  // Estado para manejar el hover 
  // -----------------------------//
  const [isHovered, setIsHovered] = useState(false);

  //====================================================================================//
  //                                RENDERIZADO                                         //
  //====================================================================================//

  return (
    <div
      className={className}
      aria-label="archive"
      role="img"
      //--------------------------------------// 
      // Activar animación al pasar el cursor 
      //--------------------------------------//
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      style={{ display: 'inline-flex', cursor: 'pointer' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Rectángulo superior del icono */}
        <rect
          width="20"
          height="5"
          x="2"
          y="3"
          rx="1"
          className={isHovered ? 'animate-rect' : ''}
        />
        {/* Caja principal del icono */}
        <path
          d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"
          className={isHovered ? 'animate-path' : ''}
        />
        {/* Línea horizontal del icono */}
        <path
          d="M10 12h4"
          className={isHovered ? 'animate-path' : ''}
        />
      </svg>
    </div>
  );
};

//====================================================================================//
//                                EXPORTACIÓN                                         //
//====================================================================================//

export default ArchiveIcon;
