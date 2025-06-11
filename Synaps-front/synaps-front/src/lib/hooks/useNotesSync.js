import { useEffect, useRef } from 'react';
import { removeDuplicates } from '../utils/notesDedupe.js';

/**
 * Hook personalizado para sincronizar window.currentNotes con estado local
 * Previene actualizaciones innecesarias y elimina duplicados automáticamente
 */
export function useNotesSync(notes, setNotes, enabled = true) {
  const lastSyncRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if(!enabled) return;

    const syncNotes = () => {
      const currentNotes = window.currentNotes || [];
      const currentNotesString = JSON.stringify(currentNotes);
      
      // Solo sincronizar si hay cambios reales
      if(lastSyncRef.current !== currentNotesString) {
        lastSyncRef.current = currentNotesString;
        
        // Limpiar duplicados antes de actualizar
        const cleanedNotes = removeDuplicates(currentNotes);
        
        setNotes(prev => {
          const prevString = JSON.stringify(prev);
          const cleanedString = JSON.stringify(cleanedNotes);
          
          // Solo actualizar si hay diferencias
          if(prevString !== cleanedString) {
            // Actualizar window.currentNotes con la versión limpia
            window.currentNotes = cleanedNotes;
            return cleanedNotes;
          }
          return prev;
        });
      }
    };

    // Sincronización inicial inmediata
    syncNotes();

    // Configurar sincronización periódica con debounce
    const scheduleSync = () => {
      if(timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(syncNotes, 1000);
    };

    // Escuchar cambios en window.currentNotes
    const observer = new MutationObserver(scheduleSync);
    
    // Configurar intervalo de respaldo (menos frecuente)
    const interval = setInterval(syncNotes, 5000);
    
    return () => {
      if(timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearInterval(interval);
      observer.disconnect();
    };
  }, [setNotes, enabled]);

  // Función para forzar sincronización
  const forceSync = () => {
    const currentNotes = window.currentNotes || [];
    const cleanedNotes = removeDuplicates(currentNotes);
    window.currentNotes = cleanedNotes;
    setNotes(cleanedNotes);
  };

  return { forceSync };
}
