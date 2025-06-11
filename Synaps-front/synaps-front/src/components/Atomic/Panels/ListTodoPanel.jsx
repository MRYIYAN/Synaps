//===========================================================================   //
//                             PANEL DE TAREAS DE SYNAPS                        //
//===========================================================================   //
//  Este componente implementa un panel organizador de tareas con tablero       //
//  Kanban drag & drop de 3 columnas. Integrado con la API backend.            //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useState, useEffect } from "react"; 
import CreateTaskModal from "../../Taskboard/Modals/CreateTaskModal";
import EditTaskModal from "../../Taskboard/Modals/EditTaskModal";
import DeleteTaskModal from "../../Taskboard/Modals/DeleteTaskModal";
import TaskDetailsModal from "../../Taskboard/Modals/TaskDetailsModal";
import KanbanBoard from "../../Taskboard/KanbanBoard/KanbanBoard";
import TaskList from "../../Taskboard/TaskList/TaskList";
import useTasks from "../../../hooks/useTasks";
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
  const [showCreateModal, setShowCreateModal] = useState( false );
  const [showEditModal, setShowEditModal] = useState( false );
  const [showDeleteModal, setShowDeleteModal] = useState( false );
  const [showDetailsModal, setShowDetailsModal] = useState( false );
  const [selectedTask, setSelectedTask] = useState( null );
  const [currentVaultId, setCurrentVaultId] = useState( null );

  //---------------------------------------------------------------------------//
  //  Hook personalizado para gestión de tareas                               //
  //---------------------------------------------------------------------------//
  const {
    tasks,
    loading,
    error,
    stats,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    clearError,
    fetchTasks
  } = useTasks(currentVaultId);

  // Exponer función loadTasks globalmente y cargar tareas automáticamente
  useEffect( () => {
    window.loadTasks = async( vaultId ) => {
      if( vaultId && typeof vaultId === 'number' && vaultId > 0 ) {
        try {
          await fetchTasks();
        } catch( error ) {
          // Error handling without console.log
        }
      }
    };

    // Cargar tareas iniciales si hay vault actual
    if( currentVaultId && typeof currentVaultId === 'number' && currentVaultId > 0 ) {
      fetchTasks();
    }

    return () => {
      delete window.loadTasks;
    };
  }, [fetchTasks, currentVaultId]);

  //---------------------------------------------------------------------------//
  //  Efectos para sincronización con vault global                            //
  //---------------------------------------------------------------------------//
  useEffect( () => {
    // Obtener el vault ID actual desde el contexto global
    const getCurrentVaultId = () => {
      return window.currentVaultId || null;
    };

    // Inicializar con vault actual
    setCurrentVaultId( getCurrentVaultId() );

    // Escuchar cambios de vault
    const handleVaultChange = () => {
      const newVaultId = getCurrentVaultId();
      setCurrentVaultId( newVaultId );
      if( error ) clearError(); // Limpiar errores al cambiar vault
      
      // Cargar tareas para el nuevo vault
      if( newVaultId && typeof newVaultId === 'number' && newVaultId > 0 ) {
        fetchTasks();
      }
    };

    window.addEventListener( 'vaultChanged', handleVaultChange );
    
    return () => {
      window.removeEventListener( 'vaultChanged', handleVaultChange );
    };
  }, [error, clearError, fetchTasks]);

  //---------------------------------------------------------------------------//
  //  Handlers para manejar interacciones del usuario                         //
  //---------------------------------------------------------------------------//
  
  // Función para abrir el modal de crear tarea
  const handleOpenCreateModal = () => {
    setShowCreateModal( true );
  };

  // Función para cerrar el modal de crear tarea
  const handleCloseCreateModal = () => {
    setShowCreateModal( false );
  };

  // Función para crear una nueva tarea
  const handleCreateTask = async( newTaskData ) => {
    try {
      const result = await createTask( newTaskData );
      if( result.success ) {
        // El estado se actualiza automáticamente a través del hook
        handleCloseCreateModal();
        
        // Mostrar notificación de éxito
        if( window.showNotification ) {
          window.showNotification({
            type: 'success',
            title: 'Tarea creada',
            message: `"${result.task.title}" se ha añadido a la columna "Por Hacer"`,
            duration: 3000
          });
        }
      }
    } catch( err ) {
      // Error handling without console.log
    }
  };

  // Función para actualizar una tarea (cambiar estado, etc.)
  const handleUpdateTask = async( updatedTask ) => {
    try {
      const result = await updateTask( updatedTask.task_id2, updatedTask );
      if( result.success ) {
        // Mostrar notificación si cambió el estado
        if( updatedTask.status && window.showNotification ) {
          const statusNames = {
            'todo': 'Por Hacer',
            'in-progress': 'En Progreso', 
            'done': 'Completada'
          };
          
          window.showNotification({
            type: 'success',
            title: 'Tarea actualizada',
            message: `"${result.task.title}" → ${statusNames[updatedTask.status]}`,
            duration: 3000
          });
        }
      }
    } catch( err ) {
      // Error handling without console.log
    }
  };

  // Función para eliminar una tarea
  const handleDeleteTask = ( task ) => {
    if( !task || !task.task_id2 ) {
      if( window.showNotification ) {
        window.showNotification({
          type: 'error',
          title: 'Error',
          message: 'La tarea seleccionada no es válida',
          duration: 5000
        });
      }
      return;
    }
    
    setSelectedTask( task );
    setShowDeleteModal( true );
  };

  // Función para confirmar eliminación de tarea (desde el modal)
  const handleConfirmDeleteTask = async( taskId2 ) => {
    try {
      // Buscar la tarea a eliminar para obtener información adicional
      const taskToDelete = tasks.find( task => task.task_id2 === taskId2 );
      
      const result = await deleteTask( taskId2 );
      
      if( result.success ) {
        setShowDeleteModal( false );
        setSelectedTask( null );
        
        // Mostrar notificación de éxito con información específica
        if( window.showNotification ) {
          window.showNotification({
            type: 'success',
            title: 'Tarea eliminada',
            message: taskToDelete 
              ? `"${taskToDelete.title}" ha sido eliminada correctamente`
              : 'La tarea ha sido eliminada correctamente',
            duration: 3000
          });
        }
        
        return { success: true };
      } else {
        // Mostrar notificación de error
        if( window.showNotification ) {
          window.showNotification({
            type: 'error',
            title: 'Error al eliminar',
            message: result.message || 'No se pudo eliminar la tarea',
            duration: 5000
          });
        }
        
        return { success: false, message: result.message };
      }
    } catch( err ) {
      // Mostrar notificación de error
      if( window.showNotification ) {
        window.showNotification({
          type: 'error',
          title: 'Error de conexión',
          message: 'No se pudo conectar con el servidor para eliminar la tarea',
          duration: 5000
        });
      }
      
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Función para editar una tarea (abrir modal de edición)
  const handleEditTask = ( task ) => {
    setSelectedTask( task );
    setShowEditModal( true );
  };

  // Función para guardar cambios de edición de tarea
  const handleSaveEditTask = async( taskId2, updateData ) => {
    try {
      const result = await updateTask( taskId2, updateData );
      if( result.success ) {
        setShowEditModal( false );
        setSelectedTask( null );
        
        // Mostrar notificación de éxito
        if( window.showNotification ) {
          window.showNotification({
            type: 'success',
            title: 'Tarea guardada',
            message: `Los cambios en "${result.task.title}" se han guardado`,
            duration: 3000
          });
        }
        
        return result;
      }
    } catch( err ) {
      throw err;
    }
  };

  // Función para cerrar modales
  const handleCloseEditModal = () => {
    setShowEditModal( false );
    setSelectedTask( null );
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal( false );
    setSelectedTask( null );
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal( false );
    setSelectedTask( null );
  };

  // Función para manejar clics en tareas de la lista (para vista de sidebar)
  const handleTaskClick = ( task ) => {
    if( viewType === "list" ) {
      setSelectedTask( task );
      setShowDetailsModal( true );
    }
  };

  //---------------------------------------------------------------------------//
  //  Renderizado del componente ListTodoPanel                                //
  //---------------------------------------------------------------------------//
  
  // Mostrar mensaje si no hay vault seleccionado
  if( !currentVaultId ) {
    return (
      <div className={`search-panel task-panel ${viewType === "list" ? "task-panel-sidebar" : "task-panel-full"}`}>
        <div className="task-panel-empty-state">
          <p>Selecciona un vault para ver las tareas</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de carga
  if( loading && tasks.length === 0 ) {
    return (
      <div className={`search-panel task-panel ${viewType === "list" ? "task-panel-sidebar" : "task-panel-full"}`}>
        <div className="task-panel-loading">
          <p>Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`search-panel task-panel ${viewType === "list" ? "task-panel-sidebar" : "task-panel-full"}`}>
      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="task-panel-error">
          <p>Error: {error}</p>
          <button onClick={clearError} className="error-dismiss-btn">
            Cerrar
          </button>
        </div>
      )}

      {/* Renderizado condicional basado en el tipo de vista */}
      {viewType === "list" ? (
        // Vista de lista para sidebar
        <TaskList
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onCreateTask={handleOpenCreateModal}
          loading={loading}
          stats={stats}
        />
      ) : (
        // Vista de tablero Kanban para página completa
        <KanbanBoard
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          onChangeTaskStatus={changeTaskStatus}
          loading={loading}
          stats={stats}
        />
      )}

      {/* Modal para crear nueva tarea (común a ambas vistas) */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onCreateTask={handleCreateTask}
        currentVaultId={currentVaultId}
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
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onUpdateStatus={handleUpdateTask}
      />
    </div>
  );
};

export default ListTodoPanel;