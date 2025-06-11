import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../Taskboard.css';

const EditTaskModal = ({ isOpen, onClose, onEditTask, task }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos de la tarea cuando el modal se abre
  useEffect(() => {
    if(isOpen && task) {
      setTaskData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date || ''
      });
      setErrors({});
      setIsSubmitting(false);
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
    if(errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if(!taskData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if(taskData.title.length > 255) {
      newErrors.title = 'El título no puede tener más de 255 caracteres';
    }
    
    if(taskData.description.length > 1000) {
      newErrors.description = 'La descripción no puede tener más de 1000 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    if(!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar datos para enviar al backend (solo los campos que pueden cambiar)
      const updateData = {
        title: taskData.title.trim(),
        description: taskData.description.trim() || null,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.due_date || null
      };
      
      const result = await onEditTask(task.task_id2, updateData);
      
      if(result && result.success) {
        handleClose();
      } else {
        setErrors({ general: result?.message || 'Error al actualizar la tarea' });
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      setErrors({ general: 'Error al actualizar la tarea. Inténtelo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setTaskData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  // Manejar tecla Escape
  const handleKeyDown = (e) => {
    if(e.key === 'Escape') {
      handleClose();
    }
  };

  // No renderizar si el modal no está abierto
  if(!isOpen || !task) return null;

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
          {/* Error general */}
          {errors.general && (
            <div className="form-error-general">
              {errors.general}
            </div>
          )}

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
              maxLength={255}
              autoFocus
              disabled={isSubmitting}
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
              maxLength={1000}
              rows={4}
              disabled={isSubmitting}
            />
            {errors.description && (
              <span className="form-error">{errors.description}</span>
            )}
            <span className="form-helper">
              {taskData.description.length}/1000 caracteres
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
              disabled={isSubmitting}
            >
              <option value="todo">Por hacer</option>
              <option value="in-progress">En progreso</option>
              <option value="done">Completado</option>
            </select>
          </div>

          {/* Prioridad */}
          <div className="form-group">
            <label htmlFor="editTaskPriority" className="form-label">
              Prioridad
            </label>
            <select
              id="editTaskPriority"
              name="priority"
              className="form-select"
              value={taskData.priority}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Fecha de vencimiento */}
          <div className="form-group">
            <label htmlFor="editTaskDueDate" className="form-label">
              Fecha de vencimiento
            </label>
            <input
              id="editTaskDueDate"
              name="due_date"
              type="date"
              className="form-input"
              value={taskData.due_date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
            />
          </div>

          {/* Información de fechas */}
          <div className="form-group">
            <label className="form-label">
              Fecha de creación
            </label>
            <input
              type="text"
              className="form-input"
              value={task ? new Date(task.created_at).toLocaleDateString('es-ES') : ''}
              disabled
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
            />
            {task && task.updated_at && task.updated_at !== task.created_at && (
              <>
                <label className="form-label" style={{ marginTop: '8px' }}>
                  Última modificación
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={new Date(task.updated_at).toLocaleDateString('es-ES')}
                  disabled
                  style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
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
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!taskData.title.trim() || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Renderizar el modal directamente en el body
  );
};

export default EditTaskModal;
