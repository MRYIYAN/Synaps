import React from 'react';
import '../Taskboard.css';

const TaskList = ({ tasks, onTaskClick, onCreateTask }) => {
  
  // Ordenar tareas: primero las no completadas, luego por fecha de creación
  const sortedTasks = [...tasks].sort((a, b) => {
    // Primero por estado (done al final)
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    
    // Luego por fecha de creación (más recientes primero)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="task-list-container">
      {/* Botón para crear nueva tarea */}
      <div className="task-list-header">
        <button 
          className="lava-button"
          onClick={onCreateTask}
          aria-label="Crear nueva tarea"
          title="Crear nueva tarea"
        >
          <span className="button-text">Nueva Tarea</span>
        </button>
      </div>

      {/* Lista de tareas - Vista Minimalista */}
      <div className="task-list">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <div
              key={task.id}
              className={`task-list-item-minimal ${task.status}`}
              onClick={() => onTaskClick && onTaskClick(task)}
            >
              <span className="task-title-minimal">
                {task.title}
              </span>
            </div>
          ))
        ) : (
          <div className="task-list-empty">
            <p className="task-list-empty-text">Sin tareas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
