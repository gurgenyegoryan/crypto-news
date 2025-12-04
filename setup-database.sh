#!/bin/bash

# Database Setup Script for Production Server
# This script ensures the database is properly configured and migrations are applied

set -e  # Exit on any error

echo "========================================="
echo "CryptoMonitor Database Setup"
echo "========================================="

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set default values if not provided
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-cryptomonitor}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo ""
echo "Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Check if PostgreSQL is accessible
echo "Checking PostgreSQL connection..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw template1; then
    echo "ERROR: Cannot connect to PostgreSQL server"
    echo "Please ensure PostgreSQL is running and credentials are correct"
    exit 1
fi
echo "✓ PostgreSQL is accessible"

# Check if database exists
echo ""
echo "Checking if database '$DB_NAME' exists..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "✓ Database '$DB_NAME' already exists"
else
    echo "Database '$DB_NAME' does not exist. Creating..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    echo "✓ Database '$DB_NAME' created successfully"
fi

# Navigate to API directory
cd "$(dirname "$0")/apps/api"

# Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo ""
echo "Using DATABASE_URL: postgresql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Run Prisma migrations
echo ""
echo "Running Prisma migrations..."
npx prisma migrate deploy

echo ""
echo "Generating Prisma Client..."
npx prisma generate

echo ""
echo "========================================="
echo "✓ Database setup completed successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Restart your application services"
echo "2. Check logs to ensure everything is working"
echo ""
echo "To restart with Docker Compose:"
echo "  docker compose down"
echo "  docker compose up -d"
echo ""
