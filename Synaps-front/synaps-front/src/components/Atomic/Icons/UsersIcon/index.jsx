import React, { useState, useEffect } from 'react';
import './style.css';

const UsersIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedX, setAnimatedX] = useState(0);

  useEffect(() => {
    let timeout;
    if (isHovered) {
      setAnimatedX(-6);
      timeout = setTimeout(() => {
        setIsHovered(false);
        setAnimatedX(0);
      }, 300);
    }
    return () => clearTimeout(timeout);
  }, [isHovered]);

  return (
    <div 
      className={`users-icon-wrapper ${className}`} 
      aria-label="users" 
      role="img" 
      onMouseEnter={() => setIsHovered(true)}
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
        className="users-icon"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path 
          d="M22 21v-2a4 4 0 0 0-3-3.87" 
          style={{ transform: `translateX(${animatedX}px)` }} 
        />
        <path 
          d="M16 3.13a4 4 0 0 1 0 7.75" 
          style={{ transform: `translateX(${animatedX}px)` }} 
        />
      </svg>
    </div>
  );
};

export default UsersIcon;