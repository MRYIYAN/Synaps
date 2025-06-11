import { http_post, http_get } from '../http.js';
import { showErrorNotification } from '../../components/Atomic/Notification/NotificationSystem.jsx';

// FoldersHelper como función normal, sin hooks
export function FoldersHelper() {

  // Borrar una carpeta concreta
  const deleteFolder = async(folder_id2) => {
    try {
      const url = 'http://localhost:8010/api/deleteFolder';
      const body = { folder_id2 };

      const { result } = await http_post(url, body);
      if(result !== 1)
        throw new Error('Error al borrar la carpeta');

      // Verificar si la carpeta eliminada es la actualmente seleccionada
      if(window.selectedItemId2 === folder_id2) {
        // Limpiar la selección actual
        window.selectedItemId2 = '';
        
        // Notificar al editor para mostrar el menú de VS Code
        const event = new CustomEvent('noteDeleted', {
          detail: { note_id2: folder_id2 }
        });
        window.dispatchEvent(event);
      }

      const filtered = (window.currentNotes || []).filter(
        node => node.id2 !== folder_id2
      );

      window.currentNotes = filtered;
    } catch (error) {
      console.log(error);
    }
  };

  // Renombrar una carpeta concreta
  const renameFolder = async(folder_id2, new_title) => {
    try {
      // Validación local de nombres duplicados
      const existingItems = window.currentNotes || [];
      const isDuplicate = existingItems.some(item => 
        item.title === new_title && item.id2 !== folder_id2
      );
      
      if(isDuplicate) {
        const errorMsg = 'Ya existe una carpeta con ese nombre';
        showErrorNotification(errorMsg, 'Error de validación');
        throw new Error(errorMsg);
      }

      const url = 'http://localhost:8010/api/renameFolder';
      const body = { id2: folder_id2, new_title };

      const { result, message } = await http_post(url, body);
      if(result !== 1) {
        // Mostrar mensaje de error específico si viene del backend
        const errorMsg = message || 'Error al renombrar la carpeta';
        throw new Error(errorMsg);
      }

      // Actualizamos la carpeta en el array y la interfaz
      const updated = (window.currentNotes || []).map(node => {
        if(node.id2 === folder_id2) {
          return { ...node, title: new_title };
        }
        return node;
      });

      window.currentNotes = updated;
      
    } catch (error) {
      console.log(error);
      
      // Mostrar notificación de error al usuario
      if(!error.message.includes('Ya existe una carpeta con ese nombre')) {
        showErrorNotification(error.message, 'Error al renombrar');
      }
      
      // Re-throw para que el componente pueda manejar el error si es necesario
      throw error;
    }
  };

  // Obtener carpetas por vault
  const getFolders = async(vault_id, parent_id = 0) => {
    vault_id = parseInt(vault_id, 10);
    if(isNaN(vault_id)) {
      console.error("Invalid vault_id");
      return;
    }

    try {
      const url = 'http://localhost:8010/api/getFolders';
      const body = { parent_id, vault_id };

      const { result, http_data } = await http_get(url, body);
      
      if(result !== 1)
        throw new Error('Error loading folders');

      // Guardar carpetas en window.currentNotes y disparar actualización React
      const folders = http_data.folders || [];
      
      // Transformar carpetas para coincidir con el formato de notas
      const transformedFolders = folders.map(folder => ({
        id: folder.folder_id,
        id2: folder.folder_id2,
        title: folder.folder_title,
        parent_id: folder.parent_id,
        type: 'folder'
      }));
      
      // SOLO añadir carpetas a la lista existente, evitando duplicados
      // Filtrar carpetas existentes del mismo vault/parent antes de añadir nuevas
      const existingItems = window.currentNotes || [];
      const filteredExisting = existingItems.filter(item => 
        !(item.type === 'folder' && item.parent_id === parent_id)
      );
      
      // Combinar elementos filtrados con nuevas carpetas
      const combined = [...filteredExisting, ...transformedFolders];
      
      window.currentNotes = combined;
      
    } catch (error) {
      console.error('Error cargando carpetas:', error);
    }
  };

  // Registrar en window
  window.getFolders = getFolders;
  window.deleteFolder = deleteFolder;
  window.renameFolder = renameFolder;

  return {
    getFolders,
    deleteFolder,
    renameFolder,
  };
}