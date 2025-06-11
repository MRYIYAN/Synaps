import { http_post, http_get } from '../http.js';
import { useEffect, useState } from "react";
import { showErrorNotification } from '../../components/Atomic/Notification/NotificationSystem';
import { removeDuplicates, mergeWithoutDuplicates } from '../utils/notesDedupe.js';

/**
 * Helper para gestión de notas
 * Proporciona funciones para CRUD de notas y manejo del estado
 */
export function NotesHelper() {

  // =========================================================================
  // ESTADO LOCAL
  // =========================================================================
  
  // Notas actuales - sincronizado con window.currentNotes
  const [notes, setNotes] = useState(() => window.currentNotes || []);

  // Item seleccionado - sincronizado con window.selectedItemId2  
  const [selectedItemId2, _setSelectedItemId2] = useState(() => window.selectedItemId2 || '');

  // =========================================================================
  // FUNCIONES DE UTILIDAD
  // =========================================================================

  // Setter extendido que sincroniza con window.selectedItemId2
  const setSelectedItemId2 = (value) => {
    _setSelectedItemId2(value);
    window.selectedItemId2 = value;
  };

  // =========================================================================
  // FUNCIONES PRINCIPALES
  // =========================================================================

  // Obtener notas de la API para un vault y carpeta específicos
  const getNotes = async (vault_id, parent_id = 0) => {
    vault_id = parseInt(vault_id, 10);
    if (isNaN(vault_id)) {
      console.error("Invalid vault_id");
      return;
    }
    
    try {
      const url = 'http://localhost:8010/api/getNotes';
      const body = { parent_id, vault_id };

      const { result, http_data } = await http_get(url, body);
      
      if (result !== 1) throw new Error('Error loading notes');
      
      // Transformar elementos de la API al formato local
      const newItems = http_data.items.map(item => ({
        id: item.id,
        id2: item.id2,
        title: item.title,
        parent_id: item.parent_id,
        type: item.type
      }));

      // Actualizar estado local y global de manera inteligente
      setNotes(prev => {
        // Obtener elementos actuales de window
        const currentItems = window.currentNotes || [];
        
        // Remover todos los elementos del parent_id actual para reemplazarlos
        const filteredItems = currentItems.filter(item => {
          return item.parent_id !== parent_id;
        });
        
        // Combinar elementos filtrados con nuevos elementos evitando duplicados
        const updated = mergeWithoutDuplicates(filteredItems, newItems);
        
        // Aplicar limpieza final para eliminar cualquier duplicado restante
        const cleanedItems = removeDuplicates(updated);
        
        window.currentNotes = cleanedItems;
        
        return cleanedItems;
      });

    } catch (error) {
      console.error('Error cargando notas:', error);
    }
  };

  // Leer una nota concreta - simplificado
  const readNote = async (note_id2, vault_id) => {
    // Solo cargar nota si se proporciona un note_id2 específico
    if (!note_id2 || note_id2 === '') return;

    console.log('readNote llamado con:', { note_id2, vault_id });

    // Siempre disparar evento para notificar que se debe crear/mostrar el editor
    console.log('Disparando evento noteSelected...');
    const event = new CustomEvent('noteSelected', {
      detail: { note_id2, vault_id }
    });
    window.dispatchEvent(event);
    
    // Esperar un momento para que se inicialice el editor
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verificar si el editor está disponible ahora
    if (!window.set_markdown || !window.setKey) {
      console.warn('Editor markdown aún no está disponible después de disparar evento');
      // Intentar cargar la nota de todas formas
    }

    const url = 'http://localhost:8010/api/readNote';
    const body = { note_id2, vault_id };

    const { result, http_data } = await http_get( url, body );
    if (result !== 1 || !http_data?.note ) {
      console.error( 'No se pudo cargar la nota' );
      return;
    }

    const note = http_data.note;
    const markdown = note.note_markdown || note.markdown || '';

    // Solo llamar a set_markdown si está disponible
    if (window.set_markdown) {
      window.set_markdown(markdown);
    }
    if (window.setKey) {
      window.setKey(prev => prev + 1);
    }
  };

  // Eliminar una nota específica
  const deleteNote = async (note_id2) => {
    try {
      const url = 'http://localhost:8010/api/deleteNote';
      const body = { note_id2 };

      const { result } = await http_post(url, body);
      if (result !== 1) throw new Error('Error al borrar la nota');

      // Verificar si la nota eliminada es la actualmente abierta
      if (window.selectedItemId2 === note_id2) {
        // Limpiar la selección actual
        window.selectedItemId2 = '';
        setSelectedItemId2('');
        
        // Notificar al editor para mostrar el menú de VS Code
        const event = new CustomEvent('noteDeleted', {
          detail: { deletedNoteId2: note_id2 }
        });
        window.dispatchEvent(event);
      }

      // Actualizar estado local y global eliminando la nota
      setNotes(() => {
        const filtered = (window.currentNotes || []).filter(
          node => node.id2 !== note_id2
        );
        window.currentNotes = filtered;
        return filtered;
      });

    } catch (error) {
      console.error('Error eliminando nota:', error);
    }
  };

  // Renombrar una nota específica
  const renameNote = async (note_id2, new_title) => {
    try {
      // Validación local de nombres duplicados
      const existingNotes = window.currentNotes || [];
      const isDuplicate = existingNotes.some(note => 
        note.title === new_title && note.id2 !== note_id2
      );
      
      if (isDuplicate) {
        const errorMsg = 'Ya existe una nota con ese nombre';
        showErrorNotification(errorMsg, 'Error de validación');
        throw new Error(errorMsg);
      }

      const url = 'http://localhost:8010/api/renameNote';
      const body = { id2: note_id2, new_title };

      const { result, message } = await http_post(url, body);
      if (result !== 1) {
        // Mostrar mensaje de error específico si viene del backend
        const errorMsg = message || 'Error al renombrar la nota';
        throw new Error(errorMsg);
      }

      // Actualizar título en estado local y global
      setNotes(() => {
        const updated = (window.currentNotes || []).map(node => {
          if (node.id2 === note_id2) {
            return { ...node, title: new_title };
          }
          return node;
        });
        window.currentNotes = updated;
        return updated;
      });

    } catch (error) {
      console.error('Error renombrando nota:', error);
      
      // Mostrar notificación de error al usuario
      if (!error.message.includes('Ya existe una nota con ese nombre')) {
        showErrorNotification(error.message, 'Error al renombrar');
      }
      
      // Re-throw para que el componente pueda manejar el error si es necesario
      throw error;
    }
  };

  // =========================================================================
  // EXPOSICIÓN GLOBAL
  // =========================================================================
  
  // Registrar funciones en window para acceso global
  useEffect(() => {
    window.setSelectedItemId2 = setSelectedItemId2;
    window.getNotes = getNotes;
    window.readNote = readNote;
    window.deleteNote = deleteNote;
    window.renameNote = renameNote;
  }, [deleteNote, getNotes, readNote, renameNote]);

  // =========================================================================
  // API PÚBLICA
  // =========================================================================
  
  // Retornar API del helper para uso en componentes
  return {
    selectedItemId2,
    setSelectedItemId2,
    notes,
    getNotes,
    readNote,
    deleteNote,
    renameNote,
  };
}