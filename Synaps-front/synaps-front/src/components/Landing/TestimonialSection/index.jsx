//===========================================================================   //
//                     SECCIÓN DE TESTIMONIOS DE USUARIOS                     //
//===========================================================================   //
//  Este componente implementa un carrusel de testimonios para la landing page   //
//  de Synaps. Presenta opiniones de usuarios con sus avatares, nombres, roles   //
//  y comentarios en tarjetas con efectos visuales. Incluye navegación manual    //
//  e incorpora rotación automática para mostrar todos los testimonios. Los      //
//  elementos visuales utilizan gradientes animados para mantener coherencia     //
//  estética con el resto de la landing page.                                    //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './TestimonialSection.css';
import UsersRoundIcon from '../../Icons/UsersRoundIcon';
//===========================================================================//

//---------------------------------------------------------------------------//
//  Componente principal de la sección de testimonios                        //
//---------------------------------------------------------------------------//
const TestimonialSection = () => {
  //---------------------------------------------------------------------------//
  //  Array de testimonios                                                      //
  //  Cada objeto contiene:                                                     //
  //  - id: Identificador único para el testimonio                              //
  //  - text: Texto del comentario del usuario                                  //
  //  - author: Nombre del usuario que brinda el testimonio                     //
  //  - role: Cargo o rol del usuario para dar contexto                         //
  //  - avatar: Ruta a la imagen de avatar (actualmente no utilizada)           //
  //---------------------------------------------------------------------------//
  const testimonials = [
    {
      id: 1,
      text: "Synaps transformó mi forma de estudiar. Los mapas mentales me ayudan a conectar conceptos que antes no relacionaba.",
      author: "Elena Rodríguez",
      role: "Estudiante de Medicina",
      avatar: "/avatars/user1.jpg"
    },
    {
      id: 2,
      text: "Como investigador, necesito organizar grandes cantidades de información. Synaps me permite visualizar conexiones y patrones que de otro modo no vería.",
      author: "Carlos Martínez",
      role: "Investigador en IA",
      avatar: "/avatars/user2.jpg"
    },
    {
      id: 3,
      text: "Tomar notas con Synaps es intuitivo y eficiente. La función de conexión automática de conceptos me ahorra horas de trabajo.",
      author: "Laura Sánchez",
      role: "Profesora Universitaria",
      avatar: "/avatars/user3.jpg"
    },
    {
      id: 4,
      text: "Synaps ha revolucionado la forma en que organizo mis proyectos. La interfaz fluida hace que sea fácil estructurar ideas complejas.",
      author: "Miguel Torres",
      role: "Arquitecto de Software",
      avatar: "/avatars/user4.jpg"
    },
    {
      id: 5,
      text: "Como emprendedor, necesito conectar diferentes aspectos de mi negocio. Synaps me ayuda a visualizar todo el panorama y detectar oportunidades.",
      author: "Ana Gómez",
      role: "CEO de Startup",
      avatar: "/avatars/user5.jpg"
    }
  ];

  //---------------------------------------------------------------------------//
  //  Estados para controlar el carrusel                                        //
  //  - activeIndex: Índice del testimonio actualmente visible                  //
  //  - animating: Bandera para prevenir múltiples transiciones simultáneas     //
  //  - autoPlayRef: Referencia para el temporizador de reproducción automática //
  //---------------------------------------------------------------------------//
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const autoPlayRef = useRef();
  
  //---------------------------------------------------------------------------//
  //  Función para avanzar al siguiente testimonio                              //
  //  Utiliza useCallback para mantener la referencia estable entre renderizados//
  //  Previene transiciones durante animaciones en curso                        //
  //---------------------------------------------------------------------------//
  const nextSlide = useCallback(() => {
    if (animating) return;                 // Si está animando, no hace nada
    setAnimating(true);                    // Marca como animando para prevenir otras transiciones
    const nextIndex = activeIndex === testimonials.length - 1 ? 0 : activeIndex + 1; // Calcula el siguiente índice con vuelta circular
    setActiveIndex(nextIndex);             // Actualiza el índice activo
    setTimeout(() => setAnimating(false), 4000); // Desactiva la bandera tras completar la animación
  }, [activeIndex, animating, testimonials.length]);
  
  //---------------------------------------------------------------------------//
  //  Función para retroceder al testimonio anterior                            //
  //  Similar a nextSlide pero en dirección inversa                             //
  //---------------------------------------------------------------------------//
  const prevSlide = useCallback(() => {
    if (animating) return;                 // Si está animando, no hace nada
    setAnimating(true);                    // Marca como animando para prevenir otras transiciones
    const nextIndex = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1; // Calcula el índice anterior con vuelta circular
    setActiveIndex(nextIndex);             // Actualiza el índice activo
    setTimeout(() => setAnimating(false), 4000); // Desactiva la bandera tras completar la animación
  }, [activeIndex, animating, testimonials.length]);
  
  //---------------------------------------------------------------------------//
  //  Función para saltar a un testimonio específico                            //
  //  Usada por los indicadores circulares (bullets)                            //
  //---------------------------------------------------------------------------//
  const goToSlide = (index) => {
    if (animating || index === activeIndex) return; // No hace nada si está animando o ya es el índice activo
    setAnimating(true);                    // Marca como animando
    setActiveIndex(index);                 // Salta al índice indicado
    setTimeout(() => setAnimating(false), 4000); // Desactiva la bandera tras la animación
  };

  //---------------------------------------------------------------------------//
  //  Efecto para manejar la reproducción automática del carrusel               //
  //  Configura un temporizador que avanza al siguiente testimonio              //
  //  Limpia el temporizador al desmontar el componente                         //
  //---------------------------------------------------------------------------//
  useEffect(() => {
    const play = () => {
      autoPlayRef.current = setTimeout(() => {
        nextSlide();
      }, 4000);                            // Avanza cada 4 segundos
    };
    
    play();                                // Inicia la reproducción automática
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current); // Limpia el temporizador al desmontar
      }
    };
  }, [nextSlide]);                         // Se ejecuta cuando nextSlide cambia

  //---------------------------------------------------------------------------//
  //  Renderizado del componente                                                //
  //---------------------------------------------------------------------------//
  return (
    <section id="testimonial" className="testimonial-section landing-section">
      <div className="landing-container">
        {/* Título principal con fuente especial */}
        <h2 className="testimonial-title dune-rise-font">LO QUE DICEN NUESTROS USUARIOS</h2>
        
        {/* Contenedor del carrusel con controles de navegación */}
        <div className="testimonial-carousel">
          {/* Botón para el testimonio anterior */}
          <button 
            className="carousel-control carousel-prev" 
            onClick={prevSlide}
            disabled={animating}
            aria-label="Testimonio anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          {/* Contenedor de las tarjetas de testimonios */}
          <div className="testimonial-wrapper">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`testimonial-card ${index === activeIndex ? 'active' : ''} ${
                  index === (activeIndex - 1 + testimonials.length) % testimonials.length ? 'prev' : ''
                } ${
                  index === (activeIndex + 1) % testimonials.length ? 'next' : ''
                }`}
              >
                <div className="testimonial-content">
                  {/* Avatar centrado con nombre debajo */}
                  <div className="testimonial-author-centered">
                    <div className="author-avatar-centered">
                      <UsersRoundIcon 
                        color="url(#testimonial-gradient)" 
                        size={50} 
                        strokeWidth={2} 
                        className="user-avatar-icon" 
                      />
                    </div>
                    <div className="author-info-centered">
                      <div className="author-name">{testimonial.author}</div>
                      <div className="author-role">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  {/* Cuerpo del testimonio con texto y comillas */}
                  <div className="testimonial-body">
                    <p className="testimonial-text">{testimonial.text}</p>
                    
                    {/* Comillas decorativas en la esquina inferior derecha */}
                    <div className="testimonial-quote-mark-right">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 20H7.5C6.83696 20 6.20107 19.7366 5.73223 19.2678C5.26339 18.7989 5 18.163 5 17.5V12.5C5 11.837 5.26339 11.2011 5.73223 10.7322C6.20107 10.2634 6.83696 10 7.5 10H12.5C13.163 10 13.7989 10.2634 14.2678 10.7322C14.7366 11.2011 15 11.837 15 12.5V25C15 28.3152 13.683 31.4946 11.3388 33.8388C8.99456 36.183 5.81522 37.5 2.5 37.5" stroke="url(#testimonial-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M32.5 20H27.5C26.837 20 26.2011 19.7366 25.7322 19.2678C25.2634 18.7989 25 18.163 25 17.5V12.5C25 11.837 25.2634 11.2011 25.7322 10.7322C26.2011 10.2634 26.837 10 27.5 10H32.5C33.163 10 33.7989 10.2634 34.2678 10.7322C34.7366 11.2011 35 11.837 35 12.5V25C35 28.3152 33.683 31.4946 31.3388 33.8388C28.9946 36.183 25.8152 37.5 22.5 37.5" stroke="url(#testimonial-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Efecto de resplandor para la tarjeta activa */}
                <div className="testimonial-glow"></div>
              </div>
            ))}
            
            {/* Definición del gradiente animado para elementos visuales */}
            <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
              <defs>
                <linearGradient id="testimonial-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff4d00">
                    <animate 
                      attributeName="stop-color" 
                      values="#ff4d00;#ff8700;#ff4d00" 
                      dur="3s" 
                      repeatCount="indefinite" 
                    />
                  </stop>
                  <stop offset="50%" stopColor="#ff8700">
                    <animate 
                      attributeName="stop-color" 
                      values="#ff8700;#ff4d00;#ff8700" 
                      dur="3s" 
                      repeatCount="indefinite" 
                    />
                  </stop>
                  <stop offset="100%" stopColor="#ff4d00">
                    <animate 
                      attributeName="stop-color" 
                      values="#ff4d00;#ff8700;#ff4d00" 
                      dur="3s" 
                      repeatCount="indefinite" 
                    />
                  </stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Botón para el testimonio siguiente */}
          <button 
            className="carousel-control carousel-next" 
            onClick={nextSlide}
            disabled={animating}
            aria-label="Testimonio siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        
        {/* Indicadores circulares de navegación (bullets) */}
        <div className="carousel-bullets">
          {testimonials.map((_, index) => (
            <button 
              key={index} 
              className={`carousel-bullet ${index === activeIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al testimonio ${index + 1}`}
            >
              <span className="bullet-indicator"></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default TestimonialSection;