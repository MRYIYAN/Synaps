import { http_post, http_get } from '../http.js';

// FoldersHelper como función normal, sin hooks
export function FoldersHelper() {

  // Borrar una carpeta concreta
  const deleteFolder = async (folder_id2) => {
    try {
      const url = 'http://localhost:8010/api/deleteFolder';
      const body = { folder_id2 };

      const { result, http_data } = await http_post(url, body);
      if (result !== 1)
        throw new Error('Error al borrar la carpeta');

      const filtered = (window.currentNotes || []).filter(
        node => node.id2 !== folder_id2
      );

      window.currentNotes = filtered;
    } catch (error) {
      console.log(error);
    }
  };

  // Renombrar una carpeta concreta
  const renameFolder = async (folder_id2, new_title) => {
    try {
      const url = 'http://localhost:8010/api/renameFolder';
      const body = { id2: folder_id2, new_title };

      const { result } = await http_post(url, body);
      if (result !== 1)
        throw new Error('Error al renombrar la carpeta');

      // Actualizamos la carpeta en el array y la interfaz
      const updated = (window.currentNotes || []).map(node => {
        if (node.id2 === folder_id2) {
          return { ...node, title: new_title };
        }
        return node;
      });

      window.currentNotes = updated;
    } catch (error) {
      console.log(error);
    }
  };

  // Obtener carpetas por vault
  const getFolders = async (vault_id, parent_id = 0) => {
    vault_id = parseInt(vault_id, 10);
    if (isNaN(vault_id)) {
      console.error("vault_id inválido");
      return;
    }

    try {
      const url = 'http://localhost:8010/api/getFolders';
      const body = { parent_id, vault_id };

      const { result, http_data } = await http_get(url, body);
      if (result !== 1)
        throw new Error('Error al cargar carpetas');

      // Guardar en window (como haces con currentNotes)
      const carpetas = http_data.items || [];
      window.currentNotes = [
        ...(window.currentNotes || []).filter(n => n.type !== 'folder'),
        ...carpetas
      ];
    } catch (error) {
      console.error(error);
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