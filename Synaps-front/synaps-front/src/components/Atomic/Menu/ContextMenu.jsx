// ContextMenu.jsx
import React from 'react';
import './Menu.css';

export default function ContextMenu({ options, x, y, onClose }) {
  React.useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (x === null || y === null) return null;

  return (
    <div
      className="menu"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 1000,
      }}
    >
      <ul className="menu-list">
        {options.map((opt, idx) =>
          opt.divider ? (
            <li key={'div-' + idx} className="menu-divider" />
          ) : (
            <li
              key={opt.label + idx}
              className="menu-item"
              tabIndex={0}
              onClick={e => {
                e.stopPropagation();
                onClose();
                opt.onClick && opt.onClick();
              }}
              role="menuitem"
            >
              <span className="menu-text">{opt.label}</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}