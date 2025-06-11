<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insertar etiquetas de ejemplo para tareas
        DB::table('task_tags')->insert([
            [
                'tag_id2' => strtoupper(bin2hex(random_bytes(16))),
                'name' => 'Urgente',
                'color' => '#FF4444',
                'vault_id' => 1,
                'created_at' => now()
            ],
            [
                'tag_id2' => strtoupper(bin2hex(random_bytes(16))),
                'name' => 'Importante',
                'color' => '#FF8800',
                'vault_id' => 1,
                'created_at' => now()
            ],
            [
                'tag_id2' => strtoupper(bin2hex(random_bytes(16))),
                'name' => 'Personal',
                'color' => '#4CAF50',
                'vault_id' => 1,
                'created_at' => now()
            ],
            [
                'tag_id2' => strtoupper(bin2hex(random_bytes(16))),
                'name' => 'Trabajo',
                'color' => '#2196F3',
                'vault_id' => 1,
                'created_at' => now()
            ],
            [
                'tag_id2' => strtoupper(bin2hex(random_bytes(16))),
                'name' => 'Ideas',
                'color' => '#9C27B0',
                'vault_id' => 1,
                'created_at' => now()
            ]
        ]);

        // Insertar tareas de ejemplo
        DB::table('tasks')->insert([
            [
                'task_id2' => strtoupper(bin2hex(random_bytes(16))),
                'title' => '¡Bienvenido al sistema de tareas!',
                'description' => "Esta es tu primera tarea en Synaps. Aquí puedes organizar todos tus pendientes y proyectos.\n\n## Funcionalidades principales:\n- ✅ Crear tareas con diferentes prioridades\n- 🏷️ Organizar con etiquetas\n- 📂 Agrupar por carpetas\n- 💬 Añadir comentarios\n- 📎 Adjuntar archivos\n\n¡Explora todas las funcionalidades!",
                'status' => 'todo',
                'priority' => 'high',
                'vault_id' => 1,
                'folder_id' => 1,
                'created_by' => 1,
                'due_date' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'task_id2' => strtoupper(bin2hex(random_bytes(16))),
                'title' => 'Organizar mi espacio de trabajo',
                'description' => 'Configurar las carpetas y estructura inicial para mis proyectos.',
                'status' => 'todo',
                'priority' => 'medium',
                'vault_id' => 1,
                'folder_id' => 1,
                'created_by' => 1,
                'due_date' => now()->addDays(3),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'task_id2' => strtoupper(bin2hex(random_bytes(16))),
                'title' => 'Tarea de ejemplo completada',
                'description' => 'Esta tarea muestra cómo se ve una tarea completada en el sistema.',
                'status' => 'done',
                'priority' => 'low',
                'vault_id' => 1,
                'folder_id' => 1,
                'created_by' => 1,
                'completed_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'task_id2' => strtoupper(bin2hex(random_bytes(16))),
                'title' => 'Tarea sin descripción',
                'description' => null, // Ejemplo de descripción nula
                'status' => 'todo',
                'priority' => 'low',
                'vault_id' => 1,
                'folder_id' => 1,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Insertar relaciones de etiquetas con tareas
        DB::table('task_tag_relations')->insert([
            [
                'task_id' => 1,
                'tag_id' => 2, // Importante
                'created_at' => now()
            ],
            [
                'task_id' => 1,
                'tag_id' => 5, // Ideas
                'created_at' => now()
            ],
            [
                'task_id' => 2,
                'tag_id' => 4, // Trabajo
                'created_at' => now()
            ],
            [
                'task_id' => 3,
                'tag_id' => 3, // Personal
                'created_at' => now()
            ],
            [
                'task_id' => 4,
                'tag_id' => 1, // Urgente - para la tarea sin descripción
                'created_at' => now()
            ]
        ]);

        // Insertar comentario de ejemplo
        DB::table('task_comments')->insert([
            [
                'comment_id2' => strtoupper(bin2hex(random_bytes(16))),
                'task_id' => 1,
                'user_id' => 1,
                'content' => '¡Perfecto! Ya tienes tu primer comentario en una tarea. Los comentarios son ideales para hacer seguimiento del progreso.',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
