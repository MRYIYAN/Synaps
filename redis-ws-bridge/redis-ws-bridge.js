
// Redis WebSocket bridge
// Crea un servidor HTTP y WebSocket y se conecta a Redis 
const http = require('http'); // Para recibir mensajes de actualización desde el backend y reenviarlos a los clientes WebSocket.
const WebSocket = require('ws'); // Para manejar las conexiones WebSocket.
const Redis = require('ioredis'); // Conectarse a Redis y suscribirse a los mensajes de actualización desde el backend. 
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// Configuración de Redis y WebSocket
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; // URL de Redis.
const redis = new Redis(redisUrl); // Conexión a Redis. 
const pubsub = new Redis(redisUrl); // Conexión a Redis 2
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const clients = {}; // Conjunto de clientes WebSocket por token
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//


// NUEVA: Función para enviar logs con una estructura 
const log = (type, message, data = {}) => {
  console.log(`[${new Date().toISOString()}] [${type}] ${message}`, data);
};

// Manejar conexiones con el WebSocket
wss.on('connection', (ws) => {
  let token = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      // Suscripción
      if (data.subscribe && data.token) {
        token = data.token;
        if (!clients[token]) {
          clients[token] = new Set();
        }
        clients[token].add(ws);
        console.log(`Cliente suscrito a ${token}`);
        return;
      }

     // Manejo de actualización desde frontend
     if (data.type === 'update' && data.token && data.updates) {
      log('INFO', `Actualización recibida`, { token: data.token });
      await redis.publish(`frontend:updates:${data.token}`, JSON.stringify({
        token: data.token,
        updates: data.updates
      }));
      return;
    }

    // Manejo de mensajes desconocidos desconocidos ERRORES 

    log('WARN', 'Mensaje desconocido', { message: data });
  } catch (err) {
    log('ERROR', 'Error procesando mensaje', { error: err.message });
  }
});

  ws.on('close', () => {
    if (token && clients[token]) {
      clients[token].delete(ws);
      if (clients[token].size === 0) {
        delete clients[token];
      }
      console.log(`Socket cerrado para ${token}`);
    }
  });
});

// Manejo de mensajes de Redis
pubsub.psubscribe('backend:updates:*');

pubsub.on('pmessage', (pattern, channel, message) => {
  try {
    const token = channel.split(':')[2]; 
    const sockets = clients.get(token);

    log('INFO', `Mensaje recibido de Redis`, { channel, connectedClients: sockets?.size || 0 });

    if (sockets) {
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      }
    }
  } catch (err) {
    log('ERROR', 'Error procesando Redis', { error: err.message });
  }
});
setInterval(() => {
  for (const token in clients) {
    for (const ws of clients[token]) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping(); // Mantiene la conexión viva
      }
    }
  }
}, 30000); // cada 30 segundos

const PORT = process.env.WS_PORT || 8082;
const HOST = process.env.WS_HOST || '0.0.0.0'; // Mejor compatibilidad con Docker y permite acceder desde cualquier IP 
server.listen(PORT, HOST, () => {
  console.log(`Redis WebSocket bridge running on ws://${HOST}:${PORT}`);
});
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//