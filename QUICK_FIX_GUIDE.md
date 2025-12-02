# Quick Fix Guide - Production Server

## 🚨 CRITICAL: Run These Commands on Your Server

### Step 1: Fix Database Issue
```bash
# Option A: Use automated script
./setup-database.sh

# Option B: Manual fix
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE cryptomonitor;"
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma generate
```

### Step 2: Restart Services
```bash
docker-compose down
docker-compose up -d --build
```

### Step 3: Verify Everything Works
```bash
# Check worker logs - should NOT see database errors
docker-compose logs worker | grep -i "database\|error"

# Check API logs
docker-compose logs api | tail -50

# Test forgot password
curl -X POST http://your-api-url/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## ✅ What Was Fixed

1. **Payment Verification** - Now properly validates transactions
   - ✅ Checks recipient wallet
   - ✅ Checks amount
   - ✅ Prevents duplicate usage
   - ✅ Logs all attempts

2. **Forgot Password** - No more network errors
   - ✅ Better error handling
   - ✅ Works even without email configured

3. **Database** - Automated setup
   - ✅ Creates database if missing
   - ✅ Runs migrations automatically

## 🧪 Test Payment Security

```bash
# This MUST REJECT (wrong hash)
curl -X POST http://your-api-url/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "txHash": "wrong_hash_12345",
    "network": "TRC20"
  }'

# Expected: {"success": false, ...}
```

## 📋 Environment Variables to Check

Make sure these are set in your `.env` or docker-compose:

```env
DATABASE_URL=postgresql://user:pass@postgres:5432/cryptomonitor
FRONTEND_URL=https://your-frontend.com
ADMIN_USDT_WALLET=your_trc20_wallet
SMTP_HOST=your-smtp-host  # Optional but recommended
```

## 🔍 Monitoring

```bash
# Watch all logs
docker-compose logs -f

# Watch for errors
docker-compose logs -f | grep -i error

# Watch payment attempts
docker-compose logs -f api | grep -i payment
```

## 📞 If Something Goes Wrong

1. Check logs: `docker-compose logs -f`
2. Verify database exists: `docker-compose exec postgres psql -U postgres -l`
3. Check environment variables: `docker-compose exec api env | grep DATABASE`
4. Restart services: `docker-compose restart`

## 📚 Full Documentation

- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `SUMMARY_OF_FIXES.md` - Detailed list of all fixes
- `ISSUES_ANALYSIS_AND_FIXES.md` - Technical analysis

---

**Ready to deploy!** Just run the commands above on your server.
