//===========================================================================//
//                COMPONENTE DE PARTÍCULAS PARA LA PÁGINA DE LOGIN           //
//===========================================================================//
//  Este componente genera un canvas interactivo con partículas animadas que  //
//  reaccionan al movimiento del mouse. Las partículas forman una red         //
//  dinámica que simula una red neuronal, creando un fondo visual atractivo  //
//  para la página de login de la plataforma Synaps.                         //
//===========================================================================//

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useRef, useEffect } from 'react';
import './LoginParticles.css';
//===========================================================================//

/**
 * Componente que crea un fondo animado de partículas interactivas para la página de login
 * Las partículas reaccionan al movimiento del ratón y forman conexiones entre ellas
 * @returns {JSX.Element} Componente de canvas con animación de partículas
 */
const LoginParticles = () => {
  //---------------------------------------------------------------------------//
  //  Referencia al elemento canvas para manipulación directa                  //
  //---------------------------------------------------------------------------//
  const canvasRef = useRef(null);

  //---------------------------------------------------------------------------//
  //  Efecto para inicializar y gestionar la animación de partículas           //
  //---------------------------------------------------------------------------//
  useEffect(() => {
    // Obtenemos el elemento canvas y su contexto de renderizado 2D
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    //---------------------------------------------------------------------------//
    //  Variables para el seguimiento y la interacción con el ratón              //
    //---------------------------------------------------------------------------//
    let mouseX = -1000;
    let mouseY = -1000;
    const mouseRadius = 100; // Radio de influencia del ratón sobre las partículas
    
    //---------------------------------------------------------------------------//
    //  Función para ajustar el tamaño del canvas al de la ventana               //
    //---------------------------------------------------------------------------//
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Inicializamos el tamaño del canvas
    setCanvasSize();
    // Actualizamos el tamaño cuando cambian las dimensiones de la ventana
    window.addEventListener('resize', setCanvasSize);
    
    //---------------------------------------------------------------------------//
    //  Función para capturar la posición actual del ratón                       //
    //---------------------------------------------------------------------------//
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    // Registramos el evento para detectar el movimiento del ratón
    window.addEventListener('mousemove', handleMouseMove);

    //---------------------------------------------------------------------------//
    //  Creamos el array que almacenará todas las partículas                     //
    //---------------------------------------------------------------------------//
    let particles = [];
    
    //---------------------------------------------------------------------------//
    //  Clase que define el comportamiento de cada partícula                     //
    //---------------------------------------------------------------------------//
    class Particle {
      /**
       * Constructor de partícula con propiedades iniciales optimizadas para login
       */
      constructor() {
        // Posicionamiento - distribución uniforme pero con mayor densidad en los bordes
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        
        // Velocidad base - movimiento fluido y suave
        this.vx = (Math.random() * 0.4 - 0.2);
        this.vy = (Math.random() * 0.4 - 0.2);
        
        // Velocidad máxima cuando huye del cursor
        this.maxSpeed = 2.5;
        
        // Velocidad normal para movimiento regular
        this.baseSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        // Tamaño - pequeños nodos como en el diseño específico
        this.size = 1.5 + Math.random() * 1.5;
        
        // Color - naranja brillante exactamente como en la imagen de referencia
        this.opacity = 0.8 + Math.random() * 0.2;
        this.color = `rgba(255, 120, 0, ${this.opacity})`;
        
        // Sin animación de pulso para mantener consistencia visual
        this.staticSize = this.size;
      }
      
      /**
       * Actualiza la posición y velocidad de la partícula en cada frame
       * Implementa la física de movimiento y la interacción con el ratón
       */
      update() {
        // Cálculo de la distancia entre la partícula y el cursor
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si la partícula está dentro del radio de influencia del cursor
        if(distance < mouseRadius) {
          // Factor de repulsión: partículas más cercanas huyen más rápido
          const repulsionFactor = 1 - distance / mouseRadius;
          
          // Calcular dirección opuesta al ratón para efecto de repulsión
          const angle = Math.atan2(dy, dx);
          
          // Aplicar fuerza de repulsión en dirección contraria al cursor
          this.vx -= Math.cos(angle) * repulsionFactor * 0.3;
          this.vy -= Math.sin(angle) * repulsionFactor * 0.3;
          
          // Limitar velocidad máxima durante la huida para evitar movimiento errático
          const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if(currentSpeed > this.maxSpeed) {
            this.vx = (this.vx / currentSpeed) * this.maxSpeed;
            this.vy = (this.vy / currentSpeed) * this.maxSpeed;
          }
        } else {
          // Gradualmente volver a la velocidad base cuando no hay interacción
          const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if(currentSpeed > this.baseSpeed) {
            this.vx *= 0.98;
            this.vy *= 0.98;
          }
        }
        
        // Actualización de la posición basada en la velocidad actual
        this.x += this.vx;
        this.y += this.vy;
        
        // Sistema de rebote en los bordes del canvas
        if(this.x < 0 || this.x > canvas.width) {
          this.vx *= -1;
          this.x = this.x < 0 ? 0 : canvas.width;
        }
        if(this.y < 0 || this.y > canvas.height) {
          this.vy *= -1;
          this.y = this.y < 0 ? 0 : canvas.height;
        }
      }
      
      /**
       * Renderiza la partícula en el canvas
       * Dibuja el nodo principal como un punto pequeño y brillante
       */
      draw() {
        // Dibujo del núcleo principal de la partícula
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.staticSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Añadir un pequeño halo de brillo alrededor del nodo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.staticSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 120, 0, 0.1)`;
        ctx.fill();
      }
    }
    
    //---------------------------------------------------------------------------//
    //  Función para inicializar el sistema de partículas                        //
    //---------------------------------------------------------------------------//
    const initParticles = () => {
      // Reiniciar el array de partículas
      particles = [];
      // Aumentar el número de partículas (+10 adicionales para mayor densidad)
      const particleCount = Math.min(100, Math.max(60, (canvas.width * canvas.height) / 15000)) + 10;
      
      // Creación de las partículas individuales
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    //---------------------------------------------------------------------------//
    //  Función para dibujar las conexiones entre partículas cercanas            //
    //---------------------------------------------------------------------------//
    const drawLines = () => {
      // Aumentar la visibilidad de las líneas entre nodos
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          // Cálculo de la distancia entre cada par de partículas
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Aumentar la distancia máxima para mostrar más conexiones
          const maxDistance = 150; // Aumentado para mayor conectividad visual
          
          // Si las partículas están lo suficientemente cerca, dibujar conexión
          if(distance < maxDistance) {
            // Calcular opacidad basada en la distancia - más cerca = más visible
            const opacity = 1 - (distance / maxDistance);
            
            // Aumentar el valor base de opacidad para líneas más visibles
            const baseOpacity = 0.4; // Incrementado para mejor visibilidad
            const finalOpacity = baseOpacity + opacity * 0.6;
            
            // Configuración del estilo de línea - más grosor para mejor visibilidad
            ctx.lineWidth = 0.8; // Aumentado para líneas más prominentes
            
            // Color naranja claro que complementa las partículas
            ctx.strokeStyle = `rgba(245, 110, 15, ${finalOpacity})`;
            
            // Dibujo de la línea de conexión
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    //---------------------------------------------------------------------------//
    //  Función principal de animación - loop de renderizado                     //
    //---------------------------------------------------------------------------//
    const animate = () => {
      // Fondo negro completo como en la imagen de referencia
      ctx.fillStyle = 'rgba(21, 20, 25, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Actualizar y dibujar cada partícula en el sistema
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      // Dibujar todas las conexiones entre partículas
      drawLines();
      
      // Programar el siguiente frame de animación
      requestAnimationFrame(animate);
    };
    
    //---------------------------------------------------------------------------//
    //  Inicialización del sistema completo                                      //
    //---------------------------------------------------------------------------//
    initParticles();
    animate();
    
    //---------------------------------------------------------------------------//
    //  Función de limpieza al desmontar el componente                           //
    //---------------------------------------------------------------------------//
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // El efecto se ejecuta solo una vez al montar el componente

  //---------------------------------------------------------------------------//
  //  Renderizado del elemento canvas con clase CSS específica                 //
  //---------------------------------------------------------------------------//
  return (
    <canvas 
      ref={canvasRef} 
      className="login-particles-canvas"
    />
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   //
//===========================================================================//
export default LoginParticles;
//===========================================================================//