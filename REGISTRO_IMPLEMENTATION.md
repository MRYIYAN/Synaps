# Sistema de Registro - Synaps

## 📋 Implementación Completada

### 🏗️ **NUEVO: Sistema Multi-Tenant Automático**

A partir de ahora, **cada usuario registrado obtiene automáticamente su propia base de datos independiente**:

#### **Flujo Completo con Tenant:**
1. **Usuario se registra**
2. **Se crea usuario en BD principal**
3. **🆕 AUTOMÁTICO: Se crea BD tenant específica**
4. **🆕 Se ejecutan migraciones en BD tenant**
5. **🆕 Se insertan datos iniciales (proyecto bienvenida)**
6. **🆕 Se actualizan metadatos del tenant**

#### **Estructura de BD por Usuario:**
```
BD Principal: synaps_main
├── users (info básica usuarios)
├── configuración general
└── metadatos tenant

BD Tenant Ejemplo: synaps_tenant_abc123def456
├── projects (proyectos del usuario)
├── files (archivos y documentos)
├── user_settings (configuraciones personales)
├── file_versions (control de versiones)
├── tags (etiquetas personalizadas)
├── collaborations (compartir archivos)
└── activity_logs (historial de actividad)
```

#### **Datos Iniciales Automáticos:**
- 📁 **Proyecto "Bienvenido a Synaps"**
- 📄 **README.md** con guía de uso
- 📄 **Ejemplo-Markdown.md** con tutorial
- ⚙️ **Configuraciones por defecto** (tema, editor, etc.)
- 🏷️ **Etiquetas predefinidas** (tutorial, ejemplo, importante, etc.)

### 🔄 Flujo Completo del Sistema

#### 1. **Registro de Usuario (Frontend → Laravel)**
```mermaid
Frontend (React) → Laravel API → MySQL Database
```

**Paso a Paso:**
1. **Usuario completa formulario** en `RegisterForm.jsx`:
   - Nombre completo
   - Nombre de usuario  
   - Email
   - Contraseña (con confirmación)

2. **Frontend valida datos** en tiempo real:
   - Formato de email
   - Longitud de contraseña (mín. 6 caracteres)
   - Coincidencia de contraseñas
   - Caracteres especiales y emojis

3. **Frontend envía petición POST** a `http://localhost:8010/api/register`:
   ```javascript
   // Datos enviados
   {
     "name": "Usuario Test",
     "username": "test_user", 
     "email": "test@example.com",
     "password": "123456"
   }
   ```

4. **Laravel recibe petición** en `AuthController::register()`:
   - ✅ Valida campos requeridos
   - ✅ Verifica email único en BD
   - ✅ Cifra contraseña con bcrypt ($2y$)
   - ✅ Genera `user_id2` aleatorio (32 chars)

5. **Laravel inserta en MySQL**:
   ```sql
   INSERT INTO users (user_full_name, user_name, user_email, user_password, user_id2)
   VALUES ('Usuario Test', 'test_user', 'test@example.com', '$2y$...', 'abc123...')
   ```

6. **Laravel responde** con JSON:
   ```json
   {
     "result": 1,
     "message": "Usuario registrado exitosamente"
   }
   ```

7. **Frontend recibe respuesta** y redirige automáticamente a `/login` después de 3 segundos

#### 2. **Login de Usuario (Flask IDP)**
```mermaid
Frontend → Flask IDP → MySQL Database → Keycloak
```

**Flujo de Autenticación:**
1. **Usuario ingresa credenciales** en formulario de login
2. **Flask IDP valida** contra base de datos MySQL:
   - Verifica email en tabla `users`
   - Compara contraseña con hash bcrypt almacenado
3. **Si es válido**, Flask IDP genera token JWT
4. **Frontend recibe token** y puede acceder a rutas protegidas

### 📊 Campos del Registro y Mapeo
- **name** → se mapea a `user_full_name` (nombre completo)
- **username** → se mapea a `user_name` (nombre de usuario único)
- **email** → se mapea a `user_email` (correo electrónico único)
- **password** → se cifra con bcrypt y se mapea a `user_password`
- **user_id** → se auto-incrementa
- **user_id2** → se genera hash aleatorio de 32 caracteres

### 🔐 Seguridad
- Contraseñas cifradas con **bcrypt** ($2y$ compatible)
- Validación de unicidad de email
- Validación de campos requeridos
- Compatibilidad con Flask IDP para autenticación

### 🗄️ Estructura de Base de Datos
- **Tabla**: `users` en la base de datos `synaps`
- **Motor**: MySQL/MariaDB
- **Campos principales**:
  ```sql
  user_id (INT, AUTO_INCREMENT, PRIMARY KEY)
  user_id2 (VARCHAR(32), hash único)
  user_full_name (VARCHAR(255))
  user_name (VARCHAR(255), UNIQUE)
  user_email (VARCHAR(255), UNIQUE)
  user_password (VARCHAR(255), bcrypt hash)
  ```
- Hash de contraseña compatible con el sistema de autenticación existente
- Corrección en `init.sql` del campo `Nombre_completo` → `user_full_name`

### 🔧 Arquitectura del Sistema

#### Componentes Involucrados:
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend      │────│   Laravel API    │────│   MySQL DB      │
│   (React)       │    │   (Registro)     │    │   (usuarios)    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                │ (Login posterior)
                                ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │                  │    │                 │
                       │   Flask IDP      │────│   Keycloak      │
                       │   (Autenticación)│    │   (Tokens)      │
                       │                  │    │                 │
                       └──────────────────┘    └─────────────────┘
