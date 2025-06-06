# Imagen base de PHP con Apache y extensiones necesarias
FROM php:8.2-apache

# Instala extensiones requeridas por Laravel
RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip \
    libonig-dev \
    libxml2-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    mariadb-client \
    && docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl

# Habilitar Apache mod_rewrite
RUN a2enmod rewrite

# Establece el DocumentRoot en public/
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Copiar el código fuente al contenedor
COPY . /var/www/html

# Establecer el directorio de trabajo
WORKDIR /var/www/html

# Establecer permisos adecuados
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Instalar dependencias de Laravel
RUN composer install --no-interaction --prefer-dist --optimize-autoloader
