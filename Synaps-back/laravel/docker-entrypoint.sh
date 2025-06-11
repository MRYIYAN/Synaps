#!/bin/bash

# Configuración optimizada para Laravel con subida de imágenes de perfil

# Instalar dependencias necesarias
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

# Configurar enlace simbólico para acceso público a storage
if [ ! -L public/storage ]; then
    php artisan storage:link
fi

# Configurar permisos para subida de archivos
chown -R www-data:www-data storage bootstrap/cache
chown -R www-data:www-data public/storage 2>/dev/null || true
chmod -R 775 storage bootstrap/cache
chmod -R 755 public/storage 2>/dev/null || true

# Permisos específicos para profile_photos (escritura completa)
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

# Verificar permisos
PERMS=$(stat -c %a storage/app/public/profile_photos 2>/dev/null || echo "000")
if [ "$PERMS" = "775" ] || [ "$PERMS" = "777" ]; then
    :
else
    chmod 775 storage/app/public/profile_photos
fi

# Iniciar Apache
exec apache2-foreground
