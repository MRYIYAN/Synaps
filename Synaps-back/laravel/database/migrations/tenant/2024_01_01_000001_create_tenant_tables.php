<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Esta migración crea las tablas básicas para cada tenant/usuario
     * Incluye tablas para proyectos, archivos, configuraciones, etc.
     */
    public function up(): void
    {
        // Tabla de proyectos del usuario
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->json('settings')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
        });

        // Tabla de archivos del usuario
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->string('name')->index();
            $table->string('path');
            $table->string('type'); // markdown, text, etc.
            $table->longText('content')->nullable();
            $table->string('status')->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->index(['project_id', 'status']);
            $table->index(['type', 'created_at']);
        });

        // Tabla de configuraciones del usuario
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, json, boolean, etc.
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index(['key', 'type']);
        });

        // Tabla de historial/versiones de archivos
        Schema::create('file_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('file_id');
            $table->integer('version_number');
            $table->longText('content');
            $table->string('change_description')->nullable();
            $table->timestamps();
            
            $table->foreign('file_id')->references('id')->on('files')->onDelete('cascade');
            $table->index(['file_id', 'version_number']);
            $table->unique(['file_id', 'version_number']);
        });

        // Tabla de etiquetas/tags
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('color')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index('name');
        });

        // Tabla de relación entre archivos y etiquetas
        Schema::create('file_tags', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('file_id');
            $table->unsignedBigInteger('tag_id');
            $table->timestamps();
            
            $table->foreign('file_id')->references('id')->on('files')->onDelete('cascade');
            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');
            $table->unique(['file_id', 'tag_id']);
        });

        // Tabla de colaboradores/compartir (para futuras funcionalidades)
        Schema::create('collaborations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('file_id')->nullable();
            $table->string('shared_with_email');
            $table->string('permission_level'); // read, write, admin
            $table->string('status')->default('pending'); // pending, accepted, rejected
            $table->timestamps();
            
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('cascade');
            $table->index(['shared_with_email', 'status']);
        });

        // Tabla de actividad/logs del usuario
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // created, updated, deleted, etc.
            $table->string('entity_type'); // file, project, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['action', 'entity_type']);
            $table->index(['entity_type', 'entity_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('collaborations');
        Schema::dropIfExists('file_tags');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('file_versions');
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('files');
        Schema::dropIfExists('projects');
    }
};
