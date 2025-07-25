FROM dunglas/frankenphp

# Set working directory
WORKDIR /app

# Install system dependencies and PHP zip extension
RUN apt-get update && \
    apt-get install -y git unzip libzip-dev && \
    docker-php-ext-install zip && \
    rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy Laravel files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Laravel storage permissions
RUN chmod -R 775 storage bootstrap/cache

# Laravel config cache
RUN php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache \
 && php artisan event:cache

# Expose the port
EXPOSE 8080

# Start FrankenPHP
CMD ["frankenphp",  "--document-root=/app/public"]