```

#### Tecnologías:
- **Frontend**: React.js con validaciones en tiempo real
- **Backend Registro**: Laravel 11 con Eloquent ORM
- **Backend Autenticación**: Flask con bcrypt
- **Base de Datos**: MySQL/MariaDB
- **Gestión de Tokens**: Keycloak
- **Logs**: Laravel Log system con archivos rotatorios

### 🚀 URL del Endpoint
```
POST http://localhost:8010/api/register
```

### 📝 Formato de Respuesta
```json
{
  "result": 1,
  "message": "Usuario registrado exitosamente"
}
```

### 🔄 Redirección
Después del registro exitoso, el frontend automáticamente redirige a `/login`

### 🛠️ Archivos Modificados e Implementación

#### Backend (Laravel):
1. **`AuthController.php`** - Método `register()` completo:
   - Validación de datos de entrada
   - Cifrado bcrypt de contraseñas
   - Inserción en base de datos
   - Logs extensivos para debugging
   - Manejo de errores y excepciones

2. **`User.php`** - Modelo actualizado:
   - Añadido `user_full_name` a array `fillable`
   - Eventos del modelo para tracking (creating, created, saving, saved)
   - Compatibilidad con autenticación Keycloak

3. **`routes/api.php`** - Ruta de registro:
   ```php
   Route::post('/register', [AuthController::class, 'register']);
   ```

#### Frontend (React):
4. **`RegisterForm.jsx`** - Formulario mejorado:
   - Logs detallados en consola del navegador
   - **Cuenta regresiva dinámica 3, 2, 1** antes de redireccionar
   - **Mensaje visual de éxito verde con icono** ✅
   - **Número de countdown circular animado con pulso** 🎯
   - **Mensaje de error rojo diferenciado** ❌ 
   - Validaciones en tiempo real extensivas
   - Estados separados para éxito y error
   - Interfaz clara y amigable para el usuario
   - **Enlace de navegación al login** para usuarios existentes

5. **`LoginForm.jsx`** - Formulario actualizado:
   - **Enlace de navegación al registro** para nuevos usuarios
   - Integración visual consistente con el sistema

#### Base de Datos:
5. **`init.sql`** - Esquema corregido:
   - Campo `Nombre_completo` → `user_full_name`
   - Compatibilidad con sistema existente

### 🔍 Sistema de Debugging Implementado

#### Logs del Backend (Laravel):
```bash
# Monitorear logs en tiempo real
tail -f storage/logs/laravel.log

# Logs específicos del registro
grep -E "🚀|📥|✅|🔧|🔗|💾|🎉|❌" storage/logs/laravel.log
```

**Tipos de logs incluidos:**
- 🚀 Inicio del proceso
- 📥 Datos recibidos del frontend  
- ✅ Validación exitosa
- 🔧 Preparación de datos
- 🔗 Verificación de conexión BD
- 💾 Inserción en base de datos
- 🎉 Registro exitoso / ❌ Errores
- 🏁 Finalización del proceso

#### Logs del Frontend (React):
- 📤 Datos enviados al servidor
- 📡 Petición HTTP iniciada
- 📨 Respuesta recibida del servidor
- ✅ **Mensaje de éxito visual**: Color verde (#4ade80) con icono de verificación
- ❌ **Mensaje de error visual**: Color rojo con fondo rojizo transparente
- 🔄 Redirección automática con temporizador de 3 segundos
- 🎨 **Mejoras de UI/UX**:
  - Separación clara entre icono y texto en mensajes
  - Padding adecuado para mejor legibilidad
  - Efectos de blur y transparencia para diseño moderno
  - Estados diferenciados para éxito y error

### 🧪 Pruebas y Validación

#### Para Probar el Sistema:
1. **Abrir consola del navegador** (F12 → Consola)
2. **Acceder al formulario de registro**
3. **Completar datos de prueba**:
   ```
   Nombre: "Usuario Test"
   Usuario: "test_user"
   Email: "test@example.com"
   Contraseña: "123456"
   ```
4. **Enviar formulario** y observar logs
5. **Verificar redirección** automática después de 3 segundos
6. **Comprobar inserción** en base de datos MySQL
7. **🆕 VERIFICAR BD TENANT** creada automáticamente

#### 🆕 Comandos de Gestión de Tenants:

```bash
# Listar todos los tenants del sistema
php artisan tenant:manage list

# Verificar estado de un tenant específico
php artisan tenant:manage check --user-id=abc123def456

# Crear BD tenant para usuario existente
php artisan tenant:manage create --user-id=abc123def456

# Recrear BD tenant (elimina y crea nueva)
php artisan tenant:manage recreate --user-id=abc123def456

# Crear BDs faltantes para usuarios sin tenant
php artisan tenant:manage create-missing

# Endpoint de diagnóstico del sistema
GET /api/diagnostic/tenant
```

#### 🆕 Verificación del Sistema Multi-Tenant:

```bash
# 1. Verificar que se creó la BD tenant
mysql -e "SHOW DATABASES LIKE 'synaps_tenant_%';"

# 2. Ver estructura de BD tenant
mysql -e "USE synaps_tenant_abc123def456; SHOW TABLES;"

# 3. Verificar datos iniciales
mysql -e "USE synaps_tenant_abc123def456; SELECT * FROM projects;"

# 4. Ver configuraciones por defecto
mysql -e "USE synaps_tenant_abc123def456; SELECT * FROM user_settings;"
```

