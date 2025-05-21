import React, { useState, useEffect, useRef } from 'react';
import './SearchIcon.css';

const SearchIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 500);
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
      className={className} 
      aria-label="search-check" 
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
        className={isHovered ? "search-check-icon animate" : "search-check-icon"}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m8 11 2 2 4-4" className="check-path" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </div>
  );
};

export default SearchIcon;