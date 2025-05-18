// -------------------------------------------------------------------------
// MDEditorWS.jsx
// -------------------------------------------------------------------------

import React, { useState, useEffect, useRef } from 'react';
import MDEditor from './MDEditor';
import { http_get } from '../../lib/http';

// Host y puerto del bridge WS
const WS_HOST = 'localhost';
const WS_PORT = 8082;

/**
 * Editor con sincronización WebSocket por Redis
 *
 * @param {string} note_id2 – Identificador de la nota (id2)
 * @returns {JSX.Element}
 */
export default function MDEditorWS( { note_id2 } )
{
  const [markdown, set_markdown]  = useState( '' );
  const [key, setKey]             = useState(0);
  const ws_ref                    = useRef( null );

  useEffect( () => {
    window.set_markdown = set_markdown;
  }, [] );

  // -------------------------------------------------------------------------
  // Carga inicial de la nota vía HTTP
  // -------------------------------------------------------------------------
  useEffect( () =>
  {
    const fetchNote = async () => {
      const url  = 'http://localhost:8010/api/readNote';
      const body = { first: 1 };

      // Realizamos la petición
      const { result, http_data } = await http_get( url, body );
      if( result !== 1 )
        throw new Error( 'Error al leer la nota' );

      set_markdown( http_data.note.markdown );
      
      // Forzamos la recarga del MarkdownEditor
      setKey( k => k + 1 );
    };

    fetchNote();
  }, [ note_id2 ] );

  // -------------------------------------------------------------------------
  // Conexión y suscripción WebSocket
  // -------------------------------------------------------------------------
  useEffect( () =>
  {
    // Establecemos la conexión con el WS
    const ws        = new WebSocket( `ws://${ WS_HOST }:${ WS_PORT }` );
    ws_ref.current  = ws;

    ws.onopen = () =>
    {
      // Avisamos al bridge que queremos recibir eventos de backend
      ws.send( JSON.stringify( {
          subscribe: true
        , prefix:    'backend:updates'
        , token:     note_id2
      } ) );
    };

    ws.onmessage = ( { data } ) =>
    {
      try
      {
        const msg = JSON.parse( data );
        if ( msg.user_id && msg.user_id === 1 ) return;
        set_markdown( msg.markdown );
      }
      catch ( err )
      {
        console.warn( 'WS mensaje inválido', err );
      }
    };

    ws.onclose = () => console.log( `WS cerrado para nota ${ note_id2 }` );

    return () => ws.close();
  }, [ note_id2 ] );

  // -------------------------------------------------------------------------
  // Al escribir, publicamos el update al bridge WebSocket
  // -------------------------------------------------------------------------
  const handle_change = new_md =>
  {
    set_markdown( new_md );
    const ws = ws_ref.current;
    if ( ws && ws.readyState === WebSocket.OPEN )
    {
      ws.send( JSON.stringify( {
          type:    'update'
        , prefix:  'frontend:updates'
        , token:   note_id2
        , updates: { markdown: new_md }
      } ) );
    }
  };

  // -------------------------------------------------------------------------
  // Renderizado del editor
  // -------------------------------------------------------------------------
  return (
    <MDEditor
      key={ key }
      markdown={ markdown }
      onChange={ handle_change }
    />
  );
}