import React from 'react';
import './IconMenu.css';

/**
 * @param {Array<{label: string, onClick?: () => void, divider?: boolean}>} options
 */
export default function IconMenu({ options }) {
  return (
    <div className="menu">
      <ul className="menu-list">
        {options.map((opt, idx) =>
          opt.divider ? (
            <li key={'div-' + idx} className="menu-divider" />
          ) : (
            <li
              key={opt.label + idx}
              className="menu-item"
              tabIndex={0}
              onClick={opt.onClick}
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