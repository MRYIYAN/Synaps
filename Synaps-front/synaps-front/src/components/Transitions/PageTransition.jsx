//===========================================================================   //
//                     COMPONENTE DE TRANSICIÓN DE PÁGINA                       //
//===========================================================================   //
//  Este componente maneja las transiciones suaves al cargar o refrescar la     //
//  página. Proporciona un efecto de fade-in elegante para los contenidos,      //
//  evitando parpadeos y mejorando la experiencia visual durante la navegación. //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useState, useEffect } from 'react';
import './PageTransition.css';
//===========================================================================//

/**
 * Componente que proporciona una transición suave con efecto de desvanecimiento
 * 
 * @param {ReactNode} children - El contenido de la página
 * @param {number} delay - Retraso inicial (ms)
 * @param {object} style - Estilos adicionales
 */
const PageTransition = ({ children, delay = 0, style = {} }) => {
  //---------------------------------------------------------------------------//
  // Estados para controlar las fases de la transición                         //
  //---------------------------------------------------------------------------//
  const [isLoaded, setIsLoaded] = useState(false);       // Si el contenido está cargado
  const [isVisible, setIsVisible] = useState(false);     // Si el contenido es visible
  const [isInitialMount, setIsInitialMount] = useState(true); // Si es el montaje inicial
  const [isReadyForScroll, setIsReadyForScroll] = useState(false); // Si está listo para scroll
  
  //---------------------------------------------------------------------------//
  // Efecto para manejar la transición al montar el componente                 //
  //---------------------------------------------------------------------------//
  useEffect(() => {
    // Scroll al inicio cuando se recarga la página
    window.scrollTo(0, 0);
    
    // Variable para guardar la posición de scroll original
    const originalScrollY = window.scrollY;
    
    // Pre-cargar imágenes críticas para evitar parpadeos
    const preloadImportantImages = () => {
      // Intentar pre-cargar imágenes del navbar específicamente
      return new Promise(resolve => {
        const navbarImages = document.querySelectorAll('nav img, header img');
        
        if (navbarImages.length > 0) {
          let loadedCount = 0;
          const totalImages = navbarImages.length;
          
          navbarImages.forEach(img => {
            // Si la imagen ya está cargada
            if (img.complete) {
              loadedCount++;
              if (loadedCount === totalImages) resolve();
            } else {
              // Si la imagen aún está cargando
              img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) resolve();
              };
              
              // En caso de error, seguir adelante
              img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalImages) resolve();
              };
            }
          });
          
          // Por si acaso, resolver después de un timeout razonable
          setTimeout(resolve, 300);
        } else {
          // Si no hay imágenes en el navbar, resolver inmediatamente
          setTimeout(resolve, 100);
        }
      });
    };
    
    if (isInitialMount) {
      // Fase 1: Preparación - forzar la posición de scroll al inicio
      if (originalScrollY !== 0) {
        window.scrollTo(0, 0);
      }
      
      // Fase 2: Iniciar carga después de precargar recursos
      preloadImportantImages().then(() => {
        setIsLoaded(true);
        setIsInitialMount(false);
        
        // Fase 3: Mostrar contenido con animación
        const visibilityTimer = setTimeout(() => {
          setIsVisible(true);
          
          // Fase 4: Habilitar scroll cuando las animaciones principales ya están en curso
          // pero antes de que terminen completamente
          const scrollTimer = setTimeout(() => {
            setIsReadyForScroll(true);
          }, 800); // Tiempo reducido para permitir scroll antes que termine toda la animación
          
          return () => clearTimeout(scrollTimer);
        }, delay);
        
        return () => clearTimeout(visibilityTimer);
      });
    }
  }, [delay, isInitialMount]);
  
  //---------------------------------------------------------------------------//
  // Renderizamos contenedor con transición y contenido                        //
  //---------------------------------------------------------------------------//
  return (
    <div 
      className={`page-transition ${isLoaded ? 'loaded' : ''} ${isVisible ? 'visible' : ''} ${isReadyForScroll ? 'scroll-enabled' : ''}`}
      style={style}
    >
      <div className="page-transition-content">
        {children}
      </div>
    </div>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default PageTransition;
//===========================================================================//