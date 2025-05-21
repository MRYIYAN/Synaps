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
import React from 'react';
import './SolutionsShowcase.css';
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
//  Componente principal de muestra de soluciones                            //
//---------------------------------------------------------------------------//
const SolutionsShowcase = () => {
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

  //---------------------------------------------------------------------------//
  //  Renderizado del componente                                                //
  //---------------------------------------------------------------------------//
  return (
    <section id="solutions" className="solutions-section landing-section">
      <div className="landing-container">
        {/* Título principal de la sección con clase especial para fuente personalizada */}
        <h2 className="solutions-title dune-rise-font">DESCUBRE NUESTRAS SOLUCIONES</h2>
        
        {/* Layout principal con dos columnas: vista previa y lista de soluciones */}
        <div className="solutions-layout">
          {/* Columna izquierda: Vista previa de la aplicación */}
          <div className="solutions-preview">
            <div className="preview-container">
              <p className="preview-text">Vista previa de la aplicación</p>
              {/* Aquí se podría colocar una imagen o componente interactivo de la app */}
            </div>
          </div>
          
          {/* Columna derecha: Lista de soluciones con iconos */}
          <div className="solutions-list">
            {/* Generamos dinámicamente cada elemento de solución desde el array */}
            {solutions.map(solution => (
              <div key={solution.id} className="solution-item">
                {/* Contenedor del icono con estilizado específico */}
                <div className="solution-icon">
                  {solution.icon}
                </div>
                {/* Contenido textual: título y descripción */}
                <div className="solution-content">
                  <h3 className="solution-title">{solution.title}</h3>
                  <p className="solution-description">{solution.description}</p>
                </div>
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