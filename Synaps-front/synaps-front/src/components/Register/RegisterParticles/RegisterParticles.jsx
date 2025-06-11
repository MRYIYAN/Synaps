import React, { useRef, useEffect } from 'react';
import './RegisterParticles.css';

const RegisterParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Variables para seguimiento del ratón
    let mouseX = -1000;
    let mouseY = -1000;
    const mouseRadius = 100; // Radio de influencia del ratón
    
    // Ajustar tamaño del canvas
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Seguimiento de la posición del ratón
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    // Evento para detectar movimiento del ratón
    window.addEventListener('mousemove', handleMouseMove);

    // Array para almacenar partículas
    let particles = [];
    
    // Clase para definir las partículas
    class Particle {
      constructor() {
        // Posicionamiento - distribución uniforme pero con más densidad en los bordes
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        
        // Velocidad base - un poco más rápida para movimiento fluido
        this.vx = (Math.random() * 0.4 - 0.2);
        this.vy = (Math.random() * 0.4 - 0.2);
        
        // Velocidad máxima (para cuando huye del ratón)
        this.maxSpeed = 2.5;
        
        // Velocidad normal (para movimiento regular)
        this.baseSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        // Tamaño - pequeños nodos como en la imagen
        this.size = 1.5 + Math.random() * 1.5;
        
        // Color - naranja brillante exactamente como en la imagen
        this.opacity = 0.8 + Math.random() * 0.2;
        this.color = `rgba(255, 120, 0, ${this.opacity})`;
        
        // Sin animación de pulso para que sea idéntico a la imagen
        this.staticSize = this.size;
      }
      
      update() {
        // Calcular distancia al cursor
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si está dentro del radio de influencia, huir del ratón
        if(distance < mouseRadius) {
          // Factor de repulsión: más cercano = huida más rápida
          const repulsionFactor = 1 - distance / mouseRadius;
          
          // Calcular dirección opuesta al ratón
          const angle = Math.atan2(dy, dx);
          
          // Aplicar fuerza de repulsión (dirección contraria)
          this.vx -= Math.cos(angle) * repulsionFactor * 0.3;
          this.vy -= Math.sin(angle) * repulsionFactor * 0.3;
          
          // Limitar velocidad máxima durante la huida
          const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if(currentSpeed > this.maxSpeed) {
            this.vx = (this.vx / currentSpeed) * this.maxSpeed;
            this.vy = (this.vy / currentSpeed) * this.maxSpeed;
          }
        } else {
          // Gradualmente volver a la velocidad base si no está huyendo
          const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if(currentSpeed > this.baseSpeed) {
            this.vx *= 0.98;
            this.vy *= 0.98;
          }
        }
        
        // Mover partículas
        this.x += this.vx;
        this.y += this.vy;
        
        // Rebote en bordes
        if(this.x < 0 || this.x > canvas.width) {
          this.vx *= -1;
          this.x = this.x < 0 ? 0 : canvas.width;
        }
        if(this.y < 0 || this.y > canvas.height) {
          this.vy *= -1;
          this.y = this.y < 0 ? 0 : canvas.height;
        }
      }
      
      draw() {
        // Dibujar el nodo como un punto pequeño y brillante
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.staticSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Añadir un pequeño brillo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.staticSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 120, 0, 0.1)`;
        ctx.fill();
      }
    }
    
    // Inicializar partículas
    const initParticles = () => {
      particles = [];
      // Más partículas (+10 adicionales)
      const particleCount = Math.min(100, Math.max(60, (canvas.width * canvas.height) / 15000)) + 10;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    // Dibujar líneas de conexión entre partículas
    const drawLines = () => {
      // Aumentar la visibilidad de las líneas entre nodos
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Aumentar la distancia máxima para mostrar líneas
          const maxDistance = 150; // Aumentar de ~100 a 150
          
          if(distance < maxDistance) {
            // Calcular opacidad basada en la distancia
            const opacity = 1 - (distance / maxDistance);
            
            // Aumentar el valor base de opacidad para líneas más visibles
            const baseOpacity = 0.4; // Aumentar de ~0.2 a 0.4
            const finalOpacity = baseOpacity + opacity * 0.6;
            
            // Aumentar el ancho de la línea
            ctx.lineWidth = 0.8; // Aumentar de ~0.5 a 0.8
            
            // Color más visible (naranja claro)
            ctx.strokeStyle = `rgba(245, 110, 15, ${finalOpacity})`;
            
            // Dibujar la línea
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Función principal de animación
    const animate = () => {
      // Fondo negro completo
      ctx.fillStyle = 'rgba(21, 20, 25, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Actualizar y dibujar cada partícula
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      // Dibujar conexiones
      drawLines();
      
      // Siguiente frame
      requestAnimationFrame(animate);
    };
    
    // Inicializar
    initParticles();
    animate();
    
    // Limpieza cuando se desmonta el componente
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="register-particles-canvas"
    />
  );
};

export default RegisterParticles;