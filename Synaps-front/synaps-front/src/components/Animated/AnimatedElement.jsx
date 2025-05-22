//===========================================================================   //
//                     COMPONENTE DE ELEMENTOS ANIMADOS                        //
//===========================================================================   //
//  Este componente envuelve elementos para aplicarles animaciones basadas en  //
//  scroll. Utiliza el hook useScrollAnimation para detectar cuándo el elemento//
//  entra en el viewport y aplica la animación configurada de Animate.css.     //
//  Soporta múltiples tipos de animaciones y es altamente configurable.        //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation'; // Hook personalizado para detectar visibilidad
//===========================================================================//

/**
 * Componente que aplica animaciones cuando el elemento entra en el viewport
 * 
 * @param {ReactNode} children - Elementos hijos que serán animados
 * @param {string} animation - Tipo de animación a aplicar (ej: 'fade-in-up')
 * @param {number} threshold - Qué porcentaje del elemento debe ser visible para activar la animación (0-1)
 * @param {string} rootMargin - Margen alrededor del viewport para detección anticipada
 * @param {number} delay - Retraso en milisegundos antes de iniciar la animación
 * @param {number} duration - Duración de la animación en milisegundos
 * @param {string} className - Clases CSS adicionales para el elemento
 * @param {Object} style - Estilos CSS inline adicionales
 * @param {string|Component} tag - Etiqueta HTML o componente React a utilizar como contenedor
 */
const AnimatedElement = ({
  children,                         // Contenido a animar
  animation = 'fade-in-up',         // Tipo de animación predeterminada
  threshold = 0.1,                  // Por defecto, se activa cuando el 10% del elemento es visible
  rootMargin = '0px',               // Sin margen adicional por defecto
  delay = 0,                        // Sin retraso por defecto
  duration = 800,                   // Duración predeterminada de 800ms
  className = '',                   // Sin clases adicionales por defecto
  style = {},                       // Sin estilos adicionales por defecto
  tag: Tag = 'div'                  // Utiliza div como elemento contenedor por defecto
}) => {
  //---------------------------------------------------------------------------//
  // Utilizamos el hook useScrollAnimation para detectar cuando el elemento    //
  // entra en el viewport según los parámetros configurados                    //
  //---------------------------------------------------------------------------//
  const [ref, isVisible] = useScrollAnimation({ threshold, rootMargin, delay });

  //---------------------------------------------------------------------------//
  // Mapeamos los nombres de animación personalizados a las clases de          //
  // Animate.css correspondientes                                              //
  //---------------------------------------------------------------------------//
  const animationClasses = {
    'fade-in-up': 'animate__fadeInUp',         // Aparecer y desplazarse hacia arriba
    'fade-in-left': 'animate__fadeInLeft',      // Aparecer y desplazarse desde la izquierda
    'fade-in-right': 'animate__fadeInRight',    // Aparecer y desplazarse desde la derecha
    'fade-in': 'animate__fadeIn',               // Aparecer con fundido simple
    'zoom-in': 'animate__zoomIn',               // Aparecer con efecto de zoom
    'bounce-in': 'animate__bounceIn',           // Aparecer con efecto de rebote
    'flip-in-x': 'animate__flipInX',            // Aparecer con giro sobre eje X
    'flip-in-y': 'animate__flipInY',            // Aparecer con giro sobre eje Y
  };

  //---------------------------------------------------------------------------//
  // Obtenemos la clase de animación correspondiente o usamos fadeIn por defecto //
  //---------------------------------------------------------------------------//
  const animationClass = animationClasses[animation] || 'animate__fadeIn';

  //---------------------------------------------------------------------------//
  // Renderizamos el elemento con las clases y propiedades correspondientes    //
  //---------------------------------------------------------------------------//
  return (
    <Tag
      ref={ref}                     // Referencia para detectar visibilidad con IntersectionObserver
      className={`${className} ${isVisible ? 'animate__animated ' + animationClass : 'invisible'}`}
      style={{
        ...style,
        '--animate-duration': `${duration}ms`  // Variable CSS para controlar duración de la animación
      }}
    >
      {children}
    </Tag>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default AnimatedElement;
//===========================================================================//