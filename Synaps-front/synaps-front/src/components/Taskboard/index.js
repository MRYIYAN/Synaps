// ==========================================================================
// TASKBOARD COMPONENTS INDEX
// ==========================================================================
// Archivo de índice para exportar todos los componentes del sistema de tareas

export { default as CreateTaskModal } from './Modals/CreateTaskModal';
export { default as EditTaskModal } from './Modals/EditTaskModal';
export { default as DeleteTaskModal } from './Modals/DeleteTaskModal';
export { default as KanbanBoard } from './KanbanBoard/KanbanBoard';
export { default as TaskCard } from './TaskCard/TaskCard';
export { default as TaskList } from './TaskList/TaskList';

// También podríamos exportar constantes útiles
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
};

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta'
};

export const STATUS_LABELS = {
  todo: 'Por Hacer',
  'in-progress': 'En Progreso',
  done: 'Completadas'
};
