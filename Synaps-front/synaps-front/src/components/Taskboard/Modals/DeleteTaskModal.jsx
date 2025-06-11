import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../Taskboard.css';

const DeleteTaskModal = ({ isOpen, onClose, onDeleteTask, task }) => {
  const [isDeleting, setIsDeleting] = useState( false );
  const [error, setError] = useState( '' );
  
  // Manejar confirmación de eliminación
  const handleConfirmDelete = async() => {
    if( !task || !onDeleteTask ) {
      setError( 'Información de tarea no disponible' );
      return;
    }
    
    if( !task.task_id2 ) {
      setError( 'ID de tarea no válido' );
      return;
    }
    
    setIsDeleting( true );
    setError( '' );
    
    try {
      const result = await onDeleteTask( task.task_id2 );
      
      if( result && result.success ) {
        onClose();
      } else {
        const errorMessage = result?.message || 'Error al eliminar la tarea';
        setError( errorMessage );
      }
    } catch( error ) {
      setError( 'Error al eliminar la tarea. Inténtelo de nuevo.' );
    } finally {
      setIsDeleting( false );
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if( isDeleting ) return; // No permitir cerrar mientras se está eliminando
    setError( '' );
    onClose();
  };

  // Manejar tecla Escape
  const handleKeyDown = ( e ) => {
    if( e.key === 'Escape' && !isDeleting ) {
      handleClose();
    }
  };

  // No renderizar si el modal no está abierto o no hay tarea
  if( !isOpen || !task ) return null;

  // Renderizar el modal usando Portal para que aparezca fuera del contexto del sidebar
  return ReactDOM.createPortal(
    <div 
      className="task-modal-overlay" 
      onClick={isDeleting ? undefined : handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >        <div 
          className="task-modal delete-modal" 
          onClick={( e ) => e.stopPropagation()}
        >
        {/* Header del modal */}
        <div className="task-modal-header">
          <h2 className="task-modal-title">Eliminar Tarea</h2>
          <button 
            className="task-modal-close" 
            onClick={handleClose}
            type="button"
            aria-label="Cerrar modal"
            disabled={isDeleting}
          >
            ×
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="delete-modal-content">
          {/* Error */}
          {error && (
            <div className="form-error-general" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}
          <div className="delete-warning-icon">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 9V13M12 17.0195V17M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" 
                stroke="#dc3545" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <p className="delete-message">
            ¿Estás seguro de que quieres eliminar esta tarea?
          </p>
          
          <div className="task-preview">
            <h4 className="task-preview-title">"{task.title}"</h4>
            {task.description && (
              <p className="task-preview-description">
                {task.description.length > 100 
                  ? `${task.description.substring( 0, 100 )}...` 
                  : task.description
                }
              </p>
            )}
            <span className="task-preview-date">
              Creada el {new Date( task.created_at ).toLocaleDateString( 'es-ES' )}
            </span>
          </div>
          
          <p className="delete-warning">
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn-danger"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Tarea'}
          </button>
        </div>
      </div>
    </div>,
    document.body // Renderizar el modal directamente en el body
  );
};

export default DeleteTaskModal;
