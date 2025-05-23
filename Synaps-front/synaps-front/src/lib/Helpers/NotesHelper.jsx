import { http_post, http_get } from '../http.js';
import React, { useEffect, useState, useRef } from "react";  // Importación de React y el hook useState

export function NotesHelper() {

  // Estado para almacenar las notas
  const [notes, setNotes] = useState( () => window.currentNotes || [] );

  // -----------------------------------------------------------------
  // Selected Item
  // -----------------------------------------------------------------

  // Inicializamos el item seleccionado
  const [selectedItemId2, _setSelectedItemId2]  = useState( () => window.selectedItemId2 ||  '' );

  // setter extendido que también guarda en window
  const setSelectedItemId2 = ( value ) => {
    _setSelectedItemId2( value );
    window.selectedItemId2 = value;
  };

  useEffect( () => {
    window.setSelectedItemId2 = setSelectedItemId2;
  }, [] );

  // -----------------------------------------------------------------
  // Notes
  // -----------------------------------------------------------------

  // Función para obtener todas las notas desde la API
  const getNotes = async( parent_id = 0 ) => {

    try {

      // URL de la API y parámetros
      const url = 'http://localhost:8010/api/getNotes';
      let body  = { parent_id: parent_id };

      // Llamada GET usando tu helper http_get
      const { result, http_data } = await http_get( url, body );
      if ( result !== 1 )
        throw new Error( 'Error al cargar notas' );
      
      // Actualizamos los items
      const newItems = http_data.items.map( item => ( {
          id       : item.id
        , id2      : item.id2
        , title    : item.title
        , parent_id: item.parent_id
        , type     : item.type
      } ) );

      // Actualizamos el estado de notas y la variable global en paralelo
      setNotes( prev => {
        const filtered = prev.filter( item => item.parent_id !== parent_id );
        const updated = [...filtered, ...newItems];
        window.currentNotes = updated;
        return updated;
      } );

    } catch( error ) {
      console.error( error );
    }
  }


  // -----------------------------------------------------------------
  // Leer una nota concreta
  // -----------------------------------------------------------------
  const readNote = async( note_id2 ) => {
    try {
      const url  = 'http://localhost:8010/api/readNote';
      const body = { note_id2 };

      // Realizamos la petición
      const { result, http_data } = await http_get( url, body );
      if( result !== 1 )
        throw new Error( 'Error al leer la nota' );

      window.set_markdown( http_data.note.markdown );
      
      // Forzamos la recarga del MarkdownEditor
      window.setKey( k => k + 1 );

    } catch ( error ) {
      console.log( error );
    }
  };

  // -----------------------------------------------------------------
  // Borrar una nota concreta
  // -----------------------------------------------------------------
  const deleteNote = async( note_id2 ) => {
    try {
      const url  = 'http://localhost:8010/api/deleteNote';
      const body = { note_id2 };

      // Realizamos la petición
      const { result, http_data } = await http_post( url, body );
      if( result !== 1 )
        throw new Error( 'Error al borrar la nota' );

      // Eliminamos la nota del array y actualizamos la interfaz
      setNotes( prev => {
        const filtered = prev.filter( node => node.id2 !== note_id2 );
        window.currentNotes = filtered;
        return filtered;
      } );

    } catch ( error ) {
      console.log( error );
    }
  };

  // Registrar en window al montar
  useEffect( () => {
    window.setSelectedItemId2 = setSelectedItemId2;
    window.getNotes = getNotes;
    window.readNote = readNote;
    window.deleteNote = deleteNote;
  }, [] );

  // Devolver API del hook
  return {
    selectedItemId2,
    setSelectedItemId2,
    notes,
    getNotes,
    readNote,
    deleteNote,
  };
}