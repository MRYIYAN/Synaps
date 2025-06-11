import React from 'react';
import ReactDOM from 'react-dom';
import '../Taskboard.css';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para formatear el estado de la tarea
  const formatStatus = (status) => {
    const statusMap = {
      'todo': 'Por hacer',
      'in-progress': 'En progreso',
      'done': 'Completada'
    };
    return statusMap[status] || status;
  };

  // Función para obtener la clase CSS del estado
  const getStatusClass = (status) => {
    return `task-status-badge ${status}`;
  };

  // Manejar tecla Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // No renderizar si el modal no está abierto o no hay tarea
  if (!isOpen || !task) return null;

  // Renderizar el modal usando Portal para que aparezca fuera del contexto del sidebar
  return ReactDOM.createPortal(
    <div 
      className="task-modal-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="task-modal task-details-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="task-modal-header">
          <h2 className="task-modal-title">Detalles de la Tarea</h2>
          <button 
            className="task-modal-close" 
            onClick={onClose}
            type="button"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="task-details-content">
          {/* Título de la tarea */}
          <div className="detail-section">
            <label className="detail-label">Título</label>
            <h3 className="task-detail-title">{task.title}</h3>
          </div>

          {/* Estado de la tarea */}
          <div className="detail-section">
            <label className="detail-label">Estado</label>
            <span className={getStatusClass(task.status)}>
              {formatStatus(task.status)}
            </span>
          </div>

          {/* Descripción de la tarea */}
          {task.description && (
            <div className="detail-section">
              <label className="detail-label">Descripción</label>
              <div className="task-detail-description">
                {task.description}
              </div>
            </div>
          )}

          {/* Información de fechas */}
          <div className="detail-section">
            <label className="detail-label">Fecha de creación</label>
            <div className="task-detail-date">
              {formatDate(task.createdAt)}
            </div>
          </div>

          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <div className="detail-section">
              <label className="detail-label">Última modificación</label>
              <div className="task-detail-date">
                {formatDate(task.updatedAt)}
              </div>
            </div>
          )}
        </div>

        {/* Botón de acción */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onClose}
            aria-label="Cerrar modal de detalles"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body // Renderizar el modal directamente en el body
  );
};

export default TaskDetailsModal;
