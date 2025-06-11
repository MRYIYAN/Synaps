# Manual del Programador - Proyecto Synaps

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Estándares de Programación](#estándares-de-programación)
5. [Backend - Laravel](#backend---laravel)
6. [Frontend - React](#frontend---react)
7. [Base de Datos](#base-de-datos)
8. [Autenticación con Keycloak](#autenticación-con-keycloak)
9. [API Documentation](#api-documentation)
10. [Configuración y Despliegue](#configuración-y-despliegue)
11. [Troubleshooting](#troubleshooting)
12. [Comandos Útiles](#comandos-útiles)
13. [Guía de Debug](#guía-de-debug)
14. [Mejores Prácticas](#mejores-prácticas)
15. [Resolución de Errores Específicos](#resolución-de-errores-específicos)
16. [Contacto y Soporte](#contacto-y-soporte)

---

## Introducción

**Synaps** es una aplicación web completa para gestión de notas y tareas con arquitectura de microservicios. El sistema implementa un patrón multi-tenant donde cada usuario tiene su propia base de datos dedicada.

### Tecnologías Principales
- **Backend**: Laravel 11 + PHP 8.2
- **Frontend**: React 18 + JavaScript/JSX
- **Base de Datos**: MySQL/MariaDB
- **Autenticación**: Keycloak + JWT
- **Cache**: Redis
- **Contenedores**: Docker + Docker Compose

---

## Arquitectura del Sistema

### Patrón Multi-Tenant
```
synaps_0001 (Usuario 1)
synaps_0002 (Usuario 2)
synaps_0003 (Usuario 3)
...
synaps (Base de datos principal - usuarios y configuración)
```

### Microservicios
1. **Synaps-back** (Laravel): API principal
2. **Synaps-front** (React): Interfaz de usuario
3. **synaps-idp-flask** (Flask): Servicio de autenticación
4. **redis-ws-bridge**: Bridge para WebSockets

---

## Estructura del Proyecto

### Directorio Raíz
```
Synaps/
├── Synaps-back/          # Backend Laravel
├── Synaps-front/         # Frontend React
├── synaps-idp-flask/     # Servicio de autenticación
├── redis-ws-bridge/      # Bridge WebSocket
├── SQL/                  # Scripts de base de datos
├── Docs/                 # Documentación
└── docker-compose.yml    # Configuración Docker
```

### Backend Structure
```
Synaps-back/laravel/
├── app/
│   ├── Http/Controllers/     # Controladores
│   │   ├── Api/
│   │   │   └── TaskController.php
│   │   ├── AuthController.php
│   │   └── NoteController.php
│   ├── Models/              # Modelos Eloquent
│   │   ├── Task.php
│   │   ├── Note.php
│   │   └── User.php
│   ├── Services/            # Lógica de negocio
│   │   ├── TaskService.php
│   │   └── NoteService.php
│   └── Helpers/             # Utilidades
│       ├── AuthHelper.php
│       └── DatabaseHelper.php
├── routes/api.php          # Rutas API
└── config/                 # Configuraciones
```

### Frontend Structure
```
Synaps-front/synaps-front/src/
├── components/             # Componentes React
│   ├── Atomic/
│   │   └── Panels/
│   └── Taskboard/
│       ├── KanbanBoard/
│       ├── TaskCard/
│       └── Modals/
├── hooks/                  # Custom Hooks
│   └── useTasks.js
├── lib/                    # Utilidades
│   └── http.js
└── App.js                  # Componente principal
```

---

## Estándares de Programación

### 1. Patrón `value` para Funciones
Todas las funciones deben seguir el patrón de retorno consistente:

```javascript
// JavaScript - Correcto
const createTask = useCallback( async( taskData ) => {
    // Inicializar value con valor por defecto
    let value = { success: false, message: '' };
    
    try {
        const response = await http_post( url, data );
        if( response.result === 1 ) {
            value = { success: true, task: response.data };
        } else {
            value = { success: false, message: response.message };
        }
    } catch( error ) {
        value = { success: false, message: 'Error de conexión' };
    }
    
    return value;
}, []);
```

```php
// PHP - Correcto
public function connect( ?int $tenant_id = null ): string
{
    // Inicializar value con valor por defecto
    $value = config( 'database.default' );

    if( $tenant_id === null ) {
        // Retornar value
        return $value;
    }

    // ... lógica ...
    $value = 'tenant';
    return $value;
}
```

### 2. Espaciado en Paréntesis
```javascript
// Correcto
function myFunction( param1, param2 ) {
    if( condition ) {
        doSomething( param1 );
    }
}

// Incorrecto
function myFunction(param1, param2) {
    if(condition) {
        doSomething(param1);
    }
}
```

```php
// Correcto
public function updateTask( Task $task, array $data ): array
{
    if( $task->exists() ) {
        return $this->processUpdate( $task, $data );
    }
}

// Incorrecto
public function updateTask(Task $task, array $data): array
{
    if($task->exists()) {
        return $this->processUpdate($task, $data);
    }
}
```

### 3. Eliminación de Console.log y Log Statements
- **NO usar** `console.log()` en producción
- **NO usar** `Log::info()` excepto para errores críticos
- Usar herramientas de debugging específicas

### 4. Nomenclatura de Variables
```javascript
// Correcto
const taskList = [];
const userId = 123;
const isCompleted = false;

// Incorrecto
const task_list = [];
const user_id = 123;
const is_completed = false;
```

---

## Backend - Laravel

### Arquitectura de Controladores

#### Estructura Estándar de Controlador
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TaskService;
use App\Helpers\AuthHelper;
use App\Helpers\DatabaseHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    protected $taskService;

    public function __construct( TaskService $taskService )
    {
        $this->taskService = $taskService;
    }

    public function index( Request $request ): JsonResponse
    {
        try {
            // 1. Autenticación
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if( $auth_result['error_response'] ) {
                throw new Exception( 'Usuario no autenticado' );
            }
            
            // 2. Configurar conexión tenant
            $user_id = $auth_result['user_id'];
            $user_db = DatabaseHelper::connect( $user_id );
            Model::setConnectionName( $user_db );
            
            // 3. Validación
            $validated = $request->validate([
                'vault_id' => 'required|integer'
            ]);
            
            // 4. Lógica de negocio
            $result = $this->taskService->getSomething( $validated );
            
            // 5. Respuesta
            return response()->json([
                'result' => 1,
                'data' => $result
            ]);
            
        } catch( Exception $e ) {
            return response()->json([
                'result' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
```

### Helpers Principales

#### AuthHelper
```php
// Obtener usuario autenticado
$auth_result = AuthHelper::getAuthenticatedUserId();
// Retorna: ['user_id' => int, 'user_id2' => string, 'error_response' => JsonResponse|null]
```

#### DatabaseHelper
```php
// Conectar a base de datos tenant
$connection = DatabaseHelper::connect( $user_id );
Model::setConnectionName( $connection );
```

### Servicios (Services)

#### Estructura de Servicio
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class TaskService
{
    public function createTask( array $data, int $userId )
    {
        return DB::transaction( function () use ( $data, $userId ) {
            // Lógica de negocio
            $task = Task::create( $data );
            return $task;
        });
    }
}
```

### Modelos Eloquent

#### Conexiones Dinámicas
```php
class Task extends Model
{
    protected static $connectionName = null;
    
    public static function setConnectionName( $connectionName )
    {
        static::$connectionName = $connectionName;
    }

    public function getConnectionName()
    {
        return static::$connectionName ?: parent::getConnectionName();
    }
}
```

#### Scopes Útiles
```php
// En el modelo Task
public function scopeByVault( $query, $vaultId )
{
    return $query->where( 'vault_id', $vaultId );
}

public function scopeByStatus( $query, $status )
{
    return $query->where( 'status', $status );
}

// Uso
$tasks = Task::byVault( $vaultId )->byStatus( 'todo' )->get();
```

---

## Frontend - React

### Hooks Personalizados

#### useTasks Hook
```javascript
const useTasks = ( vaultId = null ) => {
    const [tasks, setTasks] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [error, setError] = useState( null );

    const createTask = useCallback( async( taskData ) => {
        // Inicializar value con valor por defecto
        let value = { success: false, message: '' };
        
        if( !vaultId ) {
            value = { success: false, message: 'Vault ID requerido' };
            return value;
        }
        
        setLoading( true );
        
        try {
            const response = await http_post( `${API_URL}/tasks`, {
                ...taskData,
                vault_id: vaultId
            });
            
            if( response.result === 1 ) {
                setTasks( prevTasks => [response.data.task, ...prevTasks] );
                value = { success: true, task: response.data.task };
            } else {
                value = { success: false, message: response.message };
            }
        } catch( error ) {
            value = { success: false, message: 'Error de conexión' };
        } finally {
            setLoading( false );
        }
        
        return value;
    }, [vaultId]);

    return {
        tasks,
        loading,
        error,
        createTask,
        // ... otros métodos
    };
};
```

### Componentes

#### Estructura de Componente
```javascript
const TaskCard = ({ task, onEditTask, onDeleteTask }) => {
    const [isEditing, setIsEditing] = useState( false );

    const handleEdit = useCallback( () => {
        setIsEditing( true );
        onEditTask( task );
    }, [task, onEditTask]);

    const handleDelete = useCallback( () => {
        onDeleteTask( task );
    }, [task, onDeleteTask]);

    return (
        <div className="task-card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div className="task-actions">
                <button onClick={handleEdit}>Editar</button>
                <button onClick={handleDelete}>Eliminar</button>
            </div>
        </div>
    );
};

export default TaskCard;
```

### Gestión de Estados

#### Patrón para Formularios
```javascript
const CreateTaskModal = ({ isOpen, onClose, onCreateTask }) => {
    const [taskData, setTaskData] = useState( {
        title: '',
        description: '',
        priority: 'medium'
    } );
    const [errors, setErrors] = useState( {} );
    const [isSubmitting, setIsSubmitting] = useState( false );

    const handleSubmit = useCallback( async( e ) => {
        e.preventDefault();
        
        setIsSubmitting( true );
        
        try {
            const result = await onCreateTask( taskData );
            if( result.success ) {
                onClose();
            } else {
                setErrors({ general: result.message });
            }
        } catch( error ) {
            setErrors({ general: 'Error inesperado' });
        } finally {
            setIsSubmitting( false );
        }
    }, [taskData, onCreateTask, onClose]);

    // ... resto del componente
};
```

---

## Base de Datos

### Estructura Multi-Tenant

#### Base de Datos Principal (synaps)
```sql
-- Usuarios y configuración global
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id2 VARCHAR(32) UNIQUE,
    username VARCHAR(100),
    email VARCHAR(255),
    first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vaults (
    vault_id INT PRIMARY KEY AUTO_INCREMENT,
    vault_id2 VARCHAR(32) UNIQUE,
    user_id INT,
    name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### Base de Datos Tenant (synaps_0001, synaps_0002, ...)
```sql
-- Tareas específicas del usuario
CREATE TABLE tasks (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id2 VARCHAR(32) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in-progress', 'done') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    vault_id INT NOT NULL,
    created_by INT,
    assigned_to INT,
    due_date DATETIME,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Notas específicas del usuario
CREATE TABLE notes (
    note_id INT PRIMARY KEY AUTO_INCREMENT,
    note_id2 VARCHAR(32) UNIQUE,
    title VARCHAR(255),
    content TEXT,
    vault_id INT NOT NULL,
    folder_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migraciones Laravel

#### Crear Migración
```bash
php artisan make:migration create_tasks_table
```

```php
// database/migrations/xxxx_create_tasks_table.php
public function up()
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->id('task_id');
        $table->string('task_id2', 32)->unique();
        $table->string('title');
        $table->text('description')->nullable();
        $table->enum('status', ['todo', 'in-progress', 'done'])->default('todo');
        $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
        $table->unsignedBigInteger('vault_id');
        $table->unsignedBigInteger('created_by')->nullable();
        $table->datetime('due_date')->nullable();
        $table->datetime('completed_at')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
}
```

---

## Autenticación con Keycloak

### Descripción General

Synaps utiliza **Keycloak** como servidor de identidad y gestión de acceso (IAM). Keycloak proporciona autenticación SSO (Single Sign-On), autorización y gestión de usuarios de forma segura y escalable.

### Arquitectura de Autenticación

```
Usuario → Frontend React → Keycloak → Backend Laravel
                ↓              ↓             ↓
          Login Page    JWT Token    Validación JWT
```

### Configuración de Keycloak

#### Instalación con Docker
```yaml
# docker-compose.yml
keycloak:
  image: quay.io/keycloak/keycloak:latest
  environment:
    - KEYCLOAK_ADMIN=admin
    - KEYCLOAK_ADMIN_PASSWORD=admin
  ports:
    - "8080:8080"
  command: start-dev
```

#### Configuración de Realm
1. **Crear Realm**: `synaps`
2. **Configurar Client**: `synaps-client`
3. **Establecer URLs**:
   - Root URL: `http://localhost:3000`
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`

#### Client Settings
```json
{
  "clientId": "synaps-client",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true,
  "serviceAccountsEnabled": false,
  "publicClient": true
}
```

### Integración Frontend (React)

#### Instalación de Keycloak Adapter
```bash
npm install @react-keycloak/web keycloak-js
```

#### Configuración del Cliente Keycloak
```javascript
// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM,
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
});

export default keycloak;
```

#### Provider Setup
```javascript
// src/App.js
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';

function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'login-required',
        checkLoginIframe: false,
      }}
      onEvent={(event, error) => {
        console.log('Keycloak event:', event, error);
      }}
      onTokens={(tokens) => {
        localStorage.setItem('auth_token', tokens.token);
      }}
    >
      <AppContent />
    </ReactKeycloakProvider>
  );
}
```

#### Hook de Autenticación
```javascript
// src/hooks/useAuth.js
import { useKeycloak } from '@react-keycloak/web';

export const useAuth = () => {
  const { keycloak, initialized } = useKeycloak();

  const login = useCallback(() => {
    keycloak.login();
  }, [keycloak]);

  const logout = useCallback(() => {
    keycloak.logout();
    localStorage.removeItem('auth_token');
  }, [keycloak]);

  const isAuthenticated = keycloak.authenticated;
  const token = keycloak.token;
  const userInfo = keycloak.tokenParsed;

  return {
    initialized,
    isAuthenticated,
    token,
    userInfo,
    login,
    logout,
  };
};
```

### Integración Backend (Laravel)

#### Middleware JWT
```php
// app/Http/Middleware/KeycloakAuth.php
class KeycloakAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json(['error' => 'Token requerido'], 401);
        }

        try {
            // Validar token con Keycloak
            $userInfo = $this->validateKeycloakToken($token);
            $request->attributes->set('user_info', $userInfo);
            
            return $next($request);
        } catch (Exception $e) {
            return response()->json(['error' => 'Token inválido'], 401);
        }
    }

    private function validateKeycloakToken($token)
    {
        $keycloakUrl = config('keycloak.server_url');
        $realm = config('keycloak.realm');
        
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->get("{$keycloakUrl}/realms/{$realm}/protocol/openid_connect/userinfo");
        
        if (!$response->successful()) {
            throw new Exception('Token validation failed');
        }
        
        return $response->json();
    }
}
```

#### AuthHelper con Keycloak
```php
// app/Helpers/AuthHelper.php
class AuthHelper
{
    public static function getAuthenticatedUserId(): array
    {
        $request = request();
        $userInfo = $request->attributes->get('user_info');
        
        if (!$userInfo) {
            return [
                'user_id' => null,
                'user_id2' => null,
                'error_response' => response()->json([
                    'result' => 0,
                    'message' => 'Usuario no autenticado'
                ], 401)
            ];
        }
        
        // Buscar o crear usuario en base de datos
        $user = User::where('keycloak_id', $userInfo['sub'])->first();
        
        if (!$user) {
            $user = User::create([
                'keycloak_id' => $userInfo['sub'],
                'email' => $userInfo['email'],
                'username' => $userInfo['preferred_username'],
                'first_name' => $userInfo['given_name'] ?? '',
                'last_name' => $userInfo['family_name'] ?? '',
            ]);
        }
        
        return [
            'user_id' => $user->user_id,
            'user_id2' => $user->user_id2,
            'keycloak_id' => $userInfo['sub'],
            'error_response' => null
        ];
    }
}
```

### Configuración de Variables de Entorno

#### Frontend (.env)
```bash
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=synaps
REACT_APP_KEYCLOAK_CLIENT_ID=synaps-client
```

#### Backend (.env)
```bash
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=synaps
KEYCLOAK_CLIENT_ID=synaps-client
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

### Gestión de Tokens

#### Renovación Automática
```javascript
// Configurar renovación automática en React
keycloak.onTokenExpired = () => {
  keycloak.updateToken(30).then((refreshed) => {
    if (refreshed) {
      localStorage.setItem('auth_token', keycloak.token);
    }
  }).catch(() => {
    keycloak.login();
  });
};
```

#### Interceptor para HTTP Requests
```javascript
// src/lib/http.js
import axios from 'axios';
import { keycloak } from '../keycloak';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      keycloak.login();
    }
    return Promise.reject(error);
  }
);
```

### Roles y Permisos

#### Configuración en Keycloak
1. **Crear Roles**:
   - `synaps-admin`
   - `synaps-user`
   - `synaps-viewer`

2. **Asignar Roles a Usuarios**

#### Verificación en Backend
```php
// Verificar roles en controladores
public function adminOnlyAction(Request $request)
{
    $userInfo = $request->attributes->get('user_info');
    $roles = $userInfo['realm_access']['roles'] ?? [];
    
    if (!in_array('synaps-admin', $roles)) {
        return response()->json(['error' => 'Acceso denegado'], 403);
    }
    
    // ... lógica del admin
}
```

### Troubleshooting Keycloak

#### Problemas Comunes

**1. CORS Issues**
```bash
# En Keycloak Admin Console:
# Clients → synaps-client → Settings
# Web Origins: http://localhost:3000
```

**2. Token Expiration**
```javascript
// Verificar si el token está expirado
if (keycloak.isTokenExpired()) {
  keycloak.updateToken(5);
}
```

**3. Redirect Issues**
```javascript
// Verificar Valid Redirect URIs en Keycloak
// Debe incluir: http://localhost:3000/*
```

### Seguridad y Mejores Prácticas

1. **Nunca almacenar credenciales en el código**
2. **Usar HTTPS en producción**
3. **Configurar timeouts apropiados para tokens**
4. **Implementar logout seguro**
5. **Validar tokens en cada request del backend**
6. **Usar roles granulares para autorización**

---

## API Documentation

### Endpoints Principales

#### Tasks API

##### GET /api/tasks
Obtener lista de tareas
```javascript
// Request
GET /api/tasks?vault_id=1&status=todo&page=1&limit=15

// Headers
Authorization: Bearer {jwt_token}

// Response
{
    "result": 1,
    "tasks": [
        {
            "task_id": 1,
            "task_id2": "ABC123",
            "title": "Mi tarea",
            "description": "Descripción",
            "status": "todo",
            "priority": "medium",
            "created_at": "2025-06-11T10:00:00Z"
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 5,
        "total": 75
    }
}
```

##### POST /api/tasks
Crear nueva tarea
```javascript
// Request
POST /api/tasks

// Headers
Authorization: Bearer {jwt_token}
Content-Type: application/json

// Body
{
    "title": "Nueva tarea",
    "description": "Descripción opcional",
    "priority": "high",
    "vault_id": 1,
    "due_date": "2025-06-15"
}

// Response
{
    "result": 1,
    "message": "Tarea creada exitosamente",
    "task": {
        "task_id": 2,
        "task_id2": "XYZ789",
        "title": "Nueva tarea",
        "status": "todo",
        "created_at": "2025-06-11T10:30:00Z"
    }
}
```

##### PUT /api/tasks/{task_id2}
Actualizar tarea
```javascript
// Request
PUT /api/tasks/XYZ789

// Body
{
    "status": "in-progress",
    "title": "Tarea actualizada"
}

// Response
{
    "result": 1,
    "message": "Tarea actualizada exitosamente",
    "task": { /* datos actualizados */ }
}
```

##### DELETE /api/tasks/{task_id2}
Eliminar tarea
```javascript
// Request
DELETE /api/tasks/XYZ789

// Response
{
    "result": 1,
    "message": "Tarea eliminada exitosamente"
}
```

### Códigos de Error
```javascript
// Responses de error estándar
{
    "result": 0,
    "message": "Descripción del error"
}

// Códigos HTTP
200 - OK
201 - Created  
400 - Bad Request
401 - Unauthorized
404 - Not Found
500 - Internal Server Error
```

---

## Configuración y Despliegue

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  synaps-back:
    build: ./Synaps-back
    ports:
      - "8010:80"
    environment:
      - DB_HOST=synaps-db
      - DB_DATABASE=synaps
    depends_on:
      - synaps-db
      - redis

  synaps-front:
    build: ./Synaps-front
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8010/api

  synaps-db:
    image: mariadb:10.6
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: synaps
    volumes:
      - ./SQL/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Variables de Entorno

#### Backend (.env)
```bash
# Laravel
APP_NAME=Synaps
APP_ENV=production
APP_KEY=base64:your-app-key
APP_DEBUG=false
APP_URL=http://localhost:8010

# Database
DB_CONNECTION=mysql
DB_HOST=synaps-db
DB_PORT=3306
DB_DATABASE=synaps
DB_USERNAME=root
DB_PASSWORD=root

# JWT
JWT_SECRET=your-jwt-secret-key

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8010/api
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=synaps
REACT_APP_KEYCLOAK_CLIENT_ID=synaps-client
```

### Comandos de Despliegue

#### Desarrollo
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f synaps-back

# Acceder al contenedor
docker-compose exec synaps-back bash

# Migraciones
docker-compose exec synaps-back php artisan migrate

# Limpiar cache
docker-compose exec synaps-back php artisan cache:clear
```

#### Producción
```bash
# Build optimizado
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado
docker-compose ps

# Backup base de datos
docker-compose exec synaps-db mysqldump -u root -p synaps > backup.sql
```

---

## Testing

### Backend - PHPUnit

#### Configuración
```php
// phpunit.xml
<phpunit>
    <testsuites>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

#### Test de Feature
```php
// tests/Feature/TaskControllerTest.php
class TaskControllerTest extends TestCase
{
    public function test_can_create_task()
    {
        $user = User::factory()->create();
        $this->actingAs( $user );
        
        $taskData = [
            'title' => 'Test Task',
            'vault_id' => 1,
            'priority' => 'medium'
        ];
        
        $response = $this->postJson( '/api/tasks', $taskData );
        
        $response->assertStatus( 201 )
                ->assertJson([
                    'result' => 1,
                    'message' => 'Tarea creada exitosamente'
                ]);
        
        $this->assertDatabaseHas( 'tasks', [
            'title' => 'Test Task',
            'status' => 'todo'
        ]);
    }
}
```

#### Test de Unidad
```php
// tests/Unit/TaskServiceTest.php
class TaskServiceTest extends TestCase
{
    public function test_creates_task_with_correct_status()
    {
        $service = new TaskService();
        $data = [
            'title' => 'Test',
            'vault_id' => 1
        ];
        
        $task = $service->createTask( $data, 1 );
        
        $this->assertEquals( 'todo', $task->status );
        $this->assertEquals( 'Test', $task->title );
    }
}
```

### Frontend - Jest

#### Test de Hook
```javascript
// src/__tests__/useTasks.test.js
import { renderHook, act } from '@testing-library/react';
import useTasks from '../hooks/useTasks';

describe( 'useTasks', () => {
    test( 'should create task successfully', async() => {
        const { result } = renderHook( () => useTasks( 1 ) );
        
        await act( async() => {
            const response = await result.current.createTask({
                title: 'Test Task',
                description: 'Test Description'
            });
            
            expect( response.success ).toBe( true );
            expect( response.task.title ).toBe( 'Test Task' );
        });
    });
});
```

#### Test de Componente
```javascript
// src/__tests__/TaskCard.test.js
import { render, fireEvent, screen } from '@testing-library/react';
import TaskCard from '../components/TaskCard/TaskCard';

describe( 'TaskCard', () => {
    const mockTask = {
        task_id2: 'ABC123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo'
    };
    
    test( 'renders task information', () => {
        render( <TaskCard task={mockTask} /> );
        
        expect( screen.getByText( 'Test Task' ) ).toBeInTheDocument();
        expect( screen.getByText( 'Test Description' ) ).toBeInTheDocument();
    });
    
    test( 'calls onEdit when edit button clicked', () => {
        const onEdit = jest.fn();
        render( <TaskCard task={mockTask} onEditTask={onEdit} /> );
        
        fireEvent.click( screen.getByText( 'Editar' ) );
        expect( onEdit ).toHaveBeenCalledWith( mockTask );
    });
});
```

### Ejecutar Tests
```bash
# Backend
php artisan test
php artisan test --filter TaskControllerTest

# Frontend
npm test
npm test -- --coverage
```

---

## Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión Base de Datos
```bash
# Verificar conexión
docker-compose exec synaps-back php artisan tinker
> DB::connection()->getPdo();

# Reiniciar servicios
docker-compose restart synaps-db synaps-back
```

#### 2. Token JWT Inválido
```javascript
// Verificar token en localStorage
console.log( localStorage.getItem( 'auth_token' ) );

// Limpiar token
localStorage.removeItem( 'auth_token' );
```

#### 3. Error CORS
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_headers' => ['*'],
```

#### 4. Cache Issues
```bash
# Laravel
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# React
rm -rf node_modules/.cache
npm start
```

### Logs Importantes

#### Backend Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Docker logs
docker-compose logs -f synaps-back
```

#### Frontend Console
```javascript
// Habilitar debugging
localStorage.setItem( 'debug', 'true' );

// Verificar estado Redux/Context
console.log( 'App State:', appState );
```

### Performance Monitoring

#### Database Queries
```php
// En desarrollo - ver queries
DB::enableQueryLog();
// ... código ...
dd( DB::getQueryLog() );
```

#### Frontend Performance
```javascript
// React DevTools Profiler
// Network tab en Chrome DevTools
// Lighthouse audit
```

---

## Comandos Útiles

### Laravel
```bash
# Artisan
php artisan migrate
php artisan migrate:rollback
php artisan make:controller TaskController
php artisan make:model Task -m
php artisan make:service TaskService
php artisan route:list
php artisan queue:work
php artisan cache:clear

# Composer
composer install
composer dump-autoload
composer require package/name
```

### React
```bash
# NPM/PNPM
npm install
npm start
npm run build
npm test
pnpm install
pnpm dev

# Debugging
npm run analyze
npm run lint
```

### Docker
```bash
# Compose
docker-compose up -d
docker-compose down
docker-compose logs -f service-name
docker-compose exec service-name bash

# Images
docker build -t synaps-back .
docker images
docker rmi image-id
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/task-management
git add .
git commit -m "feat: implement task CRUD operations"
git push origin feature/task-management

# Code review y merge
git checkout main
git pull origin main
git merge feature/task-management
```

---

## Guía de Debug

### Herramientas de Debugging

#### Backend (Laravel)
```bash
# Habilitar modo debug
APP_DEBUG=true

# Ver queries SQL en tiempo real
php artisan tinker
DB::listen(function ($query) {
    echo $query->sql . "\n";
    print_r($query->bindings);
});

# Logs de Laravel
tail -f storage/logs/laravel.log

# Debug en tiempo real
php artisan make:command DebugCommand
```

#### Frontend (React)
```javascript
// React DevTools para inspeccionar componentes
// React DevTools Profiler para performance

// Debug de hooks personalizados
const useTasks = ( vaultId ) => {
    const [tasks, setTasks] = useState( [] );
    
    // Debug: log cambios en el estado
    useEffect( () => {
        if( process.env.NODE_ENV === 'development' ) {
            console.log( 'Tasks updated:', tasks );
        }
    }, [tasks]);
    
    return { tasks, setTasks };
};

// Debug de renders innecesarios
const TaskCard = React.memo(({ task }) => {
    if( process.env.NODE_ENV === 'development' ) {
        console.log( 'TaskCard rendered for:', task.task_id2 );
    }
    
    return <div>{task.title}</div>;
});
```

### Debugging de Errores Específicos

#### Error "Tarea no encontrada"
```php
// En TaskController.php - agregar logging detallado
public function destroy( Request $request, $task_id2 ): JsonResponse
{
    try {
        $auth_result = AuthHelper::getAuthenticatedUserId();
        if( $auth_result['error_response'] ) {
            Log::error( 'Auth failed in task deletion', ['task_id2' => $task_id2] );
            return $auth_result['error_response'];
        }

        $user_id = $auth_result['user_id'];
        $user_db = DatabaseHelper::connect( $user_id );
        Model::setConnectionName( $user_db );
        
        // Debug: verificar que la tarea existe antes de eliminar
        $task = Task::where( 'task_id2', $task_id2 )->first();
        if( !$task ) {
            Log::error( 'Task not found', [
                'task_id2' => $task_id2,
                'user_id' => $user_id,
                'connection' => $user_db
            ]);
            return response()->json([
                'result' => 0,
                'message' => 'Tarea no encontrada'
            ], 404);
        }
        
        Log::info( 'Task found, proceeding with deletion', [
            'task_id' => $task->task_id,
            'task_id2' => $task->task_id2,
            'title' => $task->title
        ]);
        
        $result = $this->taskService->deleteTask( $task_id2, $user_id );
        
        return response()->json([
            'result' => 1,
            'message' => 'Tarea eliminada correctamente'
        ]);
        
    } catch( Exception $e ) {
        Log::error( 'Exception in task deletion', [
            'task_id2' => $task_id2,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'result' => 0,
            'message' => 'Error interno del servidor'
        ], 500);
    }
}
```

#### Debug de Conexiones de Base de Datos
```php
// En DatabaseHelper.php
public static function connect( ?int $tenant_id = null ): string
{
    $value = config( 'database.default' );

    if( $tenant_id === null ) {
        Log::info( 'Using default connection', ['connection' => $value] );
        return $value;
    }

    $tenant_database = 'synaps_' . str_pad( $tenant_id, 4, '0', STR_PAD_LEFT );
    
    // Debug: verificar que la configuración existe
    if( !config( "database.connections.{$tenant_database}" ) ) {
        Log::error( 'Tenant database config not found', [
            'tenant_id' => $tenant_id,
            'database' => $tenant_database
        ]);
    }
    
    $value = $tenant_database;
    Log::info( 'Using tenant connection', [
        'tenant_id' => $tenant_id,
        'connection' => $value
    ]);
    
    return $value;
}
```

---

## Mejores Prácticas

### Desarrollo Frontend

#### Gestión de Estados
```javascript
// Usar React Context para estados globales
const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState( null );
    const [vault, setVault] = useState( null );
    
    return (
        <AppContext.Provider value={{ user, setUser, vault, setVault }}>
            {children}
        </AppContext.Provider>
    );
};

// Hooks personalizados para lógica reutilizable
const useAuth = () => {
    const { user, setUser } = useContext( AppContext );
    
    const login = useCallback( async( credentials ) => {
        let value = { success: false, message: '' };
        
        try {
            const response = await http_post( '/auth/login', credentials );
            if( response.result === 1 ) {
                setUser( response.data.user );
                localStorage.setItem( 'auth_token', response.data.token );
                value = { success: true, user: response.data.user };
            } else {
                value = { success: false, message: response.message };
            }
        } catch( error ) {
            value = { success: false, message: 'Error de conexión' };
        }
        
        return value;
    }, [setUser]);
    
    return { user, login };
};
```

#### Optimización de Performance
```javascript
// Lazy loading de componentes
const TaskBoard = lazy( () => import( './components/TaskBoard' ) );
const NoteEditor = lazy( () => import( './components/NoteEditor' ) );

// Memoización de componentes costosos
const TaskList = React.memo(({ tasks, onTaskUpdate }) => {
    return (
        <div>
            {tasks.map( task => (
                <TaskCard 
                    key={task.task_id2} 
                    task={task} 
                    onUpdate={onTaskUpdate}
                />
            ))}
        </div>
    );
});

// Debounce para búsquedas
const useDebounce = ( value, delay ) => {
    const [debouncedValue, setDebouncedValue] = useState( value );

    useEffect( () => {
        const handler = setTimeout( () => {
            setDebouncedValue( value );
        }, delay);

        return () => {
            clearTimeout( handler );
        };
    }, [value, delay]);

    return debouncedValue;
};
```

### Desarrollo Backend

#### Validación de Datos
```php
// Form Requests personalizados
class CreateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'priority' => 'required|in:low,medium,high',
            'vault_id' => 'required|integer|exists:vaults,vault_id'
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio',
            'priority.in' => 'La prioridad debe ser: low, medium o high',
            'vault_id.exists' => 'El vault especificado no existe'
        ];
    }
}
```

#### Manejo de Transacciones
```php
class TaskService
{
    public function createTask( array $data, int $userId ): array
    {
        try {
            return DB::transaction( function () use ( $data, $userId ) {
                $task = Task::create([
                    'task_id2' => Str::random( 10 ),
                    'title' => $data['title'],
                    'description' => $data['description'] ?? '',
                    'priority' => $data['priority'],
                    'status' => 'todo',
                    'vault_id' => $data['vault_id'],
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Actualizar estadísticas del vault
                $vault = Vault::findOrFail( $data['vault_id'] );
                $vault->increment( 'task_count' );

                return [
                    'success' => true,
                    'task' => $task
                ];
            });
        } catch( Exception $e ) {
            Log::error( 'Error creating task', [
                'user_id' => $userId,
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => 'Error al crear la tarea'
            ];
        }
    }
}
```

### Seguridad

#### Validación de Autorización
```php
class TaskController extends Controller
{
    private function validateTaskAccess( string $task_id2, int $user_id ): Task
    {
        $task = Task::where( 'task_id2', $task_id2 )->first();
        
        if( !$task ) {
            throw new ModelNotFoundException( 'Tarea no encontrada' );
        }
        
        // Verificar que la tarea pertenece al usuario
        if( $task->user_id !== $user_id ) {
            throw new UnauthorizedException( 'No tienes permisos para acceder a esta tarea' );
        }
        
        return $task;
    }
}
```

#### Sanitización de Datos
```javascript
// Frontend - sanitizar datos antes de enviar
const sanitizeTaskData = ( taskData ) => {
    return {
        title: taskData.title?.trim().substring( 0, 255 ),
        description: taskData.description?.trim().substring( 0, 1000 ),
        priority: ['low', 'medium', 'high'].includes( taskData.priority ) 
            ? taskData.priority 
            : 'medium'
    };
};
```

---

## Resolución de Errores Específicos

### Error "CORS blocked"
```javascript
// Verificar configuración en config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

### Error "Token JWT inválido"
```javascript
// Frontend - verificar y renovar token
const checkTokenValidity = async() => {
    const token = localStorage.getItem( 'auth_token' );
    
    if( !token ) {
        window.location.href = '/login';
        return false;
    }
    
    try {
        const response = await http_get( '/auth/verify' );
        if( response.result !== 1 ) {
            localStorage.removeItem( 'auth_token' );
            window.location.href = '/login';
            return false;
        }
        return true;
    } catch( error ) {
        localStorage.removeItem( 'auth_token' );
        window.location.href = '/login';
        return false;
    }
};
```

### Error "Connection refused" (Docker)
```bash
# Verificar que todos los servicios están corriendo
docker-compose ps

# Reiniciar servicios específicos
docker-compose restart synaps-back
docker-compose restart synaps-db

# Ver logs en tiempo real
docker-compose logs -f synaps-back

# Verificar conectividad de red
docker-compose exec synaps-back ping synaps-db
```

### Error "Class not found" (Laravel)
```bash
# Regenerar autoload
composer dump-autoload

# Limpiar cache de configuración
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Verificar namespace en composer.json
"autoload": {
    "psr-4": {
        "App\\": "app/",
        "Database\\Factories\\": "database/factories/",
        "Database\\Seeders\\": "database/seeders/"
    }
}
```

### Error "useState not updating immediately"
```javascript
// React - el estado se actualiza de forma asíncrona
const [count, setCount] = useState( 0 );

// Incorrecto
const handleClick = () => {
    setCount( count + 1 );
    console.log( count ); // Mostrará el valor anterior
};

// Correcto
const handleClick = () => {
    setCount( prevCount => {
        const newCount = prevCount + 1;
        console.log( newCount ); // Mostrará el valor nuevo
        return newCount;
    });
};

// O usar useEffect para reaccionar a cambios
useEffect( () => {
    console.log( 'Count updated:', count );
}, [count]);
```

### Error "Memory limit exceeded" (PHP)
```php
// En .env o php.ini
memory_limit=512M

// O en código específico
ini_set( 'memory_limit', '512M' );

// Optimizar consultas de base de datos
// En lugar de:
$tasks = Task::with( 'vault.user' )->get();

// Usar:
$tasks = Task::select( 'task_id', 'title', 'status' )
    ->limit( 100 )
    ->get();
```

---
