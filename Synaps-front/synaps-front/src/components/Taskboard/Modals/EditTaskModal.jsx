import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../Taskboard.css';

const EditTaskModal = ({ isOpen, onClose, onEditTask, task }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'todo'
  });

  const [errors, setErrors] = useState({});

  // Cargar datos de la tarea cuando el modal se abre
  useEffect(() => {
    if (isOpen && task) {
      setTaskData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo'
      });
    }
  }, [isOpen, task]);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!taskData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (taskData.title.length > 100) {
      newErrors.title = 'El título no puede tener más de 100 caracteres';
    }
    
    if (taskData.description.length > 500) {
      newErrors.description = 'La descripción no puede tener más de 500 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Crear la tarea editada manteniendo los datos originales
    const editedTask = {
      ...task, // Mantener ID, createdAt, etc.
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      status: taskData.status,
      updatedAt: new Date().toISOString()
    };
    
    onEditTask(editedTask);
    handleClose();
  };

  // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setTaskData({
      title: '',
      description: '',
      status: 'todo'
    });
    setErrors({});
    onClose();
  };

  // Manejar tecla Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  // No renderizar si el modal no está abierto
  if (!isOpen || !task) return null;

  // Renderizar el modal usando Portal para que aparezca fuera del contexto del sidebar
  return ReactDOM.createPortal(
    <div 
      className="task-modal-overlay" 
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="task-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="task-modal-header">
          <h2 className="task-modal-title">Editar Tarea</h2>
          <button 
            className="task-modal-close" 
            onClick={handleClose}
            type="button"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <form className="task-form" onSubmit={handleSubmit}>
          {/* Título */}
          <div className="form-group">
            <label htmlFor="editTaskTitle" className="form-label">
              Título *
            </label>
            <input
              id="editTaskTitle"
              name="title"
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Ingresa el título de la tarea..."
              value={taskData.title}
              onChange={handleInputChange}
              maxLength={100}
              autoFocus
            />
            {errors.title && (
              <span className="form-error">{errors.title}</span>
            )}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="editTaskDescription" className="form-label">
              Descripción
            </label>
            <textarea
              id="editTaskDescription"
              name="description"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe la tarea (opcional)..."
              value={taskData.description}
              onChange={handleInputChange}
              maxLength={500}
              rows={4}
            />
            {errors.description && (
              <span className="form-error">{errors.description}</span>
            )}
            <span className="form-helper">
              {taskData.description.length}/500 caracteres
            </span>
          </div>

          {/* Estado de la tarea */}
          <div className="form-group">
            <label htmlFor="editTaskStatus" className="form-label">
              Estado
            </label>
            <select
              id="editTaskStatus"
              name="status"
              className="form-select"
              value={taskData.status}
              onChange={handleInputChange}
            >
              <option value="todo">Por hacer</option>
              <option value="in-progress">En progreso</option>
              <option value="done">Completado</option>
            </select>
          </div>

          {/* Información de fechas */}
          <div className="form-group">
            <label className="form-label">
              Fecha de creación
            </label>
            <input
              type="text"
              className="form-input"
              value={task ? new Date(task.createdAt).toLocaleDateString('es-ES') : ''}
              disabled
              style={{ backgroundColor: 'var(--gluon_gray, #1B1B1E)', color: 'rgba(251, 251, 251, 0.6)' }}
            />
            {task && task.updatedAt && task.updatedAt !== task.createdAt && (
              <>
                <label className="form-label" style={{ marginTop: '8px' }}>
                  Última modificación
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={new Date(task.updatedAt).toLocaleDateString('es-ES')}
                  disabled
                  style={{ backgroundColor: 'var(--gluon_gray, #1B1B1E)', color: 'rgba(251, 251, 251, 0.6)' }}
                />
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!taskData.title.trim()}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Renderizar el modal directamente en el body
  );
};

export default EditTaskModal;
