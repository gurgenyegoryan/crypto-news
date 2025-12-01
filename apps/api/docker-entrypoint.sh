#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Running database seeders..."
npx prisma db seed || echo "⚠️ No seed script found or seeding failed"

echo "✅ Database setup complete!"

# Start the application
exec "$@"
