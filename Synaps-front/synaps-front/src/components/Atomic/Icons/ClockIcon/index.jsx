import React, { useState } from 'react';
import './ClockIcon.css';

const ClockIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`clock-icon-container ${className}`}
      aria-label="clock-8"
      role="img"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        <circle cx="12" cy="12" r="10" />
        <line 
          x1="12" 
          y1="6" 
          x2="12" 
          y2="12" 
          className={isHovered ? "minute-hand animate" : "minute-hand"} 
        />
        <line 
          x1="12" 
          y1="12" 
          x2="8" 
          y2="14" 
          className={isHovered ? "hour-hand animate" : "hour-hand"} 
        />
      </svg>
    </div>
  );
};

export default ClockIcon;