FROM php:8.2-fpm-alpine

# Install essential packages
RUN apk add --no-cache \
    curl \
    git \
    postgresql-dev \
    libzip-dev \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        zip \
        json \
    && apk del postgresql-dev \
    && rm -rf /var/lib/apt/lists/*

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

# Expose port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]

# Run migrations and start server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
