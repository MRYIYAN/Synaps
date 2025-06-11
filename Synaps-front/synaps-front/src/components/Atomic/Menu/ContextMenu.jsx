import React, { useRef, useEffect } from 'react';
import './Menu.css';

export default function ContextMenu( { options, x, y, onClose } ) {

  const menuRef = useRef();

  useEffect( () => {
    function handleClick( e ) {

      // Si se hace un click y no es al modal, lo cerramos
      if( menuRef.current && !menuRef.current.contains( e.target ) )
        onClose();
    }

    // Añadimos el evento
    window.addEventListener( 'mousedown', handleClick );
    return () => window.removeEventListener( 'mousedown', handleClick );

  }, [onClose] );

  if( x === null || y === null )
    return null;

  return (
    <div
      ref={menuRef}
      className="menu"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 1000,
      }}
    >
      <ul className="menu-list">
        {options.map( ( opt, index ) =>
          opt.divider ? (
            <li key={'div-' + index} className="menu-divider" />
          ) : (
            <li
              key={opt.label + index}
              className="menu-item"
              tabIndex={0}
              onClick={e => {
                e.stopPropagation();
                if( opt.onClick )
                  opt.onClick();
                
                onClose();
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