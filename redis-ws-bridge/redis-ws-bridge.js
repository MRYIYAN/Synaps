// ---------------------------------------------------------------------
// Redis WebSocket
// ---------------------------------------------------------------------

const http      = require( 'http' );
const WebSocket = require( 'ws' );
const Redis     = require( 'ioredis' );

// ---------------------------------------------------------------------
// Configuración global
// ---------------------------------------------------------------------

/**
 * Prefijo para canales backend (desde backend hacia frontend)
 * @type {string}
 */
const BACKEND_PREFIX = 'backend:updates:';

/**
 * Prefijo para canales frontend (desde frontend hacia backend)
 * @type {string}
 */
const FRONTEND_PREFIX = 'frontend:updates:';

/**
 * URL de Redis
 * @type {string}
 */
const redis_url = process.env.REDIS_URL || 'redis://localhost:6380';

/**
 * Puerto del WebSocket server
 * @type {number}
 */
const PORT = 8084;

/**
 * Host del WebSocket server
 * @type {string}
 */
const HOST = process.env.WS_HOST || '0.0.0.0';

/**
 * Conexión principal a Redis para publicar mensajes (frontend -> backend)
 * @type {import('ioredis').Redis} 
 */
const redis = new Redis( redis_url );

/**
 * Segunda conexión a Redis, dedicada a la suscripción a canales (backend -> frontend)
 * @type {import('ioredis').Redis} 
 */
const pubsub = new Redis( redis_url );

/**
 * Servidor HTTP que servirá de base para el WebSocket
 * @type {import('http').Server} 
 */
const server = http.createServer();

/**
 * Servidor WebSocket asociado al servidor HTTP
 * @type {import('ws').Server} 
 */
const wss = new WebSocket.Server( { server } );

/**
 * Clientes conectados agrupados por token.
 * @type {Object.<string, Set<WebSocket>>}
 */
const clients = {};

// ---------------------------------------------------------------------
// Logging uniforme
// ---------------------------------------------------------------------

/**
 * Muestra un log con timestamp y tipo.
 * @param {string} type    - Nivel de log (INFO, WARN, ERROR)
 * @param {string} message - Mensaje principal
 * @param {object} [data]  - Objeto adicional opcional
 */
function log( type, message, data = {} )
{
  console.log( `[${ new Date().toISOString() }] [${ type }] ${ message }`, data );
}

// ---------------------------------------------------------------------
// Conexión y gestión de WebSocket
// ---------------------------------------------------------------------

/**
 * Inicializa el servidor WebSocket y gestiona nuevas conexiones.
 */
function init_websocket_server()
{
  wss.on( 'connection', ws =>
  {
    handle_ws_connection( ws );
  } );
}

/**
 * Maneja una nueva conexión WebSocket.
 * @param {WebSocket} ws
 */
function handle_ws_connection( ws )
{
  let token = null;

  const set_token_callback = (new_token) => {
    token = new_token;
  };

  // Si se recibe un evento message, lo procesamos
  ws.on( 'message', async message =>
  {
    handle_ws_message( ws, message, set_token_callback );
  } );

  // Si se recibe un evento close, lo procesamos
  ws.on( 'close', () =>
  {
    unregister_client( ws, token );
  } );
}

/**
 * Procesa los mensajes recibidos por cada WebSocket.
 * @param {WebSocket} ws
 * @param {string} message
 * @param {function} set_token_callback
 */
function handle_ws_message( ws, message, set_token_callback )
{
  try
  {
    // Leemos y parseamos los datos recibidos
    const data = JSON.parse( message );

    // Suscripción al WebSocket
    if( data.subscribe && data.token )
    {
      set_token_callback( data.token );
      register_client( ws, data.token );
      log( 'INFO', `Cliente suscrito a ${ data.token }` );
      return;
    }

    // Actualización: frontend -> backend
    if(data.type === 'update' && data.token && data.updates) {
      // --- NUEVO BLOQUE ---
      const token = data.token;
      const updates = data.updates;
      const markdown = updates.markdown || '';
      const redis_key = `synaps:note:${token}`;
      const jwt = data.jwt || '';  // Obtener JWT del mensaje

      // Guardar en Redis
      redis.set(redis_key, markdown);
      log('INFO', 'Actualización recibida', { token });

      // Reiniciar timer si ya existe
      if(global.persist_timers && global.persist_timers.has(token)) {
        clearTimeout(global.persist_timers.get(token));
      }

      // Nuevo timer para guardar en DB en 2s
      if(!global.persist_timers) global.persist_timers = new Map();
      const timer = setTimeout(() => {
        persistToDatabase(token, markdown, jwt);
        global.persist_timers.delete(token);
      }, 2000);

      global.persist_timers.set(token, timer);

      publish_to_backend(token, updates);
      return;
    }

    // Mensaje desconocido
    log( 'WARN', 'Mensaje desconocido', { message: data } );
  }
  catch ( err )
  {
    log( 'ERROR', 'Error procesando mensaje', { error: err.message } );
  }
}

