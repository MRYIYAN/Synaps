<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DiagnosticController extends Controller
{
    public function checkDatabase(): JsonResponse
    {
        $result = [];
        
        try {
            // 1. Verificar conexión a la base de datos
            DB::connection()->getPdo();
            $result['connection'] = 'OK';
            
            // 2. Verificar si la tabla users existe
            $result['table_exists'] = Schema::hasTable('users');
            
            // 3. Obtener la estructura de la tabla
            if ($result['table_exists']) {
                $columns = DB::select("DESCRIBE users");
                $result['table_structure'] = $columns;
            }
            
            // 4. Contar registros existentes
            $result['user_count'] = DB::table('users')->count();
            
            // 5. Intentar hacer un SELECT simple
            $users = DB::table('users')->select('*')->limit(2)->get();
            $result['sample_users'] = $users;
            
            // 6. Verificar qué columnas tiene la tabla
            if ($result['table_exists']) {
                $result['has_user_id'] = Schema::hasColumn('users', 'user_id');
                $result['has_user_email'] = Schema::hasColumn('users', 'user_email');
                $result['has_user_name'] = Schema::hasColumn('users', 'user_name');
                $result['has_user_full_name'] = Schema::hasColumn('users', 'user_full_name');
                $result['has_user_password'] = Schema::hasColumn('users', 'user_password');
                $result['has_user_id2'] = Schema::hasColumn('users', 'user_id2');
                
                // Verificar columnas de Laravel estándar
                $result['has_id'] = Schema::hasColumn('users', 'id');
                $result['has_name'] = Schema::hasColumn('users', 'name');
                $result['has_email'] = Schema::hasColumn('users', 'email');
                $result['has_password'] = Schema::hasColumn('users', 'password');
            }
            
        } catch (\Exception $e) {
            $result['error'] = $e->getMessage();
        }
        
        return response()->json($result);
    }
    
    public function testInsert(): JsonResponse
    {
        $result = [];
        
        try {
            // Intentar inserción directa con DB::table()
            $inserted = DB::table('users')->insert([
                'user_id2' => 'TEST_' . time(),
                'user_email' => 'test_' . time() . '@example.com',
                'user_name' => 'test_user_' . time(),
                'user_full_name' => 'Test User Full Name',
                'user_password' => bcrypt('testpassword')
            ]);
            
            $result['direct_insert'] = $inserted ? 'SUCCESS' : 'FAILED';
            
            // Verificar que se insertó
            $lastUser = DB::table('users')->orderBy('user_id', 'desc')->first();
            $result['last_user'] = $lastUser;
            
        } catch (\Exception $e) {
            $result['insert_error'] = $e->getMessage();
        }
        
        return response()->json($result);
    }
    
    public function fixAutoIncrement(): JsonResponse
    {
        $result = [];
        
        try {
            // Aplicar el fix de AUTO_INCREMENT
            DB::statement('ALTER TABLE `users` MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2');
            
            $result['fix_applied'] = 'SUCCESS';
            
            // Verificar la estructura actualizada
            $columns = DB::select("DESCRIBE users");
            $result['updated_structure'] = $columns;
            
        } catch (\Exception $e) {
            $result['fix_error'] = $e->getMessage();
        }
        
        return response()->json($result);
    }
}
