# Production Deployment Guide

This guide will help you deploy the CryptoMonitor application on your production server and fix all current issues.

## Issues Fixed

1. ✅ **Database Connection Error** - Database doesn't exist on server
2. ✅ **Forgot Password Network Error** - Enhanced error handling
3. ✅ **Payment Verification Bug** - CRITICAL security fix preventing wrong transactions from granting premium access

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL accessible (via Docker or standalone)
- Node.js 18+ (if running without Docker)
- Git

## Step 1: Database Setup

### Option A: Using the Automated Script (Recommended)

```bash
# Make the script executable (already done)
chmod +x setup-database.sh

# Run the setup script
./setup-database.sh
```

### Option B: Manual Setup

```bash
# 1. Check if database exists
psql -U postgres -l | grep cryptomonitor

# 2. If not exists, create it
psql -U postgres -c "CREATE DATABASE cryptomonitor;"

# 3. Run migrations
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

## Step 2: Environment Configuration

Create or update your `.env` file in the root directory:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=cryptomonitor
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}

# API Configuration
JWT_SECRET=your_jwt_secret_here_change_this
PORT=3000

# Frontend URL (important for CORS and email links)
FRONTEND_URL=https://your-frontend-domain.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="CryptoMonitor <noreply@yourdomain.com>"

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Payment Wallets
ADMIN_USDT_WALLET=your_trc20_wallet_address
```

## Step 3: Build and Deploy

### Using Docker Compose (Recommended)

```bash
# Stop existing containers
docker compose down

# Build and start all services
docker compose up -d --build

# Check logs
docker compose logs -f
```

### Without Docker

```bash
# Install dependencies
npm install

# Build API
cd apps/api
npm run build

# Build Web
cd ../web
npm run build

# Start services (use PM2 or similar for production)
# Terminal 1 - API
cd apps/api
npm run start:prod

# Terminal 2 - Worker
cd apps/api
npm run start:worker

# Terminal 3 - Web
cd apps/web
npm run start
```

## Step 4: Verify Deployment

### Check Database Connection

```bash
# Check worker logs
docker compose logs worker | grep -i "database\|error"

# Should NOT see "Database cryptomonitor does not exist"
```

### Test Forgot Password

```bash
# Test the endpoint
curl -X POST https://your-api-domain.com/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should return success message (even if email doesn't exist)
```

### Test Payment Verification (CRITICAL)

```bash
# Test with INVALID hash - should REJECT
curl -X POST https://your-api-domain.com/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "txHash": "invalid_hash_12345",
    "network": "TRC20"
  }'

# Expected response: {"success": false, "message": "..."}
# User should NOT get premium access
```

## Step 5: Monitor Logs

```bash
# Watch all logs
docker compose logs -f

# Watch specific service
docker compose logs -f worker
docker compose logs -f api
docker compose logs -f web

# Check for errors
docker compose logs | grep -i error
```

## Common Issues and Solutions

### Issue: "Database cryptomonitor does not exist"

**Solution:**
```bash
# Run the setup script
./setup-database.sh

# Or manually create database
docker compose exec postgres psql -U postgres -c "CREATE DATABASE cryptomonitor;"

# Then run migrations
docker compose exec api npx prisma migrate deploy
```

### Issue: Forgot Password Returns Network Error

**Possible Causes:**
1. CORS not configured correctly
2. API URL mismatch
3. Email service throwing errors

**Solution:**
```bash
# Check API logs
docker compose logs api | grep -i "forgot"

# Verify CORS is enabled (should see in logs)
# Verify FRONTEND_URL is set correctly

# Test email service
docker compose exec api node -e "console.log(process.env.SMTP_HOST)"
```

### Issue: Payment Verification Not Working

**Solution:**
```bash
# Check payment service logs
docker compose logs api | grep -i "payment"

# Verify blockchain RPC is accessible
docker compose exec api curl https://polygon-rpc.com
docker compose exec api curl https://api.trongrid.io

# Check admin wallet addresses are set
docker compose exec api node -e "console.log(process.env.ADMIN_USDT_WALLET)"
```

## Security Checklist

- [ ] Changed default JWT_SECRET
- [ ] Changed default database password
- [ ] HTTPS enabled for production
- [ ] SMTP credentials secured
- [ ] Admin wallet addresses verified
- [ ] Payment verification tested with invalid hashes
- [ ] CORS configured for production domain only
- [ ] Environment variables not committed to git

## Payment Verification Security

The payment verification has been completely rewritten with fail-safe logic:

1. **Explicit Verification Required**: Premium access is ONLY granted after explicit successful verification
2. **Audit Trail**: All payment attempts (success and failure) are logged to database
3. **Detailed Logging**: All verification steps are logged with [PAYMENT] prefix
4. **Multiple Validation Layers**:
   - Hash format validation
   - Duplicate transaction check
   - Blockchain verification
   - Recipient wallet verification
   - Amount verification
   - User existence check

5. **No Bypass Paths**: Any error or failed verification immediately returns failure

## Testing Payment Verification

### Test Cases to Run:

1. **Invalid Hash Format**
   ```bash
   # Should reject
   txHash: "short_hash"
   ```

2. **Duplicate Transaction**
   ```bash
   # Use same hash twice - second attempt should reject
   ```

3. **Wrong Network Transaction**
   ```bash
   # Polygon hash on TRC20 network - should reject
   ```

4. **Wrong Recipient**
   ```bash
   # Transaction to different wallet - should reject
   ```

5. **Insufficient Amount**
   ```bash
   # Transaction with < 1 USDT - should reject
   ```

6. **Valid Transaction**
   ```bash
   # Correct hash, network, recipient, amount - should accept
   ```

## Monitoring

Set up monitoring for:

1. **Database Connection**: Alert if worker can't connect
2. **Payment Attempts**: Monitor failed payment attempts
3. **Email Delivery**: Track email send failures
4. **API Errors**: Alert on 500 errors

## Rollback Plan

If issues occur:

```bash
# Rollback to previous version
git checkout previous_commit_hash

# Rebuild and restart
docker compose down
docker compose up -d --build
```

## Support

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify environment variables are set correctly
3. Ensure database migrations are applied
4. Test individual components separately

## Next Steps After Deployment

1. Test all features thoroughly
2. Monitor logs for any errors
3. Set up automated backups for database
4. Configure SSL/TLS certificates
5. Set up monitoring and alerting
6. Document any custom configurations
