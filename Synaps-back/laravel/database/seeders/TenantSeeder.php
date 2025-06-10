<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TenantSeeder extends Seeder
{
    /**
     * Seed the application's database for a new tenant.
     * Este seeder inserta datos iniciales específicos para cada tenant/usuario.
     */
    public function run(): void
    {
        try {
            Log::info('🌱 TENANT_SEEDER: Iniciando seeding para tenant');

            // Insertar configuraciones por defecto
            $this->seedUserSettings();

            // Crear proyecto de bienvenida
            $this->seedWelcomeProject();

            // Insertar etiquetas por defecto
            $this->seedDefaultTags();

            Log::info('✅ TENANT_SEEDER: Seeding completado exitosamente');

        } catch (\Exception $e) {
            Log::error('❌ TENANT_SEEDER_ERROR: Error en seeding', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Insertar configuraciones por defecto del usuario
     */
    private function seedUserSettings(): void
    {
        $defaultSettings = [
            [
                'key' => 'theme',
                'value' => 'dark',
                'type' => 'string',
                'description' => 'Tema visual de la interfaz',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'editor_font_size',
                'value' => '14',
                'type' => 'integer',
                'description' => 'Tamaño de fuente del editor',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'auto_save',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Guardado automático de archivos',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'file_tree_expanded',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Estado del árbol de archivos',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'default_file_type',
                'value' => 'markdown',
                'type' => 'string',
                'description' => 'Tipo de archivo por defecto',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'workspace_layout',
                'value' => '{"sidebar": true, "preview": true, "width": "50%"}',
                'type' => 'json',
                'description' => 'Configuración de layout del workspace',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('user_settings')->insert($defaultSettings);
        
        Log::info('🌱 TENANT_SEEDER: Configuraciones por defecto insertadas', [
            'count' => count($defaultSettings)
        ]);
    }

    /**
     * Crear proyecto de bienvenida con archivos de ejemplo
     */
    private function seedWelcomeProject(): void
    {
        // Crear proyecto de bienvenida
        $projectId = DB::table('projects')->insertGetId([
            'name' => 'Bienvenido a Synaps',
            'description' => 'Proyecto de bienvenida con ejemplos y documentación',
            'status' => 'active',
            'settings' => json_encode([
                'color' => '#FF7F00',
                'icon' => 'welcome',
                'is_tutorial' => true
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Crear archivo de bienvenida
        $welcomeFileId = DB::table('files')->insertGetId([
            'project_id' => $projectId,
            'name' => 'README.md',
            'path' => '/Bienvenido a Synaps/README.md',
            'type' => 'markdown',
            'content' => $this->getWelcomeContent(),
            'status' => 'active',
            'metadata' => json_encode([
                'is_tutorial' => true,
                'language' => 'markdown',
                'size' => strlen($this->getWelcomeContent())
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Crear archivo de ejemplo de Markdown
        $exampleFileId = DB::table('files')->insertGetId([
            'project_id' => $projectId,
            'name' => 'Ejemplo-Markdown.md',
            'path' => '/Bienvenido a Synaps/Ejemplo-Markdown.md',
            'type' => 'markdown',
            'content' => $this->getMarkdownExampleContent(),
            'status' => 'active',
            'metadata' => json_encode([
                'is_example' => true,
                'language' => 'markdown',
                'size' => strlen($this->getMarkdownExampleContent())
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Log::info('🌱 TENANT_SEEDER: Proyecto de bienvenida creado', [
            'project_id' => $projectId,
            'files_created' => 2
        ]);
    }

    /**
     * Insertar etiquetas por defecto
     */
    private function seedDefaultTags(): void
    {
        $defaultTags = [
            [
                'name' => 'tutorial',
                'color' => '#3498db',
                'description' => 'Archivos de tutorial y ayuda',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'ejemplo',
                'color' => '#2ecc71',
                'description' => 'Archivos de ejemplo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'importante',
                'color' => '#e74c3c',
                'description' => 'Archivos importantes',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'proyecto',
                'color' => '#9b59b6',
                'description' => 'Archivos de proyecto',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'notas',
                'color' => '#f39c12',
                'description' => 'Notas personales',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('tags')->insert($defaultTags);
        
        Log::info('🌱 TENANT_SEEDER: Etiquetas por defecto insertadas', [
            'count' => count($defaultTags)
        ]);
    }

    /**
     * Contenido del archivo de bienvenida
     */
    private function getWelcomeContent(): string
    {
        return <<<MARKDOWN
# ¡Bienvenido a Synaps! 🚀

¡Felicidades! Has creado exitosamente tu cuenta en **Synaps**. Este es tu espacio personal donde podrás organizar, editar y gestionar todos tus proyectos y documentos.

## 🎯 ¿Qué es Synaps?

Synaps es una plataforma de edición y gestión de documentos que te permite:

- ✍️ **Editar Markdown** con vista previa en tiempo real
- 📁 **Organizar proyectos** y archivos de manera intuitiva
- 🔄 **Sincronizar** tu trabajo en la nube
- 🎨 **Personalizar** tu espacio de trabajo
- 📱 **Acceder** desde cualquier dispositivo

## 🚀 Primeros pasos

1. **Explora la interfaz**: Familiarízate con el panel lateral, el editor y la vista previa
2. **Crea tu primer proyecto**: Haz clic en "Nuevo Proyecto" para comenzar
3. **Añade archivos**: Crea documentos Markdown, notas o cualquier tipo de archivo de texto
4. **Personaliza**: Ajusta la configuración según tus preferencias

## 📚 Recursos útiles

- [Guía de Markdown](./Ejemplo-Markdown.md) - Aprende la sintaxis básica
- **Atajos de teclado**: `Ctrl+S` (guardar), `Ctrl+N` (nuevo archivo)
- **Configuración**: Accede a las opciones desde el menú de usuario

## 💡 Consejos

> **Tip**: Usa las etiquetas para organizar mejor tus archivos y encontrarlos rápidamente.

> **Tip**: El autoguardado está activado por defecto, así que no perderás tu trabajo.

---

¡Disfruta usando Synaps y no dudes en explorar todas las funcionalidades disponibles!

**¡Feliz escritura!** ✨
MARKDOWN;
    }

    /**
     * Contenido del archivo de ejemplo de Markdown
     */
    private function getMarkdownExampleContent(): string
    {
        return <<<MARKDOWN
# Guía de Markdown para Synaps

Esta es una guía básica de la sintaxis Markdown que puedes usar en Synaps.

## Encabezados

```markdown
# Encabezado 1
## Encabezado 2
### Encabezado 3
#### Encabezado 4
```

## Formato de texto

- **Texto en negrita** usando `**texto**`
- *Texto en cursiva* usando `*texto*`
- ~~Texto tachado~~ usando `~~texto~~`
- `Código inline` usando \`código\`

## Listas

### Lista no ordenada
- Elemento 1
- Elemento 2
  - Sub-elemento
  - Otro sub-elemento

### Lista ordenada
1. Primer elemento
2. Segundo elemento
3. Tercer elemento

## Enlaces y referencias

- [Enlace a Google](https://google.com)
- [Enlace interno](./README.md)

## Citas

> Esta es una cita en Markdown.
> Puede tener múltiples líneas.

## Código

### Bloque de código
\`\`\`javascript
function helloWorld() {
    console.log("¡Hola, Synaps!");
}
\`\`\`

### Código Python
\`\`\`python
def hello_synaps():
    print("¡Hola desde Python!")
\`\`\`

## Tablas

| Nombre | Edad | Ciudad |
|--------|------|--------|
| Ana    | 25   | Madrid |
| Carlos | 30   | Barcelona |
| Luis   | 28   | Valencia |

## Elementos extras

### Tareas
- [x] Tarea completada
- [ ] Tarea pendiente
- [ ] Otra tarea

### Línea horizontal
---

### Imágenes
![Alt text](https://via.placeholder.com/150 "Imagen de ejemplo")

## 💡 Consejos para Synaps

1. **Vista previa**: Usa la vista previa para ver cómo se renderiza tu Markdown
2. **Atajos**: `Ctrl+B` para negrita, `Ctrl+I` para cursiva
3. **Autocompletado**: Synaps sugiere sintaxis mientras escribes

¡Experimenta con estas funciones y crea documentos increíbles! 🚀
MARKDOWN;
    }
}
