//===========================================================================   //
//                     SECCIÓN DE MUESTRA DE SOLUCIONES                       //
//===========================================================================   //
//  Este componente implementa la sección de soluciones para la landing page    //
//  de Synaps. Presenta las principales soluciones de la plataforma a través    //
//  de iconos SVG personalizados, títulos y descripciones, junto a una vista    //
//  previa de la aplicación. Los iconos incluyen animaciones y efectos visuales //
//  para mejorar la experiencia del usuario.                                    //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useState } from 'react';
import './SolutionsShowcase.css';
import AnimatedElement from '../../Animated/AnimatedElement';
import useScrollAnimation from '../../../hooks/useScrollAnimation';

//===========================================================================//

//---------------------------------------------------------------------------//
//  Componentes de iconos SVG inline                                         //
//  Definidos dentro del archivo para facilitar la personalización y uso     //
//---------------------------------------------------------------------------//

//---------------------------------------------------------------------------//
//  Icono de reloj para la solución de historial de cambios                  //
//---------------------------------------------------------------------------//
const InlineClockIcon = ({ color = 'var(--liquid_lava)', size = 36 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-clock-icon"
  >
    {/* Círculo principal del reloj */}
    <circle cx="12" cy="12" r="10" />
    {/* Manecilla de minutos */}
    <line x1="12" y1="6" x2="12" y2="12" className="minute-hand" />
    {/* Manecilla de horas */}
    <line x1="12" y1="12" x2="8" y2="14" className="hour-hand" />
  </svg>
);

//---------------------------------------------------------------------------//
//  Icono de comentario para la solución de comentarios en línea             //
//---------------------------------------------------------------------------//
const InlineCommentIcon = ({ color = 'var(--liquid_lava)', size = 36 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-comment-icon"
  >
    {/* Forma principal del globo de comentario */}
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    {/* Puntos dentro del globo - añaden detalle visual */}
    <path className="dot dot1" d="M8 10h.01" />
    <path className="dot dot2" d="M12 10h.01" />
    <path className="dot dot3" d="M16 10h.01" />
  </svg>
);

//---------------------------------------------------------------------------//
//  Icono de calendario para la solución de integración con calendarios      //
//---------------------------------------------------------------------------//
const InlineCalendarIcon = ({ color = 'var(--liquid_lava)', size = 36 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-calendar-icon"
  >
    {/* Ganchos superiores del calendario */}
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    {/* Marco principal del calendario */}
    <rect width="18" height="18" x="3" y="4" rx="2" />
    {/* Línea horizontal separadora */}
    <path d="M3 10h18" />
    {/* Primera fila de puntos para días - fila superior */}
    <circle cx="8" cy="14" r="1" fill={color} stroke="none" className="dot" />
    <circle cx="12" cy="14" r="1" fill={color} stroke="none" className="dot" />
    <circle cx="16" cy="14" r="1" fill={color} stroke="none" className="dot" />
    {/* Segunda fila de puntos para días - fila inferior */}
    <circle cx="8" cy="18" r="1" fill={color} stroke="none" className="dot" />
    <circle cx="12" cy="18" r="1" fill={color} stroke="none" className="dot" />
    <circle cx="16" cy="18" r="1" fill={color} stroke="none" className="dot" />
  </svg>
);

//---------------------------------------------------------------------------//
//  Componente de partícula pixelada para el efecto hover                    //
//---------------------------------------------------------------------------//
const PixelParticle = ({ style }) => (
  <div className="pixel-particle" style={style}></div>
);

//---------------------------------------------------------------------------//
//  Componente principal de muestra de soluciones                            //
//---------------------------------------------------------------------------//
const SolutionsShowcase = () => {
  // Para detectar cuando la lista de soluciones está visible
  const [solutionsRef, isSolutionsVisible] = useScrollAnimation({ threshold: 0.2 });
  
  // Estado para manejar qué solución tiene el cursor encima
  const [activeHoverIndex, setActiveHoverIndex] = useState(null);

  //---------------------------------------------------------------------------//
  //  Array de soluciones para mostrar                                         //
  //  Cada objeto contiene:                                                     //
  //  - id: Identificador único                                                 //
  //  - icon: Componente SVG que representa visualmente la solución             //
  //  - title: Nombre de la solución                                            //
  //  - description: Breve explicación de la funcionalidad o beneficio          //
  //---------------------------------------------------------------------------//
  const solutions = [
    {
      id: 1,
      icon: <InlineClockIcon />,
      title: "Historial de cambios",
      description: "Rastrea todas las modificaciones de tus documentos"
    },
    {
      id: 2,
      icon: <InlineCommentIcon />,
      title: "Comentarios en línea",
      description: "Añade y responde comentarios directamente en el texto"
    },
    {
      id: 3,
      icon: <InlineCalendarIcon />,
      title: "Integración con calendarios",
      description: "Sincroniza fechas importantes con tu calendario"
    }
  ];

  // Genera partículas pixeladas para el efecto hover
   const generateParticles = (count = 40) => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 6 + 3; // Aumentado de 2-6px a 3-9px
      const posX = Math.random() * 150 - 25; // Mayor rango de posición X
      const posY = Math.random() * 150 - 25; // Mayor rango de posición Y
      const delay = Math.random() * 1.5; // Aumentado de 1 a 1.5
      const duration = Math.random() * 3 + 2; // Aumentado de 1-3s a 2-5s
      const opacity = Math.random() * 0.7 + 0.3; // Aumentado rango de 0.2-0.7 a 0.3-1.0
      
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${posX}%`,
        top: `${posY}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity
      };
    });
  };
  
  // Partículas pre-generadas para evitar re-renderizado
  const [particles] = useState(() => generateParticles(50)); // Aumentado de 30 a 50

  //---------------------------------------------------------------------------//
  //  Renderizado del componente                                                //
  //---------------------------------------------------------------------------//
  return (
    <section id="solutions" className="solutions-section landing-section">
      <div className="landing-container">
        {/* Título con animación de aparición */}
        <AnimatedElement animation="fade-in-up">
          <h2 className="solutions-title dune-rise-font">DESCUBRE NUESTRAS SOLUCIONES</h2>
        </AnimatedElement>
        
        <div className="solutions-layout">
          {/* Vista previa con animación desde la izquierda */}
          <AnimatedElement animation="fade-in-left" delay={300}>
            <div className="solutions-preview">
              <div className="preview-container square-container pulse-animation">
                {/* Contenido de la vista previa */}
                <div className="preview-content">
                  {/* Texto eliminado */}
                </div>
              </div>
            </div>
          </AnimatedElement>

          {/* Lista de soluciones con animación en cascada */}
          <div 
            ref={solutionsRef} 
            className={`solutions-list stagger-container ${isSolutionsVisible ? 'visible' : ''}`}
          >
            {solutions.map((solution, index) => (
              <div 
                key={solution.id} 
                className={`solution-item stagger-item ${activeHoverIndex === index ? 'hover-active' : ''}`}
                onMouseEnter={() => setActiveHoverIndex(index)}
                onMouseLeave={() => setActiveHoverIndex(null)}
              >
                <div className="solution-icon">
                  {solution.icon}
                </div>
                <div className="solution-content">
                  <h3 className="solution-title">{solution.title}</h3>
                  <p className="solution-description">{solution.description}</p>
                </div>
                
                {/* Este div es opcional, crea un efecto de partículas pixeladas adicionales */}
                {activeHoverIndex === index && (
                  <div className="solution-aura-particles">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i}
                        className="aura-particle"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 0.5}s`,
                          animationDuration: `${1 + Math.random() * 2}s`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default SolutionsShowcase;