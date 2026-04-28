#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install PHP dependencies
composer install

# Generate app key if not exists
php artisan key:generate

# Run migrations
php artisan migrate --force

# Cache config
php artisan config:cache

# Cache routes
php artisan route:cache

echo "Deployment completed successfully!"
