import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../assets/styles/TaskListPanel.css';

const TaskListPanel = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskList, setSelectedTaskList] = useState(null);

  // Simular carga de tareas (aquí conectarías con tu API)
  useEffect(() => {
    // Datos de ejemplo
    const exampleTasks = [
      {
        id: 1,
        title: 'Revisar documentación',
        description: 'Revisar y actualizar la documentación del proyecto',
        priority: 'high',
        status: 'pending',
        dueDate: '2025-06-10',
        createdAt: '2025-06-05'
      },
      {
        id: 2,
        title: 'Implementar autenticación',
        description: 'Configurar sistema de login con JWT',
        priority: 'medium',
        status: 'in-progress',
        dueDate: '2025-06-08',
        createdAt: '2025-06-04'
      },
      {
        id: 3,
        title: 'Diseñar interfaz',
        description: 'Crear mockups para la nueva interfaz',
        priority: 'low',
        status: 'completed',
        dueDate: '2025-06-05',
        createdAt: '2025-06-03'
      }
    ];
    setTasks(exampleTasks);
  }, []);

  const getStatusTasks = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskListClick = (listType) => {
    setSelectedTaskList(listType);
    // Redirigir a la página de tareas completa usando React Router
    navigate(`/todo?filter=${listType}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  return (
    <div className="task-list-panel">
      <div className="task-list-header">
        <h3>Tareas</h3>
        <button 
          className="add-task-btn-small"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/todo?action=create');
          }}
        >
          +
        </button>
      </div>

      <div className="task-lists">
        {/* Tus Tareas */}
        <div 
          className={`task-list-item ${selectedTaskList === 'pending' ? 'selected' : ''}`}
          onClick={() => handleTaskListClick('pending')}
        >
          <div className="task-list-info">
            <span className="task-list-name">Tus Tareas</span>
            <span className="task-count">{getStatusTasks('pending').length}</span>
          </div>
          <div className="task-preview">
            {getStatusTasks('pending').slice(0, 2).map(task => (
              <div key={task.id} className="task-mini">
                <span 
                  className="task-priority-dot"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                ></span>
                <span className="task-mini-title">{task.title}</span>
              </div>
            ))}
            {getStatusTasks('pending').length === 0 && (
              <span className="no-tasks-mini">Sin tareas</span>
            )}
          </div>
        </div>

        {/* En progreso */}
        <div 
          className={`task-list-item ${selectedTaskList === 'in-progress' ? 'selected' : ''}`}
          onClick={() => handleTaskListClick('in-progress')}
        >
          <div className="task-list-info">
            <span className="task-list-name">En progreso</span>
            <span className="task-count">{getStatusTasks('in-progress').length}</span>
          </div>
          <div className="task-preview">
            {getStatusTasks('in-progress').slice(0, 2).map(task => (
              <div key={task.id} className="task-mini">
                <span 
                  className="task-priority-dot"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                ></span>
                <span className="task-mini-title">{task.title}</span>
              </div>
            ))}
            {getStatusTasks('in-progress').length === 0 && (
              <span className="no-tasks-mini">Sin tareas</span>
            )}
          </div>
        </div>

        {/* Completadas */}
        <div 
          className={`task-list-item ${selectedTaskList === 'completed' ? 'selected' : ''}`}
          onClick={() => handleTaskListClick('completed')}
        >
          <div className="task-list-info">
            <span className="task-list-name">Completadas</span>
            <span className="task-count">{getStatusTasks('completed').length}</span>
          </div>
          <div className="task-preview">
            {getStatusTasks('completed').slice(0, 2).map(task => (
              <div key={task.id} className="task-mini">
                <span 
                  className="task-priority-dot"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                ></span>
                <span className="task-mini-title">{task.title}</span>
              </div>
            ))}
            {getStatusTasks('completed').length === 0 && (
              <span className="no-tasks-mini">Sin tareas</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskListPanel;
