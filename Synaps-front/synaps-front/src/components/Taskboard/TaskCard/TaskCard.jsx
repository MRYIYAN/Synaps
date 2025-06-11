import React from 'react';
import '../Taskboard.css';

const TaskCard = ({ 
  task, 
  onDragStart, 
  onDragEnd, 
  isDragging = false,
  onEditTask,
  onDeleteTask 
}) => {
  
  // Formatear fecha de creación
  const formatDate = ( dateString ) => {
    if( !dateString ) return '';
    const date = new Date( dateString );
    return date.toLocaleDateString( 'es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const isDueSoon = ( dueDate ) => {
    if( !dueDate ) return false;
    const today = new Date();
    const due = new Date( dueDate );
    const diffTime = due - today;
    const diffDays = Math.ceil( diffTime / ( 1000 * 60 * 60 * 24 ) );
    return diffDays <= 3 && diffDays >= 0;
  };

  // Manejar inicio de arrastre
  const handleDragStart = ( e ) => {
    e.dataTransfer.setData( 'text/plain', task.task_id2 );
    e.dataTransfer.effectAllowed = 'move';
    if( onDragStart ) {
      onDragStart( task );
    }
  };

  // Manejar fin de arrastre
  const handleDragEnd = ( e ) => {
    if( onDragEnd ) {
      onDragEnd();
    }
  };

  return (
    <div
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Header de la tarjeta */}
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <div className="task-card-menu">
          <button
            className="task-menu-button"
            onClick={( e ) => {
              e.stopPropagation();
              onEditTask && onEditTask( task );
            }}
            title="Editar tarea"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.862 4.487L18.549 2.799C19.054 2.294 19.717 2 20.414 2C21.111 2 21.774 2.294 22.279 2.799C22.784 3.304 23.078 3.967 23.078 4.664C23.078 5.361 22.784 6.024 22.279 6.529L10.33 18.478C9.957 18.851 9.495 19.125 8.989 19.274L5.434 20.268C5.281 20.31 5.12 20.315 4.965 20.281C4.81 20.247 4.666 20.175 4.546 20.071C4.426 19.967 4.334 19.834 4.278 19.685C4.222 19.536 4.204 19.375 4.226 19.217L5.22 15.662C5.369 15.156 5.643 14.694 6.016 14.321L16.862 4.487Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="task-menu-button delete-button"
            onClick={( e ) => {
              e.stopPropagation();
              onDeleteTask && onDeleteTask( task );
            }}
            title="Eliminar tarea"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Descripción */}
      {task.description && (
        <p className="task-card-description">
          {task.description.length > 100 
            ? `${task.description.substring( 0, 100 )}...` 
            : task.description
          }
        </p>
      )}

      {/* Prioridad */}
      {task.priority && (
        <div className="task-card-priority">
          <span className={`priority-badge ${task.priority}`}>
            {task.priority === 'low' && 'Baja'}
            {task.priority === 'medium' && 'Media'}
            {task.priority === 'high' && 'Alta'}
          </span>
        </div>
      )}

      {/* Fecha de vencimiento */}
      {task.due_date && (
        <div className={`task-card-due ${isDueSoon( task.due_date ) ? 'due-soon' : ''}`}>
          Vence: {formatDate( task.due_date )}
        </div>
      )}

      {/* Footer de la tarjeta */}
      <div className="task-card-footer">
        <div className="task-card-date">
          Creada: {formatDate( task.created_at )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
