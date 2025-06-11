import React from 'react';
import ReactDOM from 'react-dom';
import '../Taskboard.css';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if(!dateString) return 'No disponible';
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

  // Función para formatear la prioridad
  const formatPriority = (priority) => {
    const priorityMap = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return priorityMap[priority] || priority;
  };

  // Función para obtener la clase CSS del estado
  const getStatusClass = (status) => {
    return `task-status-badge ${status}`;
  };

  // Función para obtener la clase CSS de la prioridad
  const getPriorityClass = (priority) => {
    return `task-priority-badge ${priority}`;
  };

  // Manejar tecla Escape
  const handleKeyDown = (e) => {
    if(e.key === 'Escape') {
      onClose();
    }
  };

  // No renderizar si el modal no está abierto o no hay tarea
  if(!isOpen || !task) return null;

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

          {/* Prioridad de la tarea */}
          {task.priority && (
            <div className="detail-section">
              <label className="detail-label">Prioridad</label>
              <span className={getPriorityClass(task.priority)}>
                {formatPriority(task.priority)}
              </span>
            </div>
          )}

          {/* Fecha de vencimiento */}
          {task.due_date && (
            <div className="detail-section">
              <label className="detail-label">Fecha de vencimiento</label>
              <div className="task-detail-date">
                {new Date(task.due_date).toLocaleDateString('es-ES')}
              </div>
            </div>
          )}

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
              {formatDate(task.created_at)}
            </div>
          </div>

          {task.updated_at && task.updated_at !== task.created_at && (
            <div className="detail-section">
              <label className="detail-label">Última modificación</label>
              <div className="task-detail-date">
                {formatDate(task.updated_at)}
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
