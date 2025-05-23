import React from 'react';
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
const MarkdownModal = ( {
  isOpen,
  onClose,
  onExpand,
  ExpandIcon,
  children
}) => {
  if( !isOpen )
    return null;

  const handleKeyDown = e => {
    if( e.key === 'Escape' )
      onClose();
  };

  const modalContent = (
    <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="modal-container markdown-modal">
        <header className="modal-header">
          <div className="modal-title-container">
            <span className="modal-title">Editor Markdown</span>
          </div>
          <div className="modal-controls">
              <button className="modal-icon-button" onClick={onExpand} aria-label="Expandir">
                <ExpandIcon />
              </button>
            <button className="modal-icon-button" onClick={onClose} aria-label="Cerrar">
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
