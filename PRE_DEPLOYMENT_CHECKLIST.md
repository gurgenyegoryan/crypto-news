# Pre-Deployment Checklist

## ✅ Code Changes Completed

- [x] Fixed payment verification security bug
  - [x] Added fail-safe logic
  - [x] Added recipient wallet verification for TRC20
  - [x] Added recipient wallet verification for Polygon
  - [x] Added amount validation
  - [x] Added comprehensive logging
  - [x] Added failed attempt logging to database

- [x] Fixed forgot password network error
  - [x] Added error handling in controller
  - [x] Added error handling in service
  - [x] Removed exception for unverified users
  - [x] Added email service error handling

- [x] Created database setup automation
  - [x] Created setup-database.sh script
  - [x] Made script executable
  - [x] Added database existence check
  - [x] Added migration deployment

- [x] Created documentation
  - [x] DEPLOYMENT_GUIDE.md
  - [x] SUMMARY_OF_FIXES.md
  - [x] ISSUES_ANALYSIS_AND_FIXES.md
  - [x] QUICK_FIX_GUIDE.md
  - [x] This checklist

## 📋 Server Deployment Steps

### Before Deployment
- [ ] Backup current database
- [ ] Note current environment variables
- [ ] Have rollback plan ready

### Deployment
- [ ] Pull latest code to server
- [ ] Run `./setup-database.sh`
- [ ] Verify database created
- [ ] Verify migrations applied
- [ ] Rebuild containers: `docker-compose up -d --build`
- [ ] Check logs for errors

### Testing
- [ ] Worker connects to database (no errors in logs)
- [ ] Forgot password returns success (no network error)
- [ ] Payment with wrong hash REJECTS
- [ ] Payment with valid hash ACCEPTS (if you have test transaction)

## 🔒 Security Verification

### Payment Verification
- [ ] Test with invalid hash format → MUST REJECT
- [ ] Test with duplicate transaction → MUST REJECT
- [ ] Test with wrong recipient wallet → MUST REJECT
- [ ] Test with insufficient amount → MUST REJECT
- [ ] Check logs show [PAYMENT REJECTED] for failures
- [ ] Check logs show [PAYMENT SUCCESS] for valid payments

### Forgot Password
- [ ] Test with valid email → Returns success
- [ ] Test with invalid email → Returns success (no enumeration)
- [ ] Check logs for errors
- [ ] Verify email sent (if SMTP configured)

### Database
- [ ] Database exists
- [ ] All migrations applied
- [ ] Worker service connects successfully
- [ ] No "database does not exist" errors

## 🎯 Critical Tests

### Test 1: Invalid Payment Hash
```bash
# This MUST return success: false
curl -X POST http://api-url/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"txHash":"invalid123","network":"TRC20"}'
```
Expected: `{"success": false, "message": "..."}`

### Test 2: Forgot Password
```bash
# This MUST return success message
curl -X POST http://api-url/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
Expected: `{"message": "If an account exists..."}`

### Test 3: Database Connection
```bash
# Worker logs should NOT show database errors
docker-compose logs worker | grep -i "database.*not exist"
```
Expected: No output (no errors)

## 📊 Monitoring Setup

- [ ] Set up log monitoring
- [ ] Set up error alerting
- [ ] Monitor payment attempts
- [ ] Monitor database connections
- [ ] Monitor email delivery (if configured)

## 🔄 Rollback Plan

If issues occur:
```bash
# Stop services
docker-compose down

# Restore previous code
git checkout previous_commit_hash

# Rebuild and restart
docker-compose up -d --build
```

## 📝 Post-Deployment

- [ ] Monitor logs for 24 hours
- [ ] Check payment attempts
- [ ] Verify no database errors
- [ ] Test all critical features
- [ ] Update documentation if needed

## ✅ Sign-Off

- [ ] All code changes reviewed
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Deployment successful
- [ ] No critical errors in logs
- [ ] All features working

---

**Date Completed**: _______________

**Deployed By**: _______________

**Notes**: _______________________________________________
