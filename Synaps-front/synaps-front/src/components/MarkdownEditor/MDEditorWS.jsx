// -------------------------------------------------------------------------
// MDEditorWS.jsx
// -------------------------------------------------------------------------

import React, { useState, useEffect, useRef } from 'react';
import MDEditor from './MDEditor';
import DefaultMenu from './DefaultMenu';
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
      // Solo cargar nota si se proporciona un note_id2 específico
      if (!note_id2 || note_id2 === '') return;

      // Verificar si existe el editor markdown, si no existe, crearlo
      if (!set_markdown || !setKey) {
        console.log('Editor markdown no existe, inicializando...');
        
        // Disparar evento para notificar que se debe crear/mostrar el editor
        const event = new CustomEvent('noteSelected', {
          detail: { note_id2, vault_id }
        });
        window.dispatchEvent(event);
        
        // Esperar un momento para que se inicialice el editor
        await new Promise(resolve => setTimeout(resolve, 100));
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

      set_markdown(markdown);
      setKey(prev => prev + 1);
    };

    if (note_id2 && vault_id !== null) {
      fetchNote();
    }
  }, [note_id2, vault_id, modal]);
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

  // Si no hay nota seleccionada, mostrar el menú por defecto
  if (!note_id2 || note_id2 === '') {
    return <DefaultMenu />;
  }

  return (
    <MDEditor
      key={ key }
      markdown={ markdown }
      onChange={ handle_change }
      options={options}
    />
  );
}