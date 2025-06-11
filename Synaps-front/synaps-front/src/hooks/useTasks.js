// ===========================================================================
// HOOK PERSONALIZADO PARA GESTIÓN DE TAREAS
// ===========================================================================
// Este hook maneja todas las operaciones CRUD del sistema de tareas,
// incluyendo: crear, listar, actualizar, eliminar y estadísticas.
// ===========================================================================

import { useState, useCallback } from 'react';
import { http_get, http_post, http_put, http_delete } from '../lib/http';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8010/api';


const useTasks = (vaultId = null) => {
  // Estados para manejar tareas y UI
  const [tasks, setTasks] = useState( [] );
  const [loading, setLoading] = useState( false );
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
    highPriority: 0,
    completionRate: 0
  });

  // Función para obtener estadísticas de tareas
  const fetchStats = useCallback( async() => {
    // Validar que vaultId sea un número válido
    if(!vaultId || typeof vaultId !== 'number' || vaultId <= 0) {
      return;
    }
    
    try {
      const response = await http_get( `${API_BASE_URL}/tasks/stats`, {
        vault_id: vaultId
      });
      
      if(response.result === 1) {
        setStats(response.http_data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching task stats:', err);
    }
  }, [vaultId]);

  // Función para obtener todas las tareas
  const fetchTasks = useCallback( async( filters = {}) => {
    // Validar que vaultId sea un número válido
    if(!vaultId || typeof vaultId !== 'number' || vaultId <= 0) {
      return;
    }
    
    setLoading(true );
    setError(null);
    
    try {
      const params = {
        vault_id: vaultId,
        ...filters
      };
      
      const response = await http_get( `${API_BASE_URL}/tasks`, params);
      
      if(response.result === 1) {
        setTasks(response.http_data.tasks || []);
      } else {
        setError(response.message || 'Error al cargar las tareas');
      }
    } catch (err) {
      setError('Error de conexión al cargar las tareas');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading( false );
    }
  }, [vaultId]);

  // Función para crear una nueva tarea
  const createTask = useCallback( async(taskData ) => {
    // Inicializar value con valor por defecto
    let value = { success: false, message: '' };
    
    if( !vaultId ) {
      value = { success: false, message: 'Vault ID requerido' };
      return value;
    }
    
    setLoading( true );
    setError( null );
    
    try {
      // Preparar los datos asegurando que siempre se cree en estado 'todo'
      const dataToSend = {
        ...taskData,
        vault_id: vaultId,
        status: 'todo' // Siempre se crea en estado 'todo' - "Por Hacer"
      };
      
      const response = await http_post( `${API_BASE_URL}/tasks`, dataToSend );
      
      if( response.result === 1 ) {
        const newTask = response.http_data.task;
        
        // Asegurar que la nueva tarea tenga el estado correcto y campos necesarios
        const taskWithCorrectStatus = {
          ...newTask,
          status: 'todo', // Forzar estado 'todo' para garantizar que aparezca en "Por Hacer"
          vault_id: vaultId, // Asegurar vault_id
          created_at: newTask.created_at || new Date().toISOString()
        };
        
        // Añadir al principio de la lista para que aparezca arriba en el Kanban
        setTasks( prevTasks => [taskWithCorrectStatus, ...prevTasks] );
        
        // Actualizar estadísticas localmente
        setStats( prevStats => ({
          ...prevStats,
          total: prevStats.total + 1,
          todo: prevStats.todo + 1
        }) );
        
        value = { success: true, task: taskWithCorrectStatus };
      } else {
        setError( response.message || 'Error al crear la tarea' );
        value = { success: false, message: response.message };
      }
    } catch( err ) {
      const errorMessage = 'Error de conexión al crear la tarea';
      setError( errorMessage );
      value = { success: false, message: errorMessage };
    } finally {
      setLoading( false );
    }
    
    return value;
  }, [vaultId]);

  // Función para actualizar una tarea existente
  const updateTask = useCallback( async(taskId2, updateData ) => {
    // Inicializar value con valor por defecto
    let value = { success: false, message: '' };
    
    setLoading( true );
    setError( null );
    
    try {
      const response = await http_put( `${API_BASE_URL}/tasks/${taskId2}`, updateData );
      
      if( response.result === 1 ) {
        const updatedTask = response.http_data.task;
        setTasks( prevTasks => 
          prevTasks.map( task => 
            task.task_id2 === taskId2 ? updatedTask : task
          )
        );
        
        value = { success: true, task: updatedTask };
      } else {
        setError( response.message || 'Error al actualizar la tarea' );
        value = { success: false, message: response.message };
      }
    } catch( err ) {
      const errorMessage = 'Error de conexión al actualizar la tarea';
      setError( errorMessage );
      value = { success: false, message: errorMessage };
    } finally {
      setLoading( false );
    }
    
    return value;
  }, []);

  // Función para eliminar una tarea
  const deleteTask = useCallback( async(taskId2) => {
    // Inicializar value con valor por defecto
    let value = { success: false, message: '' };
    
    if( !taskId2 ) {
      const errorMessage = 'ID de tarea requerido para eliminación';
      setError( errorMessage );
      value = { success: false, message: errorMessage };
      return value;
    }

    setLoading( true );
    setError( null );
    
    try {
      const response = await http_delete( `${API_BASE_URL}/tasks/${taskId2}` );
      
      if( response.result === 1 ) {
        // Eliminar la tarea del estado local inmediatamente
        setTasks( prevTasks => {
          const filteredTasks = prevTasks.filter( task => task.task_id2 !== taskId2 );
          return filteredTasks;
        } );
        
        // Actualizar estadísticas localmente según el estado de la tarea eliminada
        const deletedTask = tasks.find( task => task.task_id2 === taskId2 );
        if( deletedTask ) {
          setStats( prevStats => {
            const newStats = {
              ...prevStats,
              total: Math.max( 0, prevStats.total - 1 )
            };
            
            // Decrementar el contador específico del estado
            if( deletedTask.status === 'todo' ) {
              newStats.todo = Math.max( 0, prevStats.todo - 1 );
            } else if( deletedTask.status === 'in-progress' ) {
              newStats.inProgress = Math.max( 0, prevStats.inProgress - 1 );
            } else if( deletedTask.status === 'done' ) {
              newStats.done = Math.max( 0, prevStats.done - 1 );
            }
            
            return newStats;
          } );
        }
        
        value = { success: true };
      } else {
        const errorMessage = response.message || 'Error al eliminar la tarea';
        setError( errorMessage );
        value = { success: false, message: errorMessage };
      }
    } catch( err ) {
      const errorMessage = 'Error de conexión al eliminar la tarea';
      setError( errorMessage );
      value = { success: false, message: errorMessage };
    } finally {
      setLoading( false );
    }
    
    return value;
  }, [tasks]);

  // Función para cambiar el estado de una tarea (todo, in-progress, done )
  const changeTaskStatus = useCallback( async( taskId2, newStatus ) => {
    return await updateTask( taskId2, { status: newStatus } );
  }, [updateTask]);

  // Función para marcar tarea como completada
  const markTaskAsCompleted = useCallback( async( taskId2 ) => {
    return await changeTaskStatus( taskId2, 'done' );
  }, [changeTaskStatus]);

  // Función para actualización masiva de estado
  const bulkUpdateStatus = useCallback( async( taskIds, newStatus ) => {
    // Inicializar value con valor por defecto
    let value = { success: false, message: '' };
    
    setLoading( true );
    setError( null );
    
    try {
      const response = await http_post( `${API_BASE_URL}/tasks/bulk/update-status`, {
        task_ids: taskIds,
        status: newStatus
      });
      
      if( response.result === 1 ) {
        // Actualizar tareas locales
        setTasks( prevTasks => 
          prevTasks.map( task => 
            taskIds.includes( task.task_id2 ) 
              ? { ...task, status: newStatus }
              : task
          )
        );
        value = { success: true };
      } else {
        const errorMessage = response.message || 'Error en actualización masiva';
        setError( errorMessage );
        value = { success: false, message: errorMessage };
      }
    } catch( err ) {
      const errorMessage = 'Error de conexión en actualización masiva';
      setError( errorMessage );
      value = { success: false, message: errorMessage };
    } finally {
      setLoading( false );
    }
    
    return value;
  }, []);

  // Funciones de utilidad para filtrar tareas
  const getTasksByStatus = useCallback( ( status ) => {
    return tasks.filter( task => task.status === status );
  }, [tasks]);

  const getTodoTasks = useCallback( () => getTasksByStatus( 'todo' ), [getTasksByStatus]);
  const getInProgressTasks = useCallback( () => getTasksByStatus( 'in-progress' ), [getTasksByStatus]);
  const getCompletedTasks = useCallback( () => getTasksByStatus( 'done' ), [getTasksByStatus]);

  return {
    // Estados
    tasks,
    loading,
    error,
    stats,
    
    // Acciones principales
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchStats,
    
    // Acciones específicas de estado
    changeTaskStatus,
    markTaskAsCompleted,
    bulkUpdateStatus,
    
    // Funciones de filtrado
    getTasksByStatus,
    getTodoTasks,
    getInProgressTasks,
    getCompletedTasks,
    
    // Función para limpiar errores
    clearError: () => setError( null )
  };
};

export default useTasks;
