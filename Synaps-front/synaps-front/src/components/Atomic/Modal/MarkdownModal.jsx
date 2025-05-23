import React, { useState, useRef, useEffect } from 'react';

import { createPortal } from 'react-dom';
import { ReactComponent as CloseIcon } from '../../../assets/icons/close.svg';
import { ReactComponent as ExpandIcon } from '../../../assets/icons/expand.svg';

/**
 * Modal genérico con un editor Markdown y botón de expandir
 *
 * Props:
 * @param {boolean} isOpen            - Muestra u oculta el modal
 * @param {Function} onClose          - Callback al cerrar
 * @param {Function} onExpand         - Callback al pulsar expandir
 * @param {React.Component} ExpandIcon - Icono de expandir que se muestra arriba a la derecha
 * @param {JSX.Element} children      - Contenido interior (p.ej., el MarkdownEditor)
 */
const MarkdownModal = ( { children, onClose, onExpand } ) => {

  // Estado interno de apertura del modal
  const [open, setOpen] = useState( true );

  // Ref al contenedor para togglear fullscreen
  const containerRef = useRef( null );

  // Cada vez que cambian los children, volvemos a abrir y quitamos fullscreen
  useEffect( () => {
    setOpen( true );
    if( containerRef.current )
      containerRef.current.classList.remove( 'fullscreen' );
  }, [children] );

  // Cierra el modal
  const handleClose = () => {
    setOpen(false);
    if( onClose )
      onClose();
  };

    // Cierra modal con Escape
  const handleKeyDown = ( e ) => {
    if( e.key === 'Escape')
      setOpen( false );
  };

  if( !open )
    return null;

  const modalContent = (
    <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="modal-container popup markdown-modal" ref={containerRef}>
        <header className="modal-header">
          <div className="modal-title-container"></div>
          <div className="modal-controls">
            <button
              className="modal-icon-button"
              onClick={() => onExpand && onExpand()}
              aria-label="Expandir"
            >
              <ExpandIcon />
            </button>
            <button
              className="modal-icon-button"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>
        </header>
        <div className="modal-content markdown-content">
          {children}
        </div>
      </div>
    </div>
  );

  const root = document.getElementById('root');
  return root ? createPortal(modalContent, root) : modalContent;
};

export default MarkdownModal;
