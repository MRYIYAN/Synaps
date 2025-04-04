# Synaps

Synaps es una plataforma modular de notas y gestión de conocimiento que integra en un solo entorno funciones avanzadas como bases de datos sincronizadas, visualización tipo galaxia, colaboración entre usuarios y sistema de notificaciones. Su objetivo es combinar lo mejor de herramientas como Obsidian y Notion, añadiendo capacidades únicas para una organización más inteligente y conectada de la información.

## Estructura del proyecto

```
Synaps/
├── Synaps-back         # Laravel (gestión base de datos y lógica central)
├── Synaps-api          # NestJS (API extendida, lógica compilador, microservicios)
├── Synaps-front        # React + Univer.js (editor de tablas y cliente WebSocket)
├── redis-ws-bridge     # Node.js + Redis + WebSocket bridge
└── docker-compose.yml  # Orquestación completa del sistema
```

---

## 🛠️ Infraestructura General Configurada

- ✅ `docker-compose` con Laravel, Redis, MariaDB, phpMyAdmin, WebSocket bridge y NestJS
- ✅ Laravel configurado con Redis como sistema de **cola**, **broadcast**, **sesión** y **caché**
- ✅ WebSocket bridge (Node.js) suscribiéndose a Redis y comunicando con el frontend
- ✅ MariaDB persistente y accesible vía phpMyAdmin
- ✅ Volúmenes Docker para Redis y MySQL

---

## 🧱 Backend

### 📦 Laravel (`Synaps-back`)
- Configurado para Redis
- Dockerizado
- Esperando endpoints y lógica de negocio

### 🧠 NestJS (`Synaps-api`)
- Proyecto creado y limpiado (sin Keycloak)
- Estructura lista con TypeORM, Axios, Config, Jest
- Dockerfile listo para producción

---

## 🔁 WebSocket & Redis (`redis-ws-bridge`)

| Componente            | Funcionalidad                                                    |
|-----------------------|------------------------------------------------------------------|
| 🌐 WebSocket Server   | Comunicación en tiempo real con clientes frontend                |
| 📢 Suscripción Redis  | Escucha canales `backend:updates:*`                              |
| 📤 Publicación Redis  | Emite en canales `frontend:updates:*`                            |
| 🔑 Gestión de tokens  | Autenticación y control de clientes WebSocket                    |
| 📦 Dockerizado        | Puente en contenedor entre backend (Redis) y frontend (React)    |

---

## 🎨 Frontend (`Synaps-front`)

- Creado con `create-react-app`
- Estructura optimizada sin subcarpetas innecesarias
- 🧩 React 18, `socket.io-client`, `ag-grid-react`, polyfills
- 🧾 `@univerjs/core@0.6.9` para hojas de cálculo tipo Excel
- 🔧 Dependencias ajustadas manualmente (conflictos en NPM)
- 🎯 Listo para conectar a WebSocket y renderizar el editor

---

## 🧰 Herramientas y Tecnologías Utilizadas

| Categoría              | Tecnologías                                                                             |
|------------------------|----------------------------------------------------------------------------------------|
| 🐳 Contenedores        | Docker, Docker Compose                                                                 |
| 🧱 Backend             | Laravel 10, NestJS 10, Node.js 18                                                      |
| 🎨 Frontend            | React 18, Univer.js 0.6.9, Socket.IO, ag-grid-react                                    |
| 🧠 Comunicación        | Redis, WebSocket, redis-ws-bridge                                                      |
| 🗄️ Bases de datos      | MariaDB, phpMyAdmin                                                                    |
| 🧪 Dev Tools           | PostCSS, ESLint, Prettier, Jest, TypeScript, Babel                                     |

---

## 📡 Comunicación y Flujo de Trabajo

- Coordinado por **WhatsApp** y esta terminal
- Referencias a proyectos previos: *calclic*, etc.
- Enfoque progresivo:
  1. Infraestructura
  2. Backend
  3. Frontend

---

## 📦 Función de `Synaps-api` (NestJS)

**NestJS** es el núcleo lógico del sistema, actuando como middleware y cerebro orquestador:

### 🔌 1. API Gateway / Middleware Inteligente
- Conecta frontend con servicios (Laravel, WebSocket, Redis)
- Intermedia peticiones y eventos en tiempo real

### ⚙️ 2. Lógica de Negocio Extensible
- Compilación, validación, procesamiento de datos
- Adaptadores para Redis, WebSocket, otros servicios
- Publica eventos a Redis, reenvía por WebSocket

### 🚀 3. Visión a Futuro: Microservicios, IA e Integraciones
- Controladores REST / GraphQL
- Workers asíncronos con Redis
- Servicios independientes y escalables
- Compiladores, reglas de validación, cálculo complejo
- Comunicación fluida Laravel ↔ Nest ↔ Redis ↔ WebSocket ↔ React

```mermaid
flowchart LR
    A[Frontend (React)] -->|HTTP + WebSocket| B[NestJS (Synaps-api)]
    B -->|API y lógica| C[Laravel (Synaps-back)]
    C -->|Base de datos| D[MariaDB]
    B -->|Eventos Redis| E[Redis]
    E -->|Publica eventos| F[redis-ws-bridge (Node.js)]
    F -->|WebSocket| A
```

