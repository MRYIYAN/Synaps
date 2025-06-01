// -------------------------------------------------------------------------
// MDEditorWS.jsx
// -------------------------------------------------------------------------

import React, { useState, useEffect, useRef } from 'react';
import MDEditor from './MDEditor';
import { http_get } from '../../lib/http';


// Host y puerto del bridge WS
const WS_HOST = window.location.hostname === 'localhost' ? 'localhost' : 'synaps-redis-ws-bridge';
const WS_PORT = 8082;

/**
 * Editor con sincronización WebSocket por Redis
 *
 * @param {string} note_id2 – Identificador de la nota (id2)
 * @returns {JSX.Element}
 */
export default function MDEditorWS({ note_id2 = '', vault_id = null, modal = false, options = true }) {
  const [markdown, set_markdown]  = useState('');
  const [key, setKey]             = useState(0);
  const ws_ref                    = useRef(null);

  useEffect(() => {
    window.set_markdown = set_markdown;
  }, []);

  useEffect(() => {
    window.setKey = setKey;
  }, []);

  // -------------------------------------------------------------------------
  // Carga inicial de la nota vía HTTP
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchNote = async () => {
      console.log('MDEditorWS: usando vault_id', vault_id);

      const url = 'http://localhost:8010/api/readNote';
      let body = {};

      if (!modal && note_id2 === '') {
        body = { first: 1, vault_id };
      } else {
        body = { note_id2, vault_id };
      }

      const { result, http_data } = await http_get(url, body);
      if (result !== 1 || !http_data?.note) {
        console.error(' No se pudo cargar la nota');
        return;
      }

      const note = http_data.note;
      console.log('Nota recibida:', note);

      const markdown = note.note_markdown || note.markdown || '';
      console.log('Contenido del markdown:', markdown);

      set_markdown(markdown);
      setKey(prev => prev + 1);
    };

    const skip_initial_fetch = note_id2 === '' && !modal;
    if (!skip_initial_fetch && vault_id !== null) {
      fetchNote();
    }
  }, [note_id2, vault_id]);
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
  console.log('[MDEditorWS] ha renderizado: ', { note_id2, vault_id });

  return (
    <MDEditor
      key={ key }
      markdown={ markdown }
      onChange={ handle_change }
      options={options}
    />
  );
}