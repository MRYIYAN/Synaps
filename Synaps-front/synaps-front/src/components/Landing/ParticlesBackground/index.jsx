//===========================================================================   //
//                     COMPONENTE DE FONDO CON PARTÍCULAS                      //
//===========================================================================   //
//  Este componente crea un fondo interactivo con partículas/nodos que simulan  //
//  conexiones neuronales. Las partículas reaccionan al movimiento del cursor   //
//  y forman conexiones entre sí, creando un efecto visual de red neuronal.     //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useEffect, useRef } from 'react';
import './ParticlesBackground.css';

// Agregar un prop para identificar si estamos en la página de login
const ParticlesBackground = ({ className, isLoginPage }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Mantener estilos inline para asegurar visibilidad
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configurar tamaño del canvas
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    
    // Variables para la animación
    let particles = [];
    let animationId;
    const mousePosition = { x: undefined, y: undefined };
    
    // Clase para las partículas
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.15 + Math.random() * 0.25; // Velocidad ligeramente más lenta
        
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.originalSpeedX = this.speedX;
        this.originalSpeedY = this.speedY;
        
        // Nodos más consistentes con mayor tamaño y opacidad
        this.size = 2.5 + Math.random() * 1.5;
        this.baseSize = this.size; // Guardamos el tamaño original
        this.opacity = 0.6 + Math.random() * 0.4; // Mayor opacidad base (0.6-1.0)
        this.color = `rgba(255, 100, 0, ${this.opacity})`;
      }
      
      update() {
        // Influencia del cursor
        if (mousePosition.x !== undefined && mousePosition.y !== undefined) {
          const dx = this.x - mousePosition.x;
          const dy = this.y - mousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 180) { // Radio de influencia aumentado
            const angle = Math.atan2(dy, dx);
            const force = (180 - distance) / 180;
            
            // Aumentar tamaño al acercarse al cursor
            this.size = this.baseSize + (force * 2);
            
            // Ajustar velocidad
            this.speedX = this.originalSpeedX + Math.cos(angle) * force * 0.6;
            this.speedY = this.originalSpeedY + Math.sin(angle) * force * 0.6;
          } else {
            this.speedX = this.originalSpeedX;
            this.speedY = this.originalSpeedY;
            this.size = this.baseSize; // Restaurar tamaño original
          }
        }
        
        // Mover partícula
        this.x += this.speedX;
        this.y += this.speedY;
        
        // MEJORA: Manejar rebotes en los bordes de forma más dinámica
        const bounceFactor = 0.65; // Reducción de velocidad al rebotar (más pronunciada)
        const minSpeed = 0.05; // Velocidad mínima para evitar estancamiento
        const margin = 10; // Margen de seguridad aumentado
        const randomBoost = 0.08; // Impulso aleatorio para variación en rebotes
        
        // Rebote en bordes horizontales
        if (this.x >= canvas.width - margin) {
          this.x = canvas.width - margin - 1; // Moverlo ligeramente dentro del borde
          
          // Invertir dirección y reducir velocidad
          this.speedX = -Math.abs(this.speedX) * bounceFactor;
          
          // Añadir componente aleatorio a la velocidad Y para evitar movimiento repetitivo
          this.speedY += (Math.random() - 0.5) * randomBoost;
          
          // Aplicar un pequeño impulso aleatorio para evitar estancamiento
          if (Math.abs(this.speedX) < minSpeed) {
            this.speedX = -minSpeed - Math.random() * 0.1;
          }
          
          // Actualizar velocidad original
          this.originalSpeedX = this.speedX;
        } else if (this.x <= margin) {
          this.x = margin + 1; // Moverlo ligeramente dentro del borde
          
          // Invertir dirección y reducir velocidad
          this.speedX = Math.abs(this.speedX) * bounceFactor;
          
          // Añadir componente aleatorio a la velocidad Y
          this.speedY += (Math.random() - 0.5) * randomBoost;
          
          // Aplicar impulso mínimo
          if (Math.abs(this.speedX) < minSpeed) {
            this.speedX = minSpeed + Math.random() * 0.1;
          }
          
          // Actualizar velocidad original
          this.originalSpeedX = this.speedX;
        }
        
        // Rebote en bordes verticales
        if (this.y >= canvas.height - margin) {
          this.y = canvas.height - margin - 1; // Moverlo ligeramente dentro del borde
          
          // Invertir dirección y reducir velocidad
          this.speedY = -Math.abs(this.speedY) * bounceFactor;
          
          // Añadir componente aleatorio a la velocidad X
          this.speedX += (Math.random() - 0.5) * randomBoost;
          
          // Aplicar un pequeño impulso aleatorio para evitar estancamiento
          if (Math.abs(this.speedY) < minSpeed) {
            this.speedY = -minSpeed - Math.random() * 0.1;
          }
          
          // Actualizar velocidad original
          this.originalSpeedY = this.speedY;
        } else if (this.y <= margin) {
          this.y = margin + 1; // Moverlo ligeramente dentro del borde
          
          // Invertir dirección y reducir velocidad
          this.speedY = Math.abs(this.speedY) * bounceFactor;
          
          // Añadir componente aleatorio a la velocidad X
          this.speedX += (Math.random() - 0.5) * randomBoost;
          
          // Aplicar impulso mínimo
          if (Math.abs(this.speedY) < minSpeed) {
            this.speedY = minSpeed + Math.random() * 0.1;
          }
          
          // Actualizar velocidad original
          this.originalSpeedY = this.speedY;
        }
      }
      
      draw() {
        // Dibujar el nodo con un efecto de brillo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Gradiente radial para un efecto de brillo
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        
        // Color interno brillante
        gradient.addColorStop(0, `rgba(255, 130, 30, ${this.opacity})`);
        // Color externo más tenue
        gradient.addColorStop(1, `rgba(255, 100, 0, ${this.opacity * 0.5})`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
    
    // Función para dibujar líneas entre partículas
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Conexiones más largas y más visibles
          const connectionDistance = 160; // Aumentado de 150 a 160
          
          if (distance < connectionDistance) {
            // Calcular opacidad basada en distancia - más consistente
            // Mínimo 0.15, máximo 0.4
            const opacity = 0.15 + (0.25 * (1 - distance / connectionDistance));
            
            ctx.beginPath();
            // Líneas más visibles con color mejorado
            ctx.strokeStyle = `rgba(255, 120, 20, ${opacity})`;
            ctx.lineWidth = 0.7; // Ligeramente más anchas
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Inicializar partículas
    const initParticles = () => {
      particles = [];
      // Ajustamos la densidad de partículas
      const count = Math.min(70, Math.max(35, (canvas.width * canvas.height) / 18000));
      
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };
    
    // Eventos de interacción
    const handleMouseMove = (e) => {
      mousePosition.x = e.clientX;
      mousePosition.y = e.clientY;
    };
    
    const handleResize = () => {
      setCanvasSize();
      initParticles();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Inicialización
    initParticles();
    
    // Función principal de animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawLines();
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Iniciar animación
    animate();
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [className]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`particles-background particles-canvas ${className || ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ParticlesBackground;
//===========================================================================//