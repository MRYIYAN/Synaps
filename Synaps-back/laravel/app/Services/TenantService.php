<?php

//===========================================================================//
//                             TENANT SERVICE                               //
//===========================================================================//
//----------------------------------------------------------------------------//
//  Este servicio maneja la creación de bases de datos por tenant.          //
//  Cada usuario registrado tendrá su propia base de datos independiente.    //
//----------------------------------------------------------------------------//

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

/**
 * Servicio responsable de la gestión de tenants en Synaps.
 */
class TenantService
{
    /**
     * Prefijo para las bases de datos de tenants
     */
    private const DB_PREFIX = 'synaps_';

    /**
     * Crear una nueva base de datos para un tenant
     *
     * @param string $userId ID único del usuario/tenant
     * @param string $userEmail Email del usuario para logs
     * @return bool
     * @throws Exception
     */
    public function createTenantDatabase(string $userId, string $userEmail): bool
    {
        try {
            Log::info('🏗️ TENANT_DB_CREATE: Iniciando creación de BD tenant', [
                'user_id' => $userId,
                'user_email' => $userEmail
            ]);

            // Generar nombre de la base de datos con 4 números aleatorios
            $dbName = $this->generateDatabaseName();
            
            Log::info('🏗️ TENANT_DB_NAME: Nombre de BD generado', [
                'db_name' => $dbName,
                'user_id' => $userId
            ]);

            // Crear la base de datos
            $this->createDatabase($dbName);

            // Crear estructura igual a synaps_0001
            $this->createTenantStructure($dbName);

            // Insertar datos de ejemplo (vault y notas)
            $this->seedTenantData($dbName, $userId, $userEmail);

            // Actualizar información del tenant en la tabla de usuarios
            $this->updateUserTenantInfo($userId, $dbName);

            Log::info('✅ TENANT_DB_SUCCESS: BD tenant creada exitosamente', [
                'db_name' => $dbName,
                'user_id' => $userId,
                'user_email' => $userEmail
            ]);

            return true;

        } catch (Exception $e) {
            Log::error('❌ TENANT_DB_ERROR: Error creando BD tenant', [
                'user_id' => $userId,
                'user_email' => $userEmail,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Generar nombre único para la base de datos del tenant con 4 números aleatorios
     *
     * @return string
     */
    private function generateDatabaseName(): string
    {
        // Generar 4 números aleatorios
        $randomNumbers = sprintf('%04d', mt_rand(0, 9999));
        
        return self::DB_PREFIX . $randomNumbers;
    }

    /**
     * Crear la base de datos físicamente
     *
     * @param string $dbName
     * @throws Exception
     */
    private function createDatabase(string $dbName): void
    {
        try {
            Log::info('🔨 TENANT_CREATE_DB: Creando base de datos', [
                'db_name' => $dbName
            ]);

            // Usar conexión administrativa para crear la BD
            $adminConnection = config('database.connections.mysql');
            
            DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            Log::info('✅ TENANT_CREATE_DB: Base de datos creada', [
                'db_name' => $dbName
            ]);

        } catch (Exception $e) {
            Log::error('❌ TENANT_CREATE_DB_ERROR: Error creando BD', [
                'db_name' => $dbName,
                'error' => $e->getMessage()
            ]);
            throw new Exception("Error creando la base de datos {$dbName}: " . $e->getMessage());
        }
    }

    /**
     * Crear la estructura de tablas igual a synaps_0001
     *
     * @param string $dbName
     * @throws Exception
     */
    private function createTenantStructure(string $dbName): void
    {
        try {
            Log::info('🏗️ TENANT_STRUCTURE: Creando estructura de tablas', [
                'db_name' => $dbName
            ]);

            // Usar la base de datos del tenant
            DB::statement("USE `{$dbName}`");

            // Crear tabla docs
            DB::statement("
                CREATE TABLE `docs` (
                  `doc_id` int(11) NOT NULL AUTO_INCREMENT,
                  `doc_id2` varchar(32) NOT NULL,
                  `doc_name` varchar(255) NOT NULL,
                  `insert_date` datetime NOT NULL,
                  PRIMARY KEY (`doc_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
            ");

            // Crear tabla folders_notes
            DB::statement("
                CREATE TABLE `folders_notes` (
                  `folder_id` int(11) NOT NULL AUTO_INCREMENT,
                  `folder_id2` varchar(32) NOT NULL,
                  `folder_title` varchar(255) NOT NULL,
                  `vault_id` int(11) NOT NULL,
                  `parent_id` int(11) NOT NULL,
                  `children_count` int(11) NOT NULL,
                  PRIMARY KEY (`folder_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
            ");

            // Crear tabla log
            DB::statement("
                CREATE TABLE `log` (
                  `log_id` int(11) NOT NULL AUTO_INCREMENT,
                  `log_id2` varchar(32) NOT NULL,
                  `log_message` varchar(255) NOT NULL,
                  `insert_date` datetime NOT NULL,
                  PRIMARY KEY (`log_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
            ");

            // Crear tabla notes
            DB::statement("
                CREATE TABLE `notes` (
                  `note_id` int(11) NOT NULL AUTO_INCREMENT,
                  `note_id2` varchar(32) NOT NULL,
                  `parent_id` int(11) NOT NULL,
                  `note_title` varchar(255) NOT NULL,
                  `note_markdown` text NOT NULL,
                  `vault_id` int(11) NOT NULL,
                  `insert_date` datetime NOT NULL,
                  `last_update_date` datetime NOT NULL,
                  PRIMARY KEY (`note_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
            ");

            // Crear tabla notifications
            DB::statement("
                CREATE TABLE `notifications` (
                  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
                  `notification_id2` varchar(32) NOT NULL,
                  `notification_message` text NOT NULL,
                  `insert_date` datetime NOT NULL,
                  PRIMARY KEY (`notification_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
            ");

            // Crear tabla vaults
            DB::statement("
                CREATE TABLE `vaults` (
                  `vault_id` int(11) NOT NULL AUTO_INCREMENT,
                  `vault_id2` char(50) NOT NULL,
                  `vault_title` varchar(255) NOT NULL,
                  `user_id` int(11) NOT NULL,
                  `logical_path` varchar(255) NOT NULL,
                  `is_private` tinyint(1) DEFAULT 0,
                  `created_at` datetime DEFAULT current_timestamp(),
                  PRIMARY KEY (`vault_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
            ");

            Log::info('✅ TENANT_STRUCTURE: Estructura de tablas creada', [
                'db_name' => $dbName
            ]);

        } catch (Exception $e) {
            Log::error('❌ TENANT_STRUCTURE_ERROR: Error creando estructura', [
                'db_name' => $dbName,
                'error' => $e->getMessage()
            ]);
            throw new Exception("Error creando estructura para {$dbName}: " . $e->getMessage());
        }
    }

    /**
     * Insertar datos de ejemplo en la base de datos del tenant
     *
     * @param string $dbName
     * @param string $userId
     * @param string $userEmail
     */
    private function seedTenantData(string $dbName, string $userId, string $userEmail): void
    {
        try {
            Log::info('🌱 TENANT_SEED: Insertando datos de ejemplo', [
                'db_name' => $dbName,
                'user_id' => $userId
            ]);

            // Usar la base de datos del tenant
            DB::statement("USE `{$dbName}`");

            // Insertar vault de ejemplo
            $vaultId2 = $this->generateRandomId(32);
            DB::statement("
                INSERT INTO `vaults` (`vault_id2`, `vault_title`, `user_id`, `logical_path`, `is_private`, `created_at`) 
                VALUES (?, 'Mi Primer Vault', 1, '/SynapsVaults/Mi_Primer_Vault', 0, NOW())
            ", [$vaultId2]);

            // Obtener el ID del vault insertado
            $vaultId = DB::select("SELECT vault_id FROM vaults WHERE vault_id2 = ?", [$vaultId2])[0]->vault_id;

            // Insertar carpetas de ejemplo
            $folders = [
                [
                    'folder_id2' => $this->generateRandomId(32),
                    'folder_title' => 'Bienvenida a Synaps',
                    'parent_id' => 0,
                    'vault_id' => $vaultId,
                    'children_count' => 3
                ],
                [
                    'folder_id2' => $this->generateRandomId(32),
                    'folder_title' => 'Mis Proyectos',
                    'parent_id' => 0,
                    'vault_id' => $vaultId,
                    'children_count' => 2
                ],
                [
                    'folder_id2' => $this->generateRandomId(32),
                    'folder_title' => 'Notas Personales',
                    'parent_id' => 0,
                    'vault_id' => $vaultId,
                    'children_count' => 2
                ]
            ];

            foreach ($folders as $folder) {
                DB::statement("
                    INSERT INTO `folders_notes` (`folder_id2`, `folder_title`, `parent_id`, `vault_id`, `children_count`) 
                    VALUES (?, ?, ?, ?, ?)
                ", [
                    $folder['folder_id2'],
                    $folder['folder_title'],
                    $folder['parent_id'],
                    $folder['vault_id'],
                    $folder['children_count']
                ]);
            }

            // Obtener IDs de las carpetas insertadas
            $folderIds = DB::select("SELECT folder_id, folder_title FROM folders_notes WHERE vault_id = ?", [$vaultId]);

            // Insertar notas de ejemplo
            $this->insertExampleNotes($vaultId, $folderIds);

            Log::info('✅ TENANT_SEED: Datos de ejemplo insertados', [
                'db_name' => $dbName,
                'user_id' => $userId,
                'vault_id' => $vaultId,
                'folders_count' => count($folders)
            ]);

        } catch (Exception $e) {
            Log::warning('⚠️ TENANT_SEED_WARNING: Error en seeding (no crítico)', [
                'db_name' => $dbName,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            // No lanzar excepción aquí ya que el seeding es opcional
        }
    }

    /**
     * Insertar notas de ejemplo en las carpetas
     *
     * @param int $vaultId
     * @param array $folderIds
     */
    private function insertExampleNotes(int $vaultId, array $folderIds): void
    {
        // Mapear carpetas por título para facilitar la inserción
        $folderMap = [];
        foreach ($folderIds as $folder) {
            $folderMap[$folder->folder_title] = $folder->folder_id;
        }

        $now = date('Y-m-d H:i:s');

        // Notas para "Bienvenida a Synaps"
        if (isset($folderMap['Bienvenida a Synaps'])) {
            $welcomeNotes = [
                [
                    'note_id2' => $this->generateRandomId(32),
                    'parent_id' => $folderMap['Bienvenida a Synaps'],
                    'note_title' => '¡Bienvenido a Synaps!',
                    'note_markdown' => "# ¡Bienvenido a Synaps! 🚀\n\n**Synaps** es tu plataforma personal para organizar ideas, proyectos y conocimiento.\n\n## ¿Qué puedes hacer aquí?\n\n- ✍️ **Escribir notas** en formato Markdown\n- 📁 **Organizar contenido** en vaults y carpetas\n- 🔄 **Sincronizar** tu trabajo en tiempo real\n- 🎨 **Personalizar** tu espacio de trabajo\n\n> \"La organización es la clave del éxito\" 💡\n\n## Primeros pasos\n\n1. Explora las carpetas en el panel lateral\n2. Crea tu primera nota personal\n3. Experimenta con el formato Markdown\n4. ¡Disfruta organizando tus ideas!\n\n---\n\n**¡Feliz escritura!** ✨",
                    'vault_id' => $vaultId,
                    'insert_date' => $now,
                    'last_update_date' => $now
                ],
                [
                    'note_id2' => $this->generateRandomId(32),
                    'parent_id' => $folderMap['Bienvenida a Synaps'],
                    'note_title' => 'Guía de Markdown',
                    'note_markdown' => "# Guía Rápida de Markdown\n\nMarkdown es un lenguaje de marcado ligero que te permite formatear texto de manera sencilla.\n\n## Formato Básico\n\n- **Negrita**: `**texto**` → **texto**\n- *Cursiva*: `*texto*` → *texto*\n- ~~Tachado~~: `~~texto~~` → ~~texto~~\n\n## Encabezados\n\n```markdown\n# Encabezado 1\n## Encabezado 2\n### Encabezado 3\n```\n\n## Listas\n\n### No ordenadas\n- Elemento 1\n- Elemento 2\n  - Sub-elemento\n\n### Ordenadas\n1. Primer elemento\n2. Segundo elemento\n3. Tercer elemento\n\n## Código\n\n`Código inline` o bloques:\n\n```javascript\nfunction saludo() {\n    console.log('¡Hola, Synaps!');\n}\n```\n\n## Enlaces y Citas\n\n[Enlace](https://ejemplo.com)\n\n> Esta es una cita importante\n\n## Tablas\n\n| Columna 1 | Columna 2 |\n|-----------|----------|\n| Dato 1    | Dato 2   |\n\n¡Experimenta con estos elementos! 🎯",
                    'vault_id' => $vaultId,
                    'insert_date' => $now,
                    'last_update_date' => $now
                ],
                [
                    'note_id2' => $this->generateRandomId(32),
                    'parent_id' => $folderMap['Bienvenida a Synaps'],
                    'note_title' => 'Atajos de Teclado',
                    'note_markdown' => "# Atajos de Teclado Útiles\n\nAcelera tu flujo de trabajo con estos atajos:\n\n## Edición\n- `Ctrl + S` - Guardar nota\n- `Ctrl + Z` - Deshacer\n- `Ctrl + Y` - Rehacer\n- `Ctrl + A` - Seleccionar todo\n\n## Formato\n- `Ctrl + B` - **Negrita**\n- `Ctrl + I` - *Cursiva*\n- `Ctrl + K` - Crear enlace\n\n## Navegación\n- `Ctrl + N` - Nueva nota\n- `Ctrl + F` - Buscar en nota\n- `Escape` - Cerrar búsqueda\n\n## Vista Previa\n- `Ctrl + P` - Alternar vista previa\n- `F11` - Pantalla completa\n\n> **Tip**: Practica estos atajos para ser más eficiente 🚀\n\n---\n\n¡Pronto los usarás sin pensar! 💪",
                    'vault_id' => $vaultId,
                    'insert_date' => $now,
                    'last_update_date' => $now
                ]
            ];

            foreach ($welcomeNotes as $note) {
                DB::statement("
                    INSERT INTO `notes` (`note_id2`, `parent_id`, `note_title`, `note_markdown`, `vault_id`, `insert_date`, `last_update_date`) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ", [
                    $note['note_id2'],
                    $note['parent_id'],
                    $note['note_title'],
                    $note['note_markdown'],
                    $note['vault_id'],
                    $note['insert_date'],
                    $note['last_update_date']
                ]);
            }
        }

        // Notas para "Mis Proyectos"
        if (isset($folderMap['Mis Proyectos'])) {
            $projectNotes = [
                [
                    'note_id2' => $this->generateRandomId(32),
                    'parent_id' => $folderMap['Mis Proyectos'],
                    'note_title' => 'Ideas de Proyectos',
                    'note_markdown' => "# Ideas de Proyectos 💡\n\nAquí puedes anotar todas tus ideas brillantes:\n\n## 🚀 Proyectos Tecnológicos\n- [ ] App móvil para gestión de tareas\n- [ ] Blog personal sobre programación\n- [ ] Sistema de automatización del hogar\n- [ ] Portfolio web responsive\n\n## 🎨 Proyectos Creativos\n- [ ] Diseño de logo personal\n- [ ] Serie de ilustraciones digitales\n- [ ] Podcast sobre tecnología\n- [ ] Canal de YouTube educativo\n\n## 📚 Proyectos de Aprendizaje\n- [ ] Curso de React avanzado\n- [ ] Certificación en AWS\n- [ ] Libro sobre productividad\n- [ ] Workshop de diseño UX\n\n## 💼 Proyectos Profesionales\n- [ ] Mejorar CV y LinkedIn\n- [ ] Red de contactos profesionales\n- [ ] Presentación para conferencia\n- [ ] Artículo técnico para blog corporativo\n\n---\n\n> \"Las grandes cosas nunca vienen de las zonas de confort\" 🌟\n\n**Próximo paso**: Elige un proyecto y crea un plan detallado 📋",
                    'vault_id' => $vaultId,
                    'insert_date' => $now,
                    'last_update_date' => $now
                ],
                [
                    'note_id2' => $this->generateRandomId(32),
                    'parent_id' => $folderMap['Mis Proyectos'],
                    'note_title' => 'Metodología de Trabajo',
                    'note_markdown' => "# Metodología de Trabajo 🎯\n\n## Planificación de Proyectos\n\n### 1. Definición\n- **Objetivo**: ¿Qué quiero lograr?\n- **Alcance**: ¿Qué incluye y qué no?\n- **Tiempo**: ¿Cuándo debe estar listo?\n- **Recursos**: ¿Qué necesito?\n\n### 2. Desglose de Tareas\n```markdown\n- Tarea Principal\n  - Subtarea 1\n  - Subtarea 2\n    - Detalle específico\n```\n\n### 3. Priorización\n\n| Urgente | No Urgente |\n|---------|------------|\n| **Importante**: Hacer primero | **Importante**: Programar |\n| **No Importante**: Delegar | **No Importante**: Eliminar |\n\n### 4. Seguimiento\n\n#### Estados de Tareas\n- 🔴 **Bloqueado**: Requiere acción externa\n- 🟡 **En Progreso**: Trabajando activamente\n- 🟢 **Completado**: Finalizado y revisado\n- ⚪ **Pendiente**: Por comenzar\n\n### 5. Revisión\n\n**Preguntas clave:**\n- ¿Qué funcionó bien?\n- ¿Qué se puede mejorar?\n- ¿Qué he aprendido?\n\n---\n\n> \"El éxito es la suma de pequeños esfuerzos repetidos día tras día\" 💪",
                    'vault_id' => $vaultId,
                    'insert_date' => $now,
                    'last_update_date' => $now
                ]
            ];

            foreach ($projectNotes as $note) {
                DB::statement("
                    INSERT INTO `notes` (`note_id2`, `parent_id`, `note_title`, `note_markdown`, `vault_id`, `insert_date`, `last_update_date`) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ", [
                    $note['note_id2'],
                    $note['parent_id'],
                    $note['note_title'],
                    $note['note_markdown'],
                    $note['vault_id'],
                    $note['insert_date'],
                    $note['last_update_date']
                ]);
            }
        }

        // Notas para "Notas Personales"
        if (isset($folderMap['Notas Personales'])) {
            $personalNotes = [
                [
                    'note_id2' => $this->generateRandomId(32),
                    'parent_id' => $folderMap['Notas Personales'],
                    'note_title' => 'Reflexiones Diarias',
                    'note_markdown' => "# Reflexiones Diarias 🌅\n\n## ¿Por qué escribir reflexiones?\n\nEscribir reflexiones diarias te ayuda a:\n- 🧠 **Clarificar pensamientos**\n- 📈 **Hacer seguimiento del progreso**\n- 💡 **Generar nuevas ideas**\n- 🎯 **Mantener el enfoque**\n\n## Plantilla Diaria\n\n### Fecha: ___________\n\n#### ✨ 3 Cosas Positivas de Hoy\n1. \n2. \n3. \n\n#### 🎯 Logro Principal\n\n\n#### 🤔 Lección Aprendida\n\n\n#### 📋 Prioridades para Mañana\n- [ ] \n- [ ] \n- [ ] \n\n#### 💭 Reflexión Libre\n\n\n---\n\n> \"La reflexión es el camino hacia la sabiduría\" 🌟\n\n## Ideas para Reflexionar\n\n- ¿Qué me hizo sentir orgulloso hoy?\n- ¿Qué desafío superé?\n- ¿Cómo puedo mejorar mañana?\n- ¿Qué estoy agradecido de tener?\n- ¿Qué nueva habilidad estoy desarrollando?\n\n**Tip**: Dedica solo 5-10 minutos al final del día 🕐",
                    'vault_id' => $vaultId,
                    'insert_date' => $now,
                    'last_update_date' => $now
                ],
                [
                    'note_id2' => $this->generateRandomId(32),
                    'parent_id' => $folderMap['Notas Personales'],
                    'note_title' => 'Recursos Favoritos',
                    'note_markdown' => "# Recursos Favoritos 📚\n\n## 🌐 Sitios Web Útiles\n\n### Desarrollo\n- [Stack Overflow](https://stackoverflow.com) - Soluciones de programación\n- [GitHub](https://github.com) - Control de versiones y colaboración\n- [MDN Web Docs](https://developer.mozilla.org) - Documentación web\n\n### Diseño\n- [Figma](https://figma.com) - Diseño colaborativo\n- [Unsplash](https://unsplash.com) - Imágenes gratuitas de alta calidad\n- [Coolors](https://coolors.co) - Paletas de colores\n\n### Productividad\n- [Notion](https://notion.so) - Organización personal\n- [Todoist](https://todoist.com) - Gestión de tareas\n- [RescueTime](https://rescuetime.com) - Seguimiento de tiempo\n\n## 📖 Libros Recomendados\n\n### Tecnología\n- \"Clean Code\" - Robert C. Martin\n- \"The Pragmatic Programmer\" - Hunt & Thomas\n- \"Design Patterns\" - Gang of Four\n\n### Productividad\n- \"Getting Things Done\" - David Allen\n- \"Deep Work\" - Cal Newport\n- \"Atomic Habits\" - James Clear\n\n### Liderazgo\n- \"The 7 Habits\" - Stephen Covey\n- \"How to Win Friends\" - Dale Carnegie\n- \"Emotional Intelligence\" - Daniel Goleman\n\n## 🎧 Podcasts Interesantes\n\n- **Software Engineering Daily** - Tecnología\n- **The Tim Ferriss Show** - Productividad\n- **TED Talks Technology** - Innovación\n\n## 🎥 Canales de YouTube\n\n- **Traversy Media** - Tutoriales de programación\n- **TED** - Charlas inspiradoras\n- **Crash Course** - Educación general\n\n---\n\n> \"El aprendizaje nunca termina\" 📚✨\n\n**Nota**: Actualiza esta lista regularmente con nuevos descubrimientos 🔄",
                    'vault_id' => $vaultId,
                    'insert_date' => $now,
                    'last_update_date' => $now
                ]
            ];

            foreach ($personalNotes as $note) {
                DB::statement("
                    INSERT INTO `notes` (`note_id2`, `parent_id`, `note_title`, `note_markdown`, `vault_id`, `insert_date`, `last_update_date`) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ", [
                    $note['note_id2'],
                    $note['parent_id'],
                    $note['note_title'],
                    $note['note_markdown'],
                    $note['vault_id'],
                    $note['insert_date'],
                    $note['last_update_date']
                ]);
            }
        }
    }

    /**
     * Generar ID aleatorio de longitud específica
     *
     * @param int $length
     * @return string
     */
    private function generateRandomId(int $length = 32): string
    {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
    }

    /**
     * Verificar si existe la base de datos de un tenant
     *
     * @param string $userId
     * @return bool
     */
    public function tenantDatabaseExists(string $userId): bool
    {
        try {
            // Primero buscar en la tabla de usuarios si ya tiene asignada una BD
            $user = User::on('mysql')->where('user_id2', $userId)->first();
            
            if ($user && $user->tenant_database_name) {
                // Verificar si la BD realmente existe
                $result = DB::select("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?", [$user->tenant_database_name]);
                return !empty($result);
            }
            
            return false;

        } catch (Exception $e) {
            Log::error('❌ TENANT_DB_CHECK_ERROR: Error verificando BD tenant', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Obtener el nombre de la base de datos de un tenant
     *
     * @param string $userId
     * @return string
     */
    public function getTenantDatabaseName(string $userId): string
    {
        try {
            $user = User::on('mysql')->where('user_id2', $userId)->first();
            
            if ($user && $user->tenant_database_name) {
                return $user->tenant_database_name;
            }
            
            // Si no tiene BD asignada, generar el nombre que tendría
            return $this->generateDatabaseName();
            
        } catch (Exception $e) {
            Log::error('❌ TENANT_DB_NAME_ERROR: Error obteniendo nombre BD tenant', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return $this->generateDatabaseName();
        }
    }

    /**
     * Eliminar la base de datos de un tenant (para cleanup o testing)
     *
     * @param string $userId
     * @return bool
     */
    public function deleteTenantDatabase(string $userId): bool
    {
        try {
            $user = User::on('mysql')->where('user_id2', $userId)->first();
            
            if (!$user || !$user->tenant_database_name) {
                Log::warning('⚠️ TENANT_DELETE: Usuario sin BD tenant asignada', [
                    'user_id' => $userId
                ]);
                return false;
            }
            
            $dbName = $user->tenant_database_name;
            
            Log::info('🗑️ TENANT_DELETE: Eliminando BD tenant', [
                'db_name' => $dbName,
                'user_id' => $userId
            ]);

            DB::statement("DROP DATABASE IF EXISTS `{$dbName}`");
            
            // Limpiar información del tenant en la tabla de usuarios
            $user->update([
                'tenant_database_name' => null,
                'tenant_setup_completed' => false,
                'tenant_created_at' => null,
                'tenant_metadata' => null
            ]);
            
            Log::info('✅ TENANT_DELETE: BD tenant eliminada', [
                'db_name' => $dbName,
                'user_id' => $userId
            ]);

            return true;

        } catch (Exception $e) {
            Log::error('❌ TENANT_DELETE_ERROR: Error eliminando BD tenant', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Actualizar información del tenant en la tabla de usuarios
     *
     * @param string $userId
     * @param string $dbName
     */
    private function updateUserTenantInfo(string $userId, string $dbName): void
    {
        try {
            Log::info('📝 TENANT_UPDATE_USER: Actualizando info tenant en user', [
                'user_id' => $userId,
                'db_name' => $dbName
            ]);

            // Asegurarse de usar la conexión principal para buscar al usuario
            $user = User::on('mysql')->where('user_id2', $userId)->first();
            
            if ($user) {
                $user->update([
                    'tenant_database_name' => $dbName,
                    'tenant_setup_completed' => true,
                    'tenant_created_at' => now(),
                    'tenant_metadata' => json_encode([
                        'created_at' => now()->toISOString(),
                        'database_name' => $dbName,
                        'status' => 'active',
                        'version' => '1.0'
                    ])
                ]);

                Log::info('✅ TENANT_UPDATE_USER: Info tenant actualizada', [
                    'user_id' => $userId,
                    'db_name' => $dbName
                ]);
            } else {
                Log::warning('⚠️ TENANT_UPDATE_USER: Usuario no encontrado', [
                    'user_id' => $userId
                ]);
            }

        } catch (Exception $e) {
            Log::error('❌ TENANT_UPDATE_USER_ERROR: Error actualizando info tenant', [
                'user_id' => $userId,
                'db_name' => $dbName,
                'error' => $e->getMessage()
            ]);
            // No lanzar excepción aquí ya que es información adicional
        }
    }

    /**
     * Asegurar que un usuario tenga su base de datos tenant
     * Si no la tiene, la crea automáticamente
     *
     * @param string $userId
     * @param string $userEmail
     * @return bool
     */
    public function ensureTenantDatabase(string $userId, string $userEmail): bool
    {
        try {
            // Verificar si ya existe
            if ($this->tenantDatabaseExists($userId)) {
                Log::info('ENSURE_TENANT: BD tenant ya existe', [
                    'user_id' => $userId
                ]);
                return true;
            }

            // Crear automáticamente
            Log::info('ENSURE_TENANT: Creando BD tenant automáticamente', [
                'user_id' => $userId,
                'user_email' => $userEmail
            ]);

            return $this->createTenantDatabase($userId, $userEmail);

        } catch (Exception $e) {
            Log::error('ENSURE_TENANT_ERROR: Error asegurando BD tenant', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
