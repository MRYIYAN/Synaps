import React, { useState, useCallback } from 'react';
import TaskCard from '../TaskCard/TaskCard';
import '../Taskboard.css';

const KanbanBoard = ({ tasks, onUpdateTask, onDeleteTask, onEditTask, onChangeTaskStatus } ) => {
  const [draggedTask, setDraggedTask] = useState( null );
  const [dragOverColumn, setDragOverColumn] = useState( null );

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

  // Filtrar tareas por estado - Las nuevas tareas aparecen automáticamente en "Por Hacer" ( todo)
  const getTasksByStatus = useCallback( (status ) => {
    const filteredTasks = tasks.filter( task => task.status === status );
    
    return filteredTasks;
  }, [tasks]);

  // Manejar inicio de arrastre
  const handleDragStart = useCallback( ( task ) => {
    setDraggedTask( task );
  }, []);

  // Manejar fin de arrastre
  const handleDragEnd = useCallback( () => {
    setDraggedTask( null );
    setDragOverColumn( null );
  }, []);

  // Manejar drag over en columna
  const handleDragOver = useCallback( ( e, columnStatus ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn( columnStatus );
  }, []);

  // Manejar drag leave en columna
  const handleDragLeave = useCallback( ( e) => {
    // Solo limpiar si realmente salimos de la columna
    if(!e.currentTarget.contains( e.relatedTarget)) {
      setDragOverColumn( null );
    }
  }, []);

  // Manejar drop en columna
  const handleDrop = useCallback(async ( e, newStatus ) => {
    e.preventDefault();
    
    if(!draggedTask || draggedTask.status === newStatus ) {
      setDraggedTask( null );
      setDragOverColumn( null );
      return;
    }

    try {
      // Usar la función específica para cambiar estado si está disponible
      if(onChangeTaskStatus ) {
        await onChangeTaskStatus( draggedTask.task_id2, newStatus );
      } else if(onUpdateTask ) {
        // Fallback al método de actualización general
        await onUpdateTask( draggedTask.task_id2, { status: newStatus } );
      }
    } catch ( error ) {
      console.error( 'Error al cambiar estado de tarea:', error );
    } finally {
      setDraggedTask( null );
      setDragOverColumn( null );
    }
  }, [draggedTask, onUpdateTask, onChangeTaskStatus]);

  // Renderizar una columna
  const renderColumn = ( column) => {
    const columnTasks = getTasksByStatus( column.status );
    const isDragOver = dragOverColumn === column.status;

    return (
      <div
        key={column.id}
        className={`kanban-column ${column.className} ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={( e) => handleDragOver( e, column.status )}
        onDragLeave={handleDragLeave}
        onDrop={( e) => handleDrop( e, column.status )}
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
            columnTasks.map( task => (
              <TaskCard
                key={task.task_id2}
                task={task}
                isDragging={draggedTask?.task_id2 === task.task_id2}
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
