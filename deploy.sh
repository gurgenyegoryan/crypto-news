#!/bin/bash

echo "🔄 Rebuilding Docker containers with new code..."
echo ""

# Stop containers
echo "1️⃣ Stopping containers..."
docker compose down

# Rebuild and start
echo ""
echo "2️⃣ Building and starting containers..."
docker compose up --build -d

# Wait for containers to be ready
echo ""
echo "3️⃣ Waiting for services to start..."
sleep 10

# Show status
echo ""
echo "4️⃣ Container status:"
docker compose ps

echo ""
echo "✅ Done! New code is now deployed."
echo ""
echo "📋 Next steps:"
echo "   1. Run: cd apps/api && npx prisma migrate dev --name add_password_reset"
echo "   2. Test forgot password: curl -X POST http://localhost:3000/auth/forgot-password -H 'Content-Type: application/json' -d '{\"email\":\"gurgen@2vmdls.com\"}'"
echo "   3. Test payment verification with a real transaction hash"
