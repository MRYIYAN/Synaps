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
        // No hacer nada aquí ya que el init.sql ya incluye los datos iniciales
        // Este seeder se mantiene vacío para compatibilidad con el TenantService
    }
}
