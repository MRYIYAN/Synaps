import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import '../../../assets/styles/TasksPanel.css';

// Componente para tareas arrastrables
const SortableTaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#ff4757';
      case 'media': return '#ffa502';
      case 'baja': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'media': return 'Media';
      case 'baja': return 'Baja';
      default: return 'Media';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-actions">
          <span 
            className="priority-indicator" 
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {getPriorityText(task.priority)}
          </span>
          <button 
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            ✏️
          </button>
          <button 
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
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
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(task.id, e.target.value);
          }}
          className="status-select"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="pendiente">Pendiente</option>
          <option value="en-progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>
      </div>
    </div>
  );
};

const TasksPanel = ({ initialFilter, showModal, onCloseModal }) => {
  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'media',
    dueDate: '',
    status: 'pendiente'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Simular carga de tareas (aquí conectarías con tu API)
  useEffect(() => {
    // Datos de ejemplo en español
    const exampleTasks = [
      {
        id: 1,
        title: 'Revisar documentación',
        description: 'Revisar y actualizar la documentación del proyecto',
        priority: 'alta',
        status: 'pendiente',
        dueDate: '2025-06-10',
        createdAt: '2025-06-05'
      },
      {
        id: 2,
        title: 'Implementar autenticación',
        description: 'Configurar sistema de login con JWT',
        priority: 'media',
        status: 'en-progreso',
        dueDate: '2025-06-08',
        createdAt: '2025-06-04'
      },
      {
        id: 3,
        title: 'Diseñar interfaz',
        description: 'Crear mockups para la nueva interfaz',
        priority: 'baja',
        status: 'completada',
        dueDate: '2025-06-05',
        createdAt: '2025-06-03'
      }
    ];
    setTasks(exampleTasks);
  }, []);

  // Abrir modal si se pasa la prop
  useEffect(() => {
    if (showModal) {
      setShowCreateModal(true);
    }
  }, [showModal]);

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, task]);
      resetForm();
      setShowCreateModal(false);
      if (onCloseModal) onCloseModal();
    }
  };

  const handleEditTask = () => {
    if (newTask.title.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...editingTask, ...newTask } : task
      ));
      resetForm();
      setEditingTask(null);
      setShowCreateModal(false);
    }
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'media',
      dueDate: '',
      status: 'pendiente'
    });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = (taskId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status
    });
    setShowCreateModal(true);
  };

  const getStatusTasks = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    const overContainer = over.data?.current?.sortable?.containerId || over.id;
    
    // Cambiar el estado de la tarea según la columna donde se soltó
    if (activeTask && overContainer !== activeTask.status) {
      let newStatus = overContainer;
      
      // Mapear IDs de contenedores a estados
      if (overContainer === 'pendiente-container') newStatus = 'pendiente';
      if (overContainer === 'en-progreso-container') newStatus = 'en-progreso';
      if (overContainer === 'completada-container') newStatus = 'completada';
      
      updateTaskStatus(activeTask.id, newStatus);
    }

    // Reordenar dentro de la misma columna
    if (active.id !== over.id && overContainer === activeTask?.status) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      setTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
    resetForm();
    if (onCloseModal) onCloseModal();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <div className="tasks-panel">
        <div className="tasks-header">
          <h2>Gestión de Tareas</h2>
          <button 
            className="add-task-btn"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowCreateModal(true);
            }}
          >
            + Añadir Tarea
          </button>
        </div>

        <div className="tasks-container">
          {/* Columna: Tus Tareas */}
          <div className="tasks-column" id="pendiente-container">
            <h3 className="column-title">Tus Tareas</h3>
            <SortableContext 
              items={getStatusTasks('pendiente').map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="tasks-list">
                {getStatusTasks('pendiente').map(task => (
                  <SortableTaskCard 
                    key={task.id} 
                    task={task}
                    onEdit={startEditTask}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                  />
                ))}
                {getStatusTasks('pendiente').length === 0 && (
                  <p className="no-tasks">No hay tareas pendientes</p>
                )}
              </div>
            </SortableContext>
          </div>

          {/* Columna: En progreso */}
          <div className="tasks-column" id="en-progreso-container">
            <h3 className="column-title">En progreso</h3>
            <SortableContext 
              items={getStatusTasks('en-progreso').map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="tasks-list">
                {getStatusTasks('en-progreso').map(task => (
                  <SortableTaskCard 
                    key={task.id} 
                    task={task}
                    onEdit={startEditTask}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                  />
                ))}
                {getStatusTasks('en-progreso').length === 0 && (
                  <p className="no-tasks">No hay tareas en progreso</p>
                )}
              </div>
            </SortableContext>
          </div>

          {/* Columna: Completadas */}
          <div className="tasks-column" id="completada-container">
            <h3 className="column-title">Completadas</h3>
            <SortableContext 
              items={getStatusTasks('completada').map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="tasks-list">
                {getStatusTasks('completada').map(task => (
                  <SortableTaskCard 
                    key={task.id} 
                    task={task}
                    onEdit={startEditTask}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                  />
                ))}
                {getStatusTasks('completada').length === 0 && (
                  <p className="no-tasks">No hay tareas completadas</p>
                )}
              </div>
            </SortableContext>
          </div>
        </div>

        {/* Overlay para mostrar la tarea siendo arrastrada */}
        <DragOverlay>
          {activeId ? (
            <div className="task-card dragging">
              {tasks.find(task => task.id === activeId)?.title}
            </div>
          ) : null}
        </DragOverlay>

        {/* Modal para crear/editar tarea */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="create-task-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
                <button 
                  className="close-btn"
                  onClick={closeModal}
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
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
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

                {editingTask && (
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={newTask.status}
                      onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en-progreso">En progreso</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button 
                  className="create-btn"
                  onClick={editingTask ? handleEditTask : handleCreateTask}
                  disabled={!newTask.title.trim()}
                >
                  {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default TasksPanel;
