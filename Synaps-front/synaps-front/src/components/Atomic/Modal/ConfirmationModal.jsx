import React from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as CloseIcon } from '../../../assets/icons/close.svg';

/**
 * Componente genérico de modal de confirmación
 *
 * Props:
 * @param {boolean} isOpen        - Muestra u oculta el modal
 * @param {string}  title         - Título del modal
 * @param {string}  message       - Mensaje de confirmación
 * @param {string}  confirmText   - Texto del botón de confirmación
 * @param {string}  cancelText    - Texto del botón de cancelación
 * @param {React.Component} icon  - Icono JSX opcional junto al título
 * @param {Function} onConfirm    - Callback al confirmar
 * @param {Function} onCancel     - Callback al cancelar o cerrar
 */
const ConfirmationModal = ( {
  isOpen,
  title = 'Confirmar acción',
  message = '¿Estás seguro?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  icon: Icon,
  onConfirm,
  onCancel
} ) => {
  if( !isOpen )
    return null;

  const handleKeyDown = ( e ) => {
    if( e.key === 'Escape' )
      onCancel();
  };

  const modalContent = (
    <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="modal-container confirmation-modal">
        <header className="modal-header">
          <div className="modal-title-container">
            {Icon ? <Icon className="modal-icon" /> : null}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close-button" onClick={onCancel} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-content">
          <p>{message}</p>
        </div>

        <footer className="modal-footer">
          <button className="modal-button secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="modal-button primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );

  // Busca el <div id="root"> de tu index.html
  const root = document.getElementById('root');
  return root ? createPortal( modalContent, root ) : modalContent;
};

export default ConfirmationModal;
