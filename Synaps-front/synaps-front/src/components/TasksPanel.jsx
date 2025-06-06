import React, { useState, useEffect } from 'react';
import '../assets/styles/TasksPanel.css';

const TasksPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });

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

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        status: 'pending'
      });
      setShowCreateModal(false);
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getStatusTasks = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const TaskCard = ({ task }) => (
    <div className="task-card">
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-actions">
          <span 
            className="priority-indicator" 
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
          <button 
            className="delete-btn"
            onClick={() => deleteTask(task.id)}
          >
            ×
          </button>
        </div>
      </div>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      <div className="task-footer">
        <span className="task-date">{task.dueDate}</span>
        <select 
          value={task.status}
          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
          className="status-select"
        >
          <option value="pending">Pendiente</option>
          <option value="in-progress">En progreso</option>
          <option value="completed">Completada</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="tasks-panel">
      <div className="tasks-header">
        <h2>Gestión de Tareas</h2>
        <button 
          className="add-task-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Añadir Tarea
        </button>
      </div>

      <div className="tasks-container">
        <div className="tasks-column">
          <h3 className="column-title">Tus Tareas</h3>
          <div className="tasks-list">
            {getStatusTasks('pending').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {getStatusTasks('pending').length === 0 && (
              <p className="no-tasks">No hay tareas pendientes</p>
            )}
          </div>
        </div>

        <div className="tasks-column">
          <h3 className="column-title">En progreso</h3>
          <div className="tasks-list">
            {getStatusTasks('in-progress').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {getStatusTasks('in-progress').length === 0 && (
              <p className="no-tasks">No hay tareas en progreso</p>
            )}
          </div>
        </div>

        <div className="tasks-column">
          <h3 className="column-title">Completadas</h3>
          <div className="tasks-list">
            {getStatusTasks('completed').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {getStatusTasks('completed').length === 0 && (
              <p className="no-tasks">No hay tareas completadas</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear nueva tarea */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="create-task-modal">
            <div className="modal-header">
              <h3>Nueva Tarea</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Ingresa el título de la tarea"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Describe la tarea (opcional)"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prioridad</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha límite</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
              >
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPanel;
