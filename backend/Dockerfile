FROM php:8.2-fpm

# Install essential packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        zip \
        json \
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
