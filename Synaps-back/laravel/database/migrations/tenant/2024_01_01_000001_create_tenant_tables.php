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
        // Crear tabla docs
        Schema::create('docs', function (Blueprint $table) {
            $table->id('doc_id');
            $table->string('doc_id2', 32);
            $table->string('doc_name', 255);
            $table->dateTime('insert_date');
            $table->index('doc_id2');
        });

        // Crear tabla folders_notes
        Schema::create('folders_notes', function (Blueprint $table) {
            $table->id('folder_id');
            $table->string('folder_id2', 32);
            $table->string('folder_title', 255);
            $table->integer('vault_id');
            $table->integer('parent_id');
            $table->integer('children_count');
            $table->index('folder_id2');
            $table->index('vault_id');
            $table->index('parent_id');
        });

        // Crear tabla log
        Schema::create('log', function (Blueprint $table) {
            $table->id('log_id');
            $table->string('log_id2', 32);
            $table->string('log_message', 255);
            $table->dateTime('insert_date');
            $table->index('log_id2');
        });

        // Crear tabla notes
        Schema::create('notes', function (Blueprint $table) {
            $table->id('note_id');
            $table->string('note_id2', 32);
            $table->integer('parent_id');
            $table->string('note_title', 255);
            $table->text('note_markdown');
            $table->integer('vault_id');
            $table->dateTime('insert_date');
            $table->dateTime('last_update_date');
            $table->index('note_id2');
            $table->index('parent_id');
            $table->index('vault_id');
        });

        // Crear tabla notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->string('notification_id2', 32);
            $table->text('notification_message');
            $table->dateTime('insert_date');
            $table->index('notification_id2');
        });

        // Crear tabla vaults
        Schema::create('vaults', function (Blueprint $table) {
            $table->id('vault_id');
            $table->string('vault_id2', 50);
            $table->string('vault_title', 255);
            $table->integer('user_id');
            $table->string('logical_path', 255);
            $table->boolean('is_private')->default(0);
            $table->dateTime('created_at')->useCurrent();
            $table->index('vault_id2');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaults');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('notes');
        Schema::dropIfExists('log');
        Schema::dropIfExists('folders_notes');
        Schema::dropIfExists('docs');
    }
};
