import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../Taskboard.css';

const CreateTaskModal = ( { isOpen, onClose, onCreateTask, currentVaultId } ) => {

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    return new Date().toISOString().split( 'T' )[0];
  };

  const [taskData, setTaskData] = useState( {
    title: '',
    description: '',
    priority: 'medium',
    due_date: getCurrentDate() // Establecer fecha actual por defecto
  } );

  const [errors, setErrors] = useState( {} );
  const [isSubmitting, setIsSubmitting] = useState( false );

  // Manejar cambios en los inputs
  const handleInputChange = ( e ) => {
    const { name, value } = e.target;
    setTaskData( prev => ( {
      ...prev,
      [name]: value
    } ) );
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if( errors[name] ) {
      setErrors( prev => ( {
        ...prev,
        [name]: ''
      } ) );
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if( !taskData.title.trim() ) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if( taskData.title.length > 255 ) {
      newErrors.title = 'El título no puede tener más de 255 caracteres';
    }
    
    if( taskData.description.length > 1000 ) {
      newErrors.description = 'La descripción no puede tener más de 1000 caracteres';
    }

    if( !currentVaultId ) {
      newErrors.general = 'Debe seleccionar un vault antes de crear una tarea';
    }
    
    setErrors( newErrors );
    return Object.keys( newErrors ).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async( e ) => {
    e.preventDefault();
    
    if( !validateForm() ) {
      return;
    }
    
    setIsSubmitting( true );
    
    try {
      // Preparar datos para enviar al backend
      const newTaskData = {
        title: taskData.title.trim(),
        priority: taskData.priority,
        vault_id: currentVaultId,
        due_date: taskData.due_date || null,
        status: 'todo' // Establecer explícitamente el estado
      };

      // Solo incluir descripción si tiene contenido
      if( taskData.description.trim() ) {
        newTaskData.description = taskData.description.trim();
      }
      
      await onCreateTask( newTaskData );
      handleClose();
    } catch( error ) {
      setErrors( { general: 'Error al crear la tarea. Inténtelo de nuevo.' } );
    } finally {
      setIsSubmitting( false );
    }
  };

  // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setTaskData( {
      title: '',
      description: '',
      priority: 'medium',
      due_date: getCurrentDate()
    } );
    setErrors( {} );
    setIsSubmitting(false);
    onClose();
  };

  // Manejar tecla Escape
  const handleKeyDown = ( e ) => {
    if( e.key === 'Escape' ) {
      handleClose();
    }
  };

  // No renderizar si el modal no está abierto
  if( !isOpen ) return null;

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
        onClick={( e ) => e.stopPropagation()}
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
          {/* Error general */}
          {errors.general && (
            <div className="form-error-general">
              {errors.general}
            </div>
          )}

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

          {/* Prioridad */}
          <div className="form-group">
            <label htmlFor="taskPriority" className="form-label">
              Prioridad
            </label>
            <select
              id="taskPriority"
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
            <label htmlFor="taskDueDate" className="form-label">
              Fecha de vencimiento
            </label>
            <input
              id="taskDueDate"
              name="due_date"
              type="date"
              className="form-input"
              value={taskData.due_date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
            />
          </div>

          {/* Estado - Solo informativo */}
          <div className="form-group">
            <label className="form-label">Estado inicial</label>
            <div className="form-info">
              <span className="status-badge status-todo">Por Hacer</span>
              <span className="form-helper">
                Las nuevas tareas se añaden automáticamente a la columna "Por Hacer"
              </span>
            </div>
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
              disabled={!taskData.title.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Renderizar el modal directamente en el body
  );
};

export default CreateTaskModal;
