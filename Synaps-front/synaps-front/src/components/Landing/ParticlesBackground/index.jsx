import React, { useEffect, useRef } from 'react';
import './ParticlesBackground.css';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    // Clase para partículas - MOVIDO ANTES DE SU USO
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = this.getParticleColor();
      }

      getParticleColor() {
        // Colores para las partículas: blanco, gris claro y naranja muy sutil
        const colors = [
          'rgba(251, 251, 251, 0.7)',  // blanco
          'rgba(135, 135, 135, 0.5)',  // gris
          'rgba(245, 110, 15, 0.3)',   // naranja sutil
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebote en los bordes
        if (this.x >= canvas.width || this.x <= 0) {
          this.speedX = -this.speedX;
        }
        if (this.y >= canvas.height || this.y <= 0) {
          this.speedY = -this.speedY;
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Configuración del tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 1.2; // Mayor altura para cubrir el scroll inicial
      initParticles();
    };

    // Inicializar partículas
    function initParticles() {
      particles = [];
      const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Función de animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar gradiente en la parte inferior
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(245, 110, 15, 0)');
      gradient.addColorStop(1, 'rgba(245, 110, 15, 0.15)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      // Actualizar y dibujar partículas
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Limpieza cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="particles-canvas"></canvas>
  );
};

export default ParticlesBackground;