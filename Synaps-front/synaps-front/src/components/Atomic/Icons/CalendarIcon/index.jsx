import React, { useState, useEffect, useRef } from 'react';
import './CalendarIcon.css';

const CalendarIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  // Definir la posición de los puntos del calendario
  const DOTS = [
    { cx: 8, cy: 14 },
    { cx: 12, cy: 14 },
    { cx: 16, cy: 14 },
    { cx: 8, cy: 18 },
    { cx: 12, cy: 18 },
    { cx: 16, cy: 18 }
  ];

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`calendar-icon-container ${className}`} 
      aria-label="calendar-days" 
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
      >
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        {DOTS.map((dot, index) => (
          <circle
            key={index}
            cx={dot.cx}
            cy={dot.cy}
            r="1"
            fill={color}
            stroke="none"
            className={isHovered ? "dot animate" : "dot"}
            style={{ animationDelay: `${index * 0.17}s` }}
          />
        ))}
      </svg>
    </div>
  );
};

export default CalendarIcon;