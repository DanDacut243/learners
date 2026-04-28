#!/bin/bash

# Startup script for Laravel application
# Runs migrations and seeding on first deploy

echo "=========================================="
echo "Starting Laravel Application Setup"
echo "=========================================="

# Change to app directory
cd /app

# Check if migrations have been run (check if users table exists)
echo "Checking if database is initialized..."

php artisan migrate:status 2>&1 | grep -q "Migration not found"

if [ $? -eq 0 ] || [ ! -f ".env.migrated" ]; then
    echo "Running database migrations..."
    php artisan migrate --force 2>&1 || true
    
    echo "Seeding database..."
    php artisan db:seed --force 2>&1 || true
    
    # Create marker file to skip migrations on future restarts
    touch .env.migrated
    
    echo "=========================================="
    echo "Database migrations and seeding completed!"
    echo "=========================================="
else
    echo "Database already initialized. Skipping migrations..."
fi

echo "=========================================="
echo "Starting supervisor to manage services..."
echo "=========================================="

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
