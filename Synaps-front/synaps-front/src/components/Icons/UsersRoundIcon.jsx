import React, { useState, useRef, useEffect } from 'react';

const UsersRoundIcon = ({ 
  color = 'currentColor', 
  size = 24, 
  strokeWidth = 2,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedX, setAnimatedX] = useState(0);
  const animationRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // Animación de spring
    if (animationRef.current) clearTimeout(animationRef.current);
    
    // Valor inicial
    setAnimatedX(-5);
    
    // Animación de retorno
    animationRef.current = setTimeout(() => {
      setIsHovered(false);
      setAnimatedX(0);
    }, 300);
  };

  return (
    <div 
      className={`user-round-icon-wrapper ${className}`} 
      aria-label="users-round" 
      role="img" 
      onMouseEnter={handleMouseEnter}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="users-round-icon"
      >
        <path d="M18 21a8 8 0 0 0-16 0" />
        <circle cx="10" cy="8" r="5" />
        <path
          d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"
          style={{ transform: `translateX(${animatedX}px)`, transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
        />
      </svg>
    </div>
  );
};

export default UsersRoundIcon;