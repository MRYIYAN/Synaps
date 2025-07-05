#!/bin/bash

#  Elimina la caché de configuración si existe (para forzar la lectura de .env)
rm -f bootstrap/cache/config.php

echo " Esperando a MariaDB..."
until nc -z synaps-mariadb 3306; do
  echo " Esperando conexión a la base de datos..."
  sleep 2
done

echo " MariaDB disponible. Continuando..."

# -----------------------------------------
# 1. LIMPIAR CACHÉ DE CONFIG INMEDIATAMENTE
# -----------------------------------------
php artisan config:clear

# Dependencias y optimización
composer require firebase/php-jwt --no-interaction
composer dump-autoload --optimize

# Crear todos los directorios de storage necesarios
mkdir -p storage/app/public/profile_photos
mkdir -p storage/app/public/uploads
mkdir -p storage/app/public/documents
mkdir -p storage/app/public/images
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p bootstrap/cache

# Crear directorios necesarios
mkdir -p storage/app/public/profile_photos storage/app/public/uploads \
        storage/app/public/documents storage/app/public/images \
        storage/logs storage/framework/cache \
        storage/framework/sessions storage/framework/views \
        bootstrap/cache

# Enlace simbólico
if [ ! -L public/storage ]; then
    php artisan storage:link
fi

# Permisos
chown -R www-data:www-data storage bootstrap/cache
chown -R www-data:www-data public/storage 2>/dev/null || true
chmod -R 775 storage bootstrap/cache
chmod -R 755 public/storage 2>/dev/null || true
chmod -R 775 storage/app/public/profile_photos
chown -R www-data:www-data storage/app/public/profile_photos

# Configurar variables de entorno para upload
export UPLOAD_MAX_FILESIZE=10M
export POST_MAX_SIZE=10M
export MAX_EXECUTION_TIME=300

# Verificar configuración crítica para uploads
if [ -L public/storage ] && [ -e public/storage ]; then
    :
else
    php artisan storage:link
fi

if [ -d storage/app/public/profile_photos ] && [ -w storage/app/public/profile_photos ]; then
    :
fi

# Migraciones base principal
php artisan migrate --force

# Verificar permisos
PERMS=$(stat -c %a storage/app/public/profile_photos 2>/dev/null || echo "000")
if [ "$PERMS" = "775" ] || [ "$PERMS" = "777" ]; then
    :
else
    chmod 775 storage/app/public/profile_photos
fi

# Migración tenant si existe
php artisan migrate --database=tenant --force || echo " Tenant no migrado (puede no existir aún)."

# -----------------------------------------
# 2. AL FINAL REGENERAR CACHÉ
# -----------------------------------------
php artisan config:cache
php artisan route:cache

echo " Sistema listo. Iniciando Apache..."
exec apache2-foreground
