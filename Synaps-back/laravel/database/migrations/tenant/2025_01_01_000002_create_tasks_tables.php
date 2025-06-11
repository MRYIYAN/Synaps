<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabla principal de tareas
        Schema::create('tasks', function (Blueprint $table) {
            $table->id('task_id');
            $table->string('task_id2', 32)->unique();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('status', ['todo', 'in-progress', 'done'])->default('todo');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->integer('vault_id');
            $table->integer('folder_id')->nullable();
            $table->integer('assigned_to')->nullable();
            $table->integer('created_by');
            $table->dateTime('due_date')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent();
            $table->dateTime('deleted_at')->nullable();

            // Índices
            $table->index('task_id2');
            $table->index(['vault_id', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('created_by');
            $table->index('folder_id');
            $table->index('due_date');
        });

        // Tabla de etiquetas para tareas
        Schema::create('task_tags', function (Blueprint $table) {
            $table->id('tag_id');
            $table->string('tag_id2', 32)->unique();
            $table->string('name', 50);
            $table->string('color', 7)->default('#F56E0F');
            $table->integer('vault_id');
            $table->dateTime('created_at')->useCurrent();

            // Índices y constraints
            $table->index('tag_id2');
            $table->unique(['name', 'vault_id']);
        });

        // Tabla de relación muchos a muchos para etiquetas
        Schema::create('task_tag_relations', function (Blueprint $table) {
            $table->integer('task_id');
            $table->integer('tag_id');
            $table->dateTime('created_at')->useCurrent();

            $table->primary(['task_id', 'tag_id']);
        });

        // Tabla de comentarios en tareas
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id('comment_id');
            $table->string('comment_id2', 32)->unique();
            $table->integer('task_id');
            $table->integer('user_id');
            $table->text('content');
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent();
            $table->dateTime('deleted_at')->nullable();

            // Índices
            $table->index('comment_id2');
            $table->index(['task_id', 'created_at']);
            $table->index('user_id');
        });

        // Tabla de archivos adjuntos
        Schema::create('task_attachments', function (Blueprint $table) {
            $table->id('attachment_id');
            $table->string('attachment_id2', 32)->unique();
            $table->integer('task_id');
            $table->string('original_name', 255);
            $table->string('stored_name', 255);
            $table->string('file_path', 500);
            $table->string('mime_type', 100);
            $table->bigInteger('file_size');
            $table->integer('uploaded_by');
            $table->dateTime('created_at')->useCurrent();

            // Índices
            $table->index('attachment_id2');
            $table->index('task_id');
            $table->index('uploaded_by');
        });

        // Tabla de historial de cambios (auditoría)
        Schema::create('task_history', function (Blueprint $table) {
            $table->id('history_id');
            $table->integer('task_id');
            $table->integer('user_id');
            $table->enum('action', ['created', 'updated', 'status_changed', 'assigned', 'commented', 'deleted']);
            $table->string('field_changed', 50)->nullable();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->dateTime('created_at')->useCurrent();

            // Índices
            $table->index(['task_id', 'created_at']);
            $table->index(['user_id', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_history');
        Schema::dropIfExists('task_attachments');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('task_tag_relations');
        Schema::dropIfExists('task_tags');
        Schema::dropIfExists('tasks');
    }
};
