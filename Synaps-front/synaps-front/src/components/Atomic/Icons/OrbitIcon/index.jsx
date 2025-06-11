import React, { useState, useEffect } from 'react';
import './style.css';

// Versión más simple del OrbitIcon para depuración
const OrbitIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Efecto para resetear el estado de hover después de 3 segundos
  useEffect(() => {
    let timeout;
    if(isHovered) {
      timeout = setTimeout(() => {
        setIsHovered(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div 
      className={`orbit-icon-wrapper ${className}`} 
      aria-label="orbit" 
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
        className={`orbit-icon ${isHovered ? 'animate' : ''}`}
      >
        <circle cx="12" cy="12" r="3" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <path d="M10.4 21.9a10 10 0 0 0 9.941-15.416" />
        <path d="M13.5 2.1a10 10 0 0 0-9.841 15.416" />
      </svg>
    </div>
  );
};

export default OrbitIcon;