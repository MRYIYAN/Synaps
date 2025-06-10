<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TenantService;
use App\Models\User;
use Exception;

class TenantManageCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:manage {action} {--user-id=} {--all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gestionar bases de datos de tenants';

    /**
     * TenantService instance
     */
    private TenantService $tenantService;

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
        $this->tenantService = new TenantService();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        $userId = $this->option('user-id');
        $all = $this->option('all');

        switch ($action) {
            case 'create':
                return $this->createTenantDatabase($userId);
            
            case 'delete':
                return $this->deleteTenantDatabase($userId);
            
            case 'list':
                return $this->listTenants();
            
            case 'check':
                return $this->checkTenantDatabase($userId);
            
            case 'recreate':
                return $this->recreateTenantDatabase($userId);
            
            case 'create-missing':
                return $this->createMissingTenantDatabases();
            
            default:
                $this->error("Acción no válida: {$action}");
                $this->info("Acciones disponibles: create, delete, list, check, recreate, create-missing");
                return 1;
        }
    }

    /**
     * Crear base de datos para un tenant específico
     */
    private function createTenantDatabase(?string $userId): int
    {
        if (!$userId) {
            $this->error('Se requiere --user-id para crear una BD de tenant');
            return 1;
        }

        try {
            $user = User::where('user_id2', $userId)->first();
            if (!$user) {
                $this->error("Usuario no encontrado: {$userId}");
                return 1;
            }

            $this->info("Creando BD tenant para usuario: {$user->user_email}");
            
            if ($this->tenantService->tenantDatabaseExists($userId)) {
                $this->warn("La BD tenant ya existe para este usuario");
                return 0;
            }

            $this->tenantService->createTenantDatabase($userId, $user->user_email);
            $this->info("✅ BD tenant creada exitosamente");
            
            return 0;

        } catch (Exception $e) {
            $this->error("Error creando BD tenant: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Eliminar base de datos de un tenant específico
     */
    private function deleteTenantDatabase(?string $userId): int
    {
        if (!$userId) {
            $this->error('Se requiere --user-id para eliminar una BD de tenant');
            return 1;
        }

        try {
            $user = User::where('user_id2', $userId)->first();
            if (!$user) {
                $this->error("Usuario no encontrado: {$userId}");
                return 1;
            }

            if (!$this->tenantService->tenantDatabaseExists($userId)) {
                $this->warn("La BD tenant no existe para este usuario");
                return 0;
            }

            if (!$this->confirm("¿Estás seguro de eliminar la BD tenant para {$user->user_email}?")) {
                $this->info("Operación cancelada");
                return 0;
            }

            $this->tenantService->deleteTenantDatabase($userId);
            $this->info("✅ BD tenant eliminada exitosamente");
            
            return 0;

        } catch (Exception $e) {
            $this->error("Error eliminando BD tenant: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Listar todos los tenants
     */
    private function listTenants(): int
    {
        try {
            $users = User::all();
            
            $this->info("Lista de tenants en el sistema:");
            $this->table(
                ['User ID', 'Email', 'Name', 'BD Tenant', 'Estado'],
                $users->map(function ($user) {
                    $dbExists = $this->tenantService->tenantDatabaseExists($user->user_id2);
                    $dbName = $this->tenantService->getTenantDatabaseName($user->user_id2);
                    
                    return [
                        $user->user_id2,
                        $user->user_email,
                        $user->user_full_name,
                        $dbName,
                        $dbExists ? '✅ Existe' : '❌ No existe'
                    ];
                })
            );

            return 0;

        } catch (Exception $e) {
            $this->error("Error listando tenants: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Verificar estado de la BD de un tenant
     */
    private function checkTenantDatabase(?string $userId): int
    {
        if (!$userId) {
            $this->error('Se requiere --user-id para verificar una BD de tenant');
            return 1;
        }

        try {
            $user = User::where('user_id2', $userId)->first();
            if (!$user) {
                $this->error("Usuario no encontrado: {$userId}");
                return 1;
            }

            $dbName = $this->tenantService->getTenantDatabaseName($userId);
            $exists = $this->tenantService->tenantDatabaseExists($userId);

            $this->info("Usuario: {$user->user_email}");
            $this->info("BD Tenant: {$dbName}");
            $this->info("Estado: " . ($exists ? '✅ Existe' : '❌ No existe'));

            return 0;

        } catch (Exception $e) {
            $this->error("Error verificando BD tenant: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Recrear base de datos de un tenant
     */
    private function recreateTenantDatabase(?string $userId): int
    {
        if (!$userId) {
            $this->error('Se requiere --user-id para recrear una BD de tenant');
            return 1;
        }

        try {
            $user = User::where('user_id2', $userId)->first();
            if (!$user) {
                $this->error("Usuario no encontrado: {$userId}");
                return 1;
            }

            if (!$this->confirm("¿Estás seguro de recrear la BD tenant para {$user->user_email}? Esto eliminará todos los datos existentes.")) {
                $this->info("Operación cancelada");
                return 0;
            }

            $this->info("Eliminando BD tenant existente...");
            $this->tenantService->deleteTenantDatabase($userId);

            $this->info("Creando nueva BD tenant...");
            $this->tenantService->createTenantDatabase($userId, $user->user_email);

            $this->info("✅ BD tenant recreada exitosamente");
            
            return 0;

        } catch (Exception $e) {
            $this->error("Error recreando BD tenant: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Crear BDs faltantes para usuarios existentes
     */
    private function createMissingTenantDatabases(): int
    {
        try {
            $users = User::all();
            $missing = [];

            foreach ($users as $user) {
                if (!$this->tenantService->tenantDatabaseExists($user->user_id2)) {
                    $missing[] = $user;
                }
            }

            if (empty($missing)) {
                $this->info("✅ Todos los usuarios tienen su BD tenant");
                return 0;
            }

            $this->info("Usuarios sin BD tenant encontrados: " . count($missing));
            
            foreach ($missing as $user) {
                $this->info("- {$user->user_email}");
            }

            if (!$this->confirm("¿Crear BDs tenant faltantes?")) {
                $this->info("Operación cancelada");
                return 0;
            }

            $created = 0;
            foreach ($missing as $user) {
                try {
                    $this->info("Creando BD para {$user->user_email}...");
                    $this->tenantService->createTenantDatabase($user->user_id2, $user->user_email);
                    $created++;
                } catch (Exception $e) {
                    $this->error("Error creando BD para {$user->user_email}: " . $e->getMessage());
                }
            }

            $this->info("✅ BDs tenant creadas: {$created} de " . count($missing));
            
            return 0;

        } catch (Exception $e) {
            $this->error("Error creando BDs faltantes: " . $e->getMessage());
            return 1;
        }
    }
}
