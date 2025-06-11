//===========================================================================   //
//                             PANEL DE TAREAS DE SYNAPS                        //
//===========================================================================   //
//  Este componente implementa un panel organizador de tareas con tablero       //
//  Kanban drag & drop de 3 columnas.                                          //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useState } from "react"; // Importamos useState para manejar los estados
import { ReactComponent as AddTaskIcon } from "../../../assets/icons/add-board.svg"; // Icono para crear nueva tarea
import CreateTaskModal from "../../Taskboard/Modals/CreateTaskModal";
import EditTaskModal from "../../Taskboard/Modals/EditTaskModal";
import DeleteTaskModal from "../../Taskboard/Modals/DeleteTaskModal";
import TaskDetailsModal from "../../Taskboard/Modals/TaskDetailsModal";
import KanbanBoard from "../../Taskboard/KanbanBoard/KanbanBoard";
import TaskList from "../../Taskboard/TaskList/TaskList";
import "../../Taskboard/Taskboard.css";
//===========================================================================//

//===========================================================================//
//                             COMPONENTE LISTTODOPANEL                     //
//===========================================================================//
const ListTodoPanel = ({ viewType = "kanban" }) => {
  // Este componente implementa un sistema completo de gestión de tareas
  // viewType: "kanban" para vista de tablero completo, "list" para vista de lista en sidebar

  //---------------------------------------------------------------------------//
  //  Estados para manejar la interfaz                                        //
  //---------------------------------------------------------------------------//
  // Estado para controlar la visibilidad del modal de crear tarea
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Estado para controlar la visibilidad del modal de editar tarea
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estado para controlar la visibilidad del modal de eliminar tarea
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estado para controlar la visibilidad del modal de detalles de tarea
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estado para almacenar la tarea que se está editando/eliminando/viendo
  const [selectedTask, setSelectedTask] = useState(null);

  // Estado para almacenar todas las tareas
  const [tasks, setTasks] = useState([
    // Datos de ejemplo para desarrollo
    {
      id: 1,
      title: "Diseñar interfaz de usuario",
      description: "Crear mockups y wireframes para la nueva funcionalidad",
      status: "todo",
      createdAt: "2025-06-11T10:00:00Z",
      updatedAt: "2025-06-11T10:00:00Z"
    },
    {
      id: 2,
      title: "Implementar API REST",
      description: "Desarrollar endpoints para CRUD de tareas",
      status: "in-progress",
      createdAt: "2025-06-11T11:00:00Z",
      updatedAt: "2025-06-11T11:00:00Z"
    },
    {
      id: 3,
      title: "Configurar base de datos",
      description: "Configurar esquemas y migraciones",
      status: "done",
      createdAt: "2025-06-10T09:00:00Z",
      updatedAt: "2025-06-11T09:00:00Z"
    }
  ]);

  //---------------------------------------------------------------------------//
  //  Handlers para manejar interacciones del usuario                         //
  //---------------------------------------------------------------------------//
  // Función para abrir el modal de crear tarea
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  // Función para cerrar el modal de crear tarea
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  // Función para crear una nueva tarea
  const handleCreateTask = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    console.log("Nueva tarea creada:", newTask);
    // TODO: Aquí se enviaría la tarea al backend
  };

  // Función para actualizar una tarea (cambiar estado, etc.)
  const handleUpdateTask = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    console.log("Tarea actualizada:", updatedTask);
    // TODO: Aquí se enviaría la actualización al backend
  };

  // Función para eliminar una tarea
  const handleDeleteTask = (taskId) => {
    // Buscar la tarea para mostrarla en el modal de confirmación
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (taskToDelete) {
      setSelectedTask(taskToDelete);
      setShowDeleteModal(true);
    }
  };

  // Función para confirmar eliminación de tarea (desde el modal)
  const handleConfirmDeleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    console.log("Tarea eliminada:", taskId);
    setShowDeleteModal(false);
    setSelectedTask(null);
    // TODO: Aquí se enviaría la eliminación al backend
  };

  // Función para editar una tarea (abrir modal de edición)
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  // Función para guardar cambios de edición de tarea
  const handleSaveEditTask = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    console.log("Tarea editada:", updatedTask);
    setShowEditModal(false);
    setSelectedTask(null);
    // TODO: Aquí se enviaría la actualización al backend
  };

  // Función para cerrar modales
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedTask(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTask(null);
  };

  // Función para manejar clics en tareas de la lista (para vista de sidebar)
  const handleTaskClick = (task) => {
    if (viewType === "list") {
      // En vista de lista, al hacer clic se abre el modal de detalles
      setSelectedTask(task);
      setShowDetailsModal(true);
    }
  };

  //---------------------------------------------------------------------------//
  //  Renderizado del componente ListTodoPanel                                //
  //---------------------------------------------------------------------------//
  return (
    <div className={`search-panel task-panel ${viewType === "list" ? "task-panel-sidebar" : "task-panel-full"}`}>
      {/* Renderizado condicional basado en el tipo de vista */}
      {viewType === "list" ? (
        // Vista de lista para sidebar
        <TaskList
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onCreateTask={handleOpenCreateModal}
        />
      ) : (
        // Vista de tablero Kanban para página completa
        <KanbanBoard
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
        />
      )}

      {/* Modal para crear nueva tarea (común a ambas vistas) */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onCreateTask={handleCreateTask}
      />

      {/* Modal para editar tarea */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onEditTask={handleSaveEditTask}
        task={selectedTask}
      />

      {/* Modal para eliminar tarea */}
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onDeleteTask={handleConfirmDeleteTask}
        task={selectedTask}
      />

      {/* Modal para ver detalles de tarea */}
      <TaskDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        task={selectedTask}
      />
    </div>
  );
};

export default ListTodoPanel;