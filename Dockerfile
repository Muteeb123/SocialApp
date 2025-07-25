FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    php-mysql \
    php-zip \
    php-curl \
    php-mbstring \
    php-bcmath \
    php-tokenizer \
    php-xml \
    php-fileinfo \
    php-common \
    php-cli \
    php-fpm \
    php-opcache \
    php-readline \
    php-soap \
    php-intl \
    php-xsl \
    php-gd \
    php-sqlite3 \
    php-pgsql \
    php-imap \
    php-mysql && \
    docker-php-ext-install zip pdo pdo_mysql

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Caddy (official way)
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list && \
    apt-get update && apt-get install -y caddy

# Set working directory
WORKDIR /var/www

# Copy Laravel files
COPY . .

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chmod -R 775 storage bootstrap/cache

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose HTTP port
EXPOSE 80

# Start both PHP-FPM and Caddy
CMD php-fpm -D && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
