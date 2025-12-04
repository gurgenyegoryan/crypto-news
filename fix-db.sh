#!/bin/bash

echo "🚀 Fixing database schema and restarting infrastructure..."

# 1. Ensure the migration file exists (I just created it manually)
# The file is in apps/api/prisma/migrations/20251202154500_add_email_alerts

# 2. Rebuild and restart the API container
# This will:
# - Copy the new migration file into the container
# - Run the entrypoint script
# - Execute 'npx prisma migrate deploy' (applying the migration)
# - Execute 'npx prisma db seed'
# - Start the application

echo "🧹 Attempting to resolve any failed migrations..."
# Use 'run --rm' instead of 'exec' because 'exec' requires the container to be running, 
# but it might be crashing due to the migration error.
docker compose run --rm api npx prisma migrate resolve --rolled-back 20251202154500_add_email_alerts || true

echo "🔄 Rebuilding API container..."
docker compose up -d --build api

echo "⏳ Waiting for API to start and run migrations..."
sleep 10

echo "🔍 Checking logs for migration success..."
docker compose logs --tail=50 api

echo "✅ Done! Your database should now have all tables and columns."
