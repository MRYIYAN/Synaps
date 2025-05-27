import { http_post, http_get } from '../http.js';
import React, { useEffect, useState, useRef } from "react";  // Importación de React y el hook useState

export function FoldersHelper() {

  // Estado para almacenar las notas
  const [notes, setNotes] = useState( () => window.currentNotes || [] );

  // -----------------------------------------------------------------
  // Borrar una carpeta concreta
  // -----------------------------------------------------------------
  const deleteFolder = async( folder_id2 ) => {
    try {
      const url  = 'http://localhost:8010/api/deleteFolder';
      const body = { folder_id2 };

      // Realizamos la petición
      const { result, http_data } = await http_post( url, body );
      if( result !== 1 )
        throw new Error( 'Error al borrar la carpeta' );

      // Eliminamos la carpeta del array y actualizamos la interfaz
      setNotes( () => {
        const filtered = ( window.currentNotes || [] ).filter(
          node => node.id2 !== folder_id2
        );

        window.currentNotes = filtered;
        return filtered;
      } );

    } catch ( error ) {
      console.log( error );
    }
  };

  // Ejemplo de función para obtener carpetas por vault
  const getFolders = async (vault_id, parent_id = 0) => {
    try {
      const url = 'http://localhost:8010/api/getFolders';
      const body = { parent_id, vault_id }; // Enviar vault_id

      const { result, http_data } = await http_get(url, body);
      if (result !== 1)
        throw new Error('Error al cargar carpetas');
      // ...actualiza el estado de carpetas aquí...
    } catch (error) {
      console.error(error);
    }
  };

  useEffect( () => {
    window.deleteFolder = deleteFolder;
  }, [] );

  // Devolver API del hook
  return {
    deleteFolder
  };
}