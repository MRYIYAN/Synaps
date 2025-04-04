🧠 Resumen completo del avance del TFC – Proyecto Synaps
📁 Estructura modular del proyecto
Ubicada dentro de TFC/Synaps/:

bash
Copiar
Editar
Synaps/
├── Synaps-back         # Laravel (gestión base de datos y lógica central)
├── Synaps-api          # NestJS (API extendida, lógica compilador, microservicios)
├── Synaps-front        # React + Univer.js (editor de tablas y cliente WebSocket)
├── redis-ws-bridge     # Node.js + Redis + WebSocket bridge
└── docker-compose.yml  # Orquestación completa del sistema
🔧 Infraestructura general configurada
✅ docker-compose con Laravel, Redis, MariaDB, phpMyAdmin, WebSocket bridge y NestJS

✅ Laravel configurado con Redis como sistema de cola, broadcast, sesión y caché

✅ WebSocket bridge (Node.js) suscribiéndose a Redis y comunicando con el frontend

✅ MariaDB persistente y accesible vía phpMyAdmin

✅ Volúmenes Docker para Redis y MySQL

🧱 Backend
Laravel (Synaps-back)

Configurado para Redis

Dockerizado

Esperando endpoints y lógica de negocio

NestJS (Synaps-api)

Proyecto creado y limpiado (sin Keycloak)

Estructura lista con TypeORM, Axios, Config, Jest

Dockerfile listo para producción

🌐 WebSocket & Redis
Servicio redis-ws-bridge creado con:

WebSocket server

Subcripción a canales Redis (backend:updates:*)

Publicación en canales frontend:updates:*

Clientes gestionados por token

Dockerizado y funcionando como puente entre backend y frontend

🎨 Frontend (Synaps-front)
Creado con create-react-app

Estructura corregida (evitando subcarpetas innecesarias)

React 18, socket.io-client, ag-grid-react, polyfills listos

Univer.js (@univerjs/core@0.6.9) añadido para hojas de cálculo

Dependencias configuradas manualmente por conflictos en NPM

Preparado para conectar con WebSocket y renderizar el editor

⚒️ Herramientas y tecnologías utilizadas
Docker & Docker Compose

Laravel 10

NestJS 10

Node.js 18

React 18

Univer.js 0.6.9

Socket.IO

Redis

MariaDB

phpMyAdmin

PostCSS, ESLint, Prettier, Jest, TS, Babel

💬 Comunicación y flujo
Coordinado por WhatsApp y esta terminal

Uso compartido de referencias de proyectos anteriores (calclic, etc.)

Enfoque progresivo: primero infra, luego backend, ahora frontend

📦 ¿Qué función cumple Synaps-api (NestJS)?
✅ Es el núcleo lógico y comunicador entre componentes
Mientras Laravel (Synaps-back) gestiona la persistencia y negocio de base, NestJS actúa como el “cerebro orquestador” y:

🔌 1. API Gateway / Middleware inteligente
Conecta el frontend con otros servicios

Hace de capa intermedia entre:

Laravel (back principal)

Redis y WebSocket (real-time)

Frontend (React)

⚙️ 2. Lógica de negocio compleja / extensible
Si Laravel es más para BD y reglas puras, Nest puede manejar:

Compilación, validación y procesamiento de datos

Adaptadores para Redis, WebSocket y otros microservicios

Transmisión de eventos (publicar a Redis, reenviar a sockets)

🧠 3. Futuro del TFC: microservicios, IA, integraciones
Se usa Nest para:

Añadir controladores REST o GraphQL

Ejecutar workers con colas (Redis)

Modularizar en servicios independientes

Integrar lógica de cálculo (compiladores, reglas, etc.)

Comunicación entre Laravel ↔ Nest ↔ Redis ↔ WebSocket ↔ React