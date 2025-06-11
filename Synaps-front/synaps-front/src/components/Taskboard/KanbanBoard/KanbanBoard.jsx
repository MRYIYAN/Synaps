import React, { useState, useCallback } from 'react';
import TaskCard from '../TaskCard/TaskCard';
import '../Taskboard.css';

const KanbanBoard = ({ tasks, onUpdateTask, onDeleteTask, onEditTask }) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Definir las columnas del tablero
  const columns = [
    {
      id: 'todo',
      title: 'Por Hacer',
      status: 'todo',
      className: 'todo'
    },
    {
      id: 'in-progress',
      title: 'En Progreso',
      status: 'in-progress',
      className: 'in-progress'
    },
    {
      id: 'done',
      title: 'Completadas',
      status: 'done',
      className: 'done'
    }
  ];

  // Filtrar tareas por estado
  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  // Manejar inicio de arrastre
  const handleDragStart = useCallback((task) => {
    setDraggedTask(task);
  }, []);

  // Manejar fin de arrastre
  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverColumn(null);
  }, []);

  // Manejar drag over en columna
  const handleDragOver = useCallback((e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnStatus);
  }, []);

  // Manejar drag leave en columna
  const handleDragLeave = useCallback((e) => {
    // Solo limpiar si realmente salimos de la columna
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  }, []);

  // Manejar drop en columna
  const handleDrop = useCallback((e, newStatus) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      setDragOverColumn(null);
      return;
    }

    // Actualizar el estado de la tarea
    const updatedTask = {
      ...draggedTask,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    onUpdateTask(updatedTask);
    setDraggedTask(null);
    setDragOverColumn(null);
  }, [draggedTask, onUpdateTask]);

  // Renderizar una columna
  const renderColumn = (column) => {
    const columnTasks = getTasksByStatus(column.status);
    const isDragOver = dragOverColumn === column.status;

    return (
      <div
        key={column.id}
        className={`kanban-column ${column.className} ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => handleDragOver(e, column.status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, column.status)}
      >
        {/* Header de la columna */}
        <div className="kanban-column-header">
          <h3 className="kanban-column-title">
            {column.title}
          </h3>
          <span className="kanban-column-count">
            {columnTasks.length}
          </span>
        </div>

        {/* Lista de tareas */}
        <div className="kanban-tasks">
          {columnTasks.length > 0 ? (
            columnTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isDragging={draggedTask?.id === task.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          ) : (
            <div className="kanban-empty">
              <div className="kanban-empty-icon">
                {/* Iconos sin emojis */}
              </div>
              <p className="kanban-empty-text">
                {column.status === 'todo' && 'No hay tareas pendientes'}
                {column.status === 'in-progress' && 'No hay tareas en progreso'}
                {column.status === 'done' && 'No hay tareas completadas'}
              </p>
            </div>
          )}
        </div>

        {/* Indicador de drop zone cuando se arrastra */}
        {draggedTask && draggedTask.status !== column.status && (
          <div className={`drop-zone ${isDragOver ? 'active' : ''}`}>
            <p>Suelta aquí para mover a "{column.title}"</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="kanban-container">
      <div className="kanban-board">
        {columns.map(renderColumn)}
      </div>
    </div>
  );
};

export default KanbanBoard;
