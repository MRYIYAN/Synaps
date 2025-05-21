import React, { useState } from 'react';
import './CommentIcon.css';

const CommentIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`comment-icon-container ${className}`}
      aria-label="message-square-more"
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
        className={isHovered ? "message-square-more-icon animate" : "message-square-more-icon"}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path className="dot dot1" d="M8 10h.01" />
        <path className="dot dot2" d="M12 10h.01" />
        <path className="dot dot3" d="M16 10h.01" />
      </svg>
    </div>
  );
};

export default CommentIcon;