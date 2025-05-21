import React, { useState } from 'react';
import './BlocksIcon.css';

const BlocksIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={className}
      aria-label="blocks"
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
        className="blocks-icon"
      >
        <rect 
          width="7" 
          height="7" 
          x="14" 
          y="3" 
          rx="1" 
          className={isHovered ? 'top-right' : ''} 
        />
        <path
          d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"
        />
      </svg>
    </div>
  );
};

export default BlocksIcon;