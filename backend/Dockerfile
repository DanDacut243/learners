FROM php:8.2-fpm

# Install build tools, dependencies, and Nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    libpq-dev \
    nginx \
    supervisor \
    && docker-php-ext-install pdo_pgsql \
    && apt-get purge -y build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock* ./

# Install dependencies - ignore platform requirements
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --ignore-platform-reqs

# Copy application code
COPY . .

# Generate Laravel key
RUN php artisan key:generate --force 2>/dev/null || echo "Key generation skipped"

# Create storage directories
RUN mkdir -p storage/logs storage/framework/sessions storage/framework/views storage/framework/cache && \
    chmod -R 777 storage bootstrap/cache

# Configure Nginx
RUN mkdir -p /var/www/html && \
    rm /etc/nginx/sites-enabled/default

# Copy Nginx configuration
COPY docker/nginx.conf /etc/nginx/sites-enabled/default

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy and make startup script executable
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Expose port 80 for HTTP
EXPOSE 80

# Start the application using the startup script
CMD ["/usr/local/bin/startup.sh"]