/**
 * Registra un cliente WebSocket para un token dado.
 * @param {WebSocket} ws
 * @param {string} token
 */
function register_client( ws, token )
{
  // Si no existe, lo creamos
  if( !clients[token] )
    clients[token] = new Set();

  // Añadimos el cliente al WebSocket
  clients[token].add( ws );
}

/**
 * Elimina el cliente WebSocket del set del token dado.
 * @param {WebSocket} ws
 * @param {string} token
 */
function unregister_client( ws, token )
{
  // Si el cliente existe en el WebSocket, lo eliminamos
  if( token && clients[token] )
  {
    // Eliminamos el cliente
    clients[token].delete( ws );
    if( clients[token].size === 0 )
      delete clients[token];

    log( 'INFO', `Socket cerrado para ${ token }` );
  }
}

// ---------------------------------------------------------------------
// Publicación en Redis (frontend -> backend)
// ---------------------------------------------------------------------

/**
 * Publica un mensaje en el canal de updates de frontend hacia backend.
 * @param {string} token
 * @param {object} updates
 */
function publish_to_backend( token, updates )
{
  redis.publish( `${ FRONTEND_PREFIX }${ token }`, JSON.stringify( {
    token, updates
  } ) );
}

// ---------------------------------------------------------------------
// Suscripción a Redis (backend -> frontend) y reenvío a clientes
// ---------------------------------------------------------------------

/**
 * Suscribe el pubsub a los canales backend:updates:* y reenvía a clientes.
 */
function subscribe_backend_updates()
{
  // Se suscribe a todos los canales que empiecen por el prefijo BACKEND_PREFIX
  pubsub.psubscribe( `${ BACKEND_PREFIX }*` );

  // Cuando llega un mensaje de Redis en cualquier canal subscrito
  pubsub.on( 'pmessage', ( pattern, channel, message ) =>
  {
    try
    {
      const token   = channel.slice( BACKEND_PREFIX.length );
      const sockets = clients[token];

      log( 'INFO', `Mensaje recibido de Redis`, { channel, connectedClients: sockets?.size || 0 } );

      // Si hay sockets suscritos a ese token, reenvía el mensaje a cada uno
      if( sockets )
      {
        for ( const ws of sockets ) {
          if( ws.readyState === WebSocket.OPEN )
            ws.send( message );
        }
      }
    }
    catch ( err )
    {
      log( 'ERROR', 'Error procesando Redis', { error: err.message } );
    }
  } );
}

// ---------------------------------------------------------------------//
// Heartbeat para mantener conexiones WebSocket vivas                   //    
// ---------------------------------------------------------------------//

/**
 * Envía ping a todos los clientes cada 30 segundos.
 */
function start_heartbeat()
{
  setInterval( () =>
  {
    // Recorre todos los tokens (canales) de clientes conectados y realiza un ping
    for( const token in clients ) {
      for( const ws of clients[token] ) {
        if( ws.readyState === WebSocket.OPEN )
          ws.ping();
      }
    }
  }, 30000 );
}

// ---------------------------------------------------------------------
// Arranque principal del servidor
// ---------------------------------------------------------------------

/**
 * Inicia el servidor completo.
 */
function start_bridge()
{
  // Inicia el servidor WebSocket, suscribe a Redis para recibir mensajes del backend
  init_websocket_server();
  subscribe_backend_updates();
  start_heartbeat();

  // Inicia el servidor HTTP en el puerto y host configurados
  server.listen( PORT, HOST, () =>
  {
    log( 'INFO', `Redis WebSocket bridge running on ws://${ HOST }:${ PORT }` );
  } );
}

start_bridge();

//----------------------------------------------------------------------//
// Funciones adicionales para guardar notas en Redis y persistir en DB  //
//----------------------------------------------------------------------//

/**
 * Guarda el contenido de una nota en Redis.
 * @param {string} note_id2
 * @param {string} markdown
 */
function save_note_to_redis(note_id2, markdown) {
  const key = `synaps:note:${note_id2}`;
  redis.set(key, markdown);
}

/**
 * Envía la nota al backend para guardarla en la base de datos.
 * @param {string} token
 * @param {string} markdown
 * @param {string} [jwt]
 */
async function persistToDatabase(token, markdown, jwt = '') {
  console.log('[persistToDatabase] JWT recibido:', jwt);
  const url = `http://synaps-back:80/api/saveMarkdown`;
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    };
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token: token,
        markdown: markdown
      }),
    });
    const json = await res.json();
    console.log('[SYNC] Nota persistida a DB:', token, json);
  } catch (error) {
    console.error('[SYNC] Error al persistir nota:', token, error.message);
  }
}