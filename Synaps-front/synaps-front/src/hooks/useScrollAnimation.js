//===========================================================================   //
//                   HOOK PARA ANIMACIONES BASADAS EN SCROLL                   //
//===========================================================================   //
//  Este hook personalizado utiliza la API Intersection Observer para detectar  //
//  cuándo elementos entran en el viewport durante el scroll. Permite aplicar   //
//  animaciones de forma eficiente solo cuando los elementos son visibles,      //
//  mejorando el rendimiento y creando una experiencia visual más atractiva.    //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import { useEffect, useRef, useState } from 'react';
//===========================================================================//

/**
 * Hook personalizado para detectar cuándo un elemento entra en el viewport y aplicar animaciones
 * @param {Object} options - Opciones de configuración
 * @param {number} options.threshold - Porcentaje del elemento que debe ser visible (0-1)
 * @param {string} options.rootMargin - Margen alrededor del viewport
 * @param {number} options.delay - Retraso en milisegundos para la animación
 * @returns {Array} - Referencia al elemento y estado de visibilidad
 */
const useScrollAnimation = ({
  threshold = 0.1,       // Por defecto, se activa cuando 10% del elemento es visible
  rootMargin = '0px',    // Sin margen adicional por defecto
  delay = 0              // Sin retraso por defecto
} = {}) => {
  //---------------------------------------------------------------------------//
  //  Creamos una referencia al elemento del DOM que queremos observar         //
  //---------------------------------------------------------------------------//
  const ref = useRef(null);
  
  //---------------------------------------------------------------------------//
  //  Estado que indica si el elemento se encuentra visible en el viewport     //
  //---------------------------------------------------------------------------//
  const [isVisible, setIsVisible] = useState(false);

  //---------------------------------------------------------------------------//
  //  Efecto que configura y gestiona el Intersection Observer                 //
  //---------------------------------------------------------------------------//
  useEffect(() => {
    // Creamos una instancia del Intersection Observer
    const observer = new IntersectionObserver(
      // Callback que se ejecuta cuando cambia la visibilidad del elemento
      ([entry]) => {
        // Cuando el elemento intersecta con el viewport según el umbral definido
        if (entry.isIntersecting) {
          // Si hay retraso configurado, aplicamos un timeout antes de actualizar el estado
          if (delay) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            // Sin retraso, actualizamos el estado inmediatamente
            setIsVisible(true);
          }
          // Dejamos de observar el elemento una vez que se ha activado la animación
          // para evitar activaciones repetidas y mejorar el rendimiento
          observer.unobserve(entry.target);
        }
      },
      // Opciones de configuración del observer
      {
        threshold,        // Umbral de visibilidad (proporción)
        rootMargin        // Margen alrededor del viewport
      }
    );

    // Guardamos referencia al elemento actual para limpieza
    const currentRef = ref.current;
    
    // Si existe un elemento en la referencia, comenzamos a observarlo
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Función de limpieza que se ejecuta al desmontar el componente
    return () => {
      // Dejamos de observar el elemento para evitar memory leaks
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, delay]); // Dependencias del efecto

  //---------------------------------------------------------------------------//
  //  Devolvemos la referencia y el estado de visibilidad como un array        //
  //  para que el componente que use este hook pueda aplicar la referencia     //
  //  al elemento que desea animar y condicionar la animación según el estado  //
  //---------------------------------------------------------------------------//
  return [ref, isVisible];
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default useScrollAnimation;
//===========================================================================//