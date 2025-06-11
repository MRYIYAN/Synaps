import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../Taskboard.css';

const CreateTaskModal = ({ isOpen, onClose, onCreateTask }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

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
    
    // Crear la nueva tarea
    const newTask = {
      id: Date.now(), // ID temporal, en producción vendría del backend
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      status: 'todo', // Por defecto va a la columna "Por hacer"
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onCreateTask(newTask);
    handleClose();
  };

  // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setTaskData({
      title: '',
      description: ''
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
  if (!isOpen) return null;

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
          <h2 className="task-modal-title">Nueva Tarea</h2>
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
            <label htmlFor="taskTitle" className="form-label">
              Título *
            </label>
            <input
              id="taskTitle"
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
            <label htmlFor="taskDescription" className="form-label">
              Descripción
            </label>
            <textarea
              id="taskDescription"
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

          {/* Fecha de creación - Solo informativa */}
          <div className="form-group">
            <label className="form-label">
              Fecha de creación
            </label>
            <input
              type="text"
              className="form-input"
              value={new Date().toLocaleDateString('es-ES')}
              disabled
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
            />
            <span className="form-helper">
              Esta fecha se asigna automáticamente
            </span>
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
              Crear Tarea
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Renderizar el modal directamente en el body
  );
};

export default CreateTaskModal;
