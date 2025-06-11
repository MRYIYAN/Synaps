/**
 * Utilidades para eliminar duplicados en notas y carpetas
 * Proporciona funciones centralizadas para manejar duplicados
 */

/**
 * Elimina duplicados de un array de notas/carpetas basándose en id2
 * @param {Array} items - Array de elementos (notas/carpetas)
 * @returns {Array} - Array sin duplicados
 */
export function removeDuplicates(items) {
  if(!Array.isArray(items)) return [];
  
  const seen = new Set();
  return items.filter(item => {
    if(!item || !item.id2) return false;
    
    if(seen.has(item.id2)) {
      return false;
    }
    
    seen.add(item.id2);
    return true;
  });
}

/**
 * Combina arrays de notas evitando duplicados
 * @param {Array} existingItems - Array actual de elementos
 * @param {Array} newItems - Nuevos elementos a agregar
 * @returns {Array} - Array combinado sin duplicados
 */
export function mergeWithoutDuplicates(existingItems, newItems) {
  const existing = Array.isArray(existingItems) ? existingItems : [];
  const newOnes = Array.isArray(newItems) ? newItems : [];
  
  // Crear un map de elementos existentes para búsqueda rápida
  const existingMap = new Map();
  existing.forEach(item => {
    if(item && item.id2) {
      existingMap.set(item.id2, item);
    }
  });
  
  // Agregar nuevos elementos solo si no existen
  const result = [...existing];
  newOnes.forEach(newItem => {
    if(newItem && newItem.id2 && !existingMap.has(newItem.id2)) {
      result.push(newItem);
    }
  });
  
  return result;
}

/**
 * Actualiza un elemento existente o lo agrega si no existe
 * @param {Array} items - Array actual de elementos
 * @param {Object} newItem - Elemento a actualizar/agregar
 * @returns {Array} - Array actualizado
 */
export function updateOrAdd(items, newItem) {
  if(!newItem || !newItem.id2) return items;
  
  const existing = Array.isArray(items) ? items : [];
  const index = existing.findIndex(item => item && item.id2 === newItem.id2);
  
  if(index >= 0) {
    // Actualizar elemento existente
    const updated = [...existing];
    updated[index] = newItem;
    return updated;
  } else {
    // Agregar nuevo elemento
    return [...existing, newItem];
  }
}

/**
 * Valida y limpia un array de notas/carpetas
 * @param {Array} items - Array a validar
 * @returns {Array} - Array validado y sin duplicados
 */
export function validateAndClean(items) {
  if(!Array.isArray(items)) return [];
  
  // Filtrar elementos válidos y eliminar duplicados
  const validItems = items.filter(item => 
    item && 
    typeof item === 'object' && 
    item.id2 && 
    item.title &&
    (item.type === 'note' || item.type === 'folder')
  );
  
  return removeDuplicates(validItems);
}
