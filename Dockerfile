FROM dunglas/frankenphp

# Set working directory
WORKDIR /app

# Install Composer manually
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
CMD ["frankenphp", "--port=${PORT}", "--document-root=/app/public"]
