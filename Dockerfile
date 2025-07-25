# Dockerfile
FROM dunglas/frankenphp

# Set working directory
WORKDIR /app

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

# Run migrations automatically (optional)
# RUN php artisan migrate --force

# Expose the port (Railway expects this)
EXPOSE 8080

# Command to start FrankenPHP
CMD ["frankenphp", "--port=${PORT}", "--document-root=/app/public"]
