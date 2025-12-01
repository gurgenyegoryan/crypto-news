# Payment System Testing Guide

## Overview

Your payment system accepts **1 USDT** via **TRC20 (Tron network)** to upgrade users to Premium tier.

**Admin Wallet Address:** `TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29`

---

## 🚀 Quick Start - Testing Your Payment

### Step 1: Send Payment

1. **Open your crypto wallet** (TronLink, Trust Wallet, Binance, etc.)
2. **Send exactly 29 USDT** to: `TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29`
3. **Important:** Make sure you select **TRC20 network** (not ERC20 or other networks)
4. **Copy the transaction hash** after sending (it will look like: `a1b2c3d4e5f6...`)

### Step 2: Verify on Blockchain Explorer

Before testing in your app, verify the transaction on TronScan:

1. Go to https://tronscan.org/
2. Paste your transaction hash in the search bar
3. Verify:
   - ✅ Status: Success/Confirmed
   - ✅ To: `TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29`
   - ✅ Amount: 29 USDT
   - ✅ Token: TRC20 USDT

### Step 3: Test via API Script

1. **Update the test script** with your transaction hash:
   ```bash
   cd /home/gurgen/projects/personal/crypto-news/apps/api
   ```

2. **Edit the script:**
   ```bash
   nano scripts/test-payment.ts
   ```
   
   Update these lines:
   ```typescript
   const TEST_USER = {
       email: 'your-email@example.com',  // Your actual email
       password: 'YourPassword123!',      // Your actual password
   };
   
   const TX_HASH = 'YOUR_ACTUAL_TRANSACTION_HASH_HERE';
   ```

3. **Run the test:**
   ```bash
   npx tsx scripts/test-payment.ts
   ```

### Step 4: Test via Browser UI

1. **Login to your app:** http://localhost:3001
2. **Navigate to Settings or Subscription page**
3. **Look for "Upgrade to Premium" or "Verify Payment" section**
4. **Paste your transaction hash** and click verify
5. **Check that your tier updates to Premium**

---

## 📋 What the Payment System Does

### Current Implementation (MVP)

The current system is a **simplified MVP** that:

✅ **Accepts transaction hash** from user  
✅ **Checks if hash was already used** (prevents double-spending)  
✅ **Validates hash format** (basic validation)  
✅ **Creates payment record** in database  
✅ **Upgrades user to Premium tier** for 30 days  
✅ **Handles subscription renewals** (extends existing subscription)  

⚠️ **Note:** The current version does NOT verify the transaction on-chain. It trusts that you sent the payment.

### What Real Production System Should Do

For production, you should implement:

1. **On-chain verification** using TronWeb:
   - Connect to Tron node
   - Fetch transaction details
   - Verify it's a USDT TRC20 transfer
   - Verify recipient is your wallet
   - Verify amount is exactly 29 USDT
   - Verify transaction is confirmed

2. **Webhook notifications** from payment processor
3. **Automatic refund handling** for incorrect amounts
4. **Email notifications** for successful payments

---

## 🧪 Testing Scenarios

### Scenario 1: New Premium Subscription

**Expected Behavior:**
- User starts with `tier: 'free'`
- After payment verification:
  - `tier` → `'premium'`
  - `subscriptionStatus` → `'active'`
  - `premiumUntil` → 30 days from now
  - Payment record created in database

### Scenario 2: Renewing Existing Subscription

**Expected Behavior:**
- User already has Premium (expires in 5 days)
- After payment verification:
  - `tier` → `'premium'` (unchanged)
  - `premiumUntil` → extended by 30 days from current expiry
  - New payment record created

### Scenario 3: Duplicate Transaction Hash

**Expected Behavior:**
- User tries to use same transaction hash twice
- System returns error: "This transaction has already been used for a payment."
- No subscription changes made

### Scenario 4: Invalid Transaction Hash

**Expected Behavior:**
- User provides invalid/short hash
- System returns error: "Invalid transaction hash format."
- No subscription changes made

---

## 🔍 API Endpoints

### 1. Verify Payment
```bash
POST /payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "txHash": "your-transaction-hash-here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified! You now have Premium access until 12/31/2025.",
  "tier": "premium",
  "premiumUntil": "2025-12-31T00:00:00.000Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "This transaction has already been used for a payment."
}
```

### 2. Get Subscription Status
```bash
GET /payments/subscription-status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "tier": "premium",
  "subscriptionStatus": "active",
  "premiumUntil": "2025-12-31T00:00:00.000Z",
  "lastPaymentDate": "2025-12-01T00:00:00.000Z",
  "daysRemaining": 30,
  "isActive": true,
  "needsRenewal": false
}
```

### 3. Get Payment History
```bash
GET /payments/history
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "payment-id",
    "userId": "user-id",
    "txHash": "transaction-hash",
    "amount": 29,
    "currency": "USDT",
    "network": "TRC20",
    "status": "verified",
    "subscriptionMonths": 1,
    "verifiedAt": "2025-12-01T00:00:00.000Z",
    "createdAt": "2025-12-01T00:00:00.000Z"
  }
]
```

---

## 🛠️ Manual Testing with cURL

If you prefer testing with cURL:

```bash
# 1. Login first
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}' \
  | jq -r '.access_token')

# 2. Check current status
curl -X GET http://localhost:3000/payments/subscription-status \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Verify payment
curl -X POST http://localhost:3000/payments/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"txHash":"YOUR_TX_HASH_HERE"}' | jq

# 4. Check updated status
curl -X GET http://localhost:3000/payments/subscription-status \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Check payment history
curl -X GET http://localhost:3000/payments/history \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 📊 Database Verification

To check the database directly:

```bash
# Connect to your database
docker exec -it <postgres-container> psql -U <username> -d <database>

# Check user subscription
SELECT id, email, tier, "subscriptionStatus", "premiumUntil" 
FROM "User" 
WHERE email = 'test@example.com';

# Check payment records
SELECT * FROM "Payment" 
WHERE "userId" = '<user-id>' 
ORDER BY "createdAt" DESC;
```

---

## ⚠️ Important Notes

### Security Considerations

1. **Current MVP is NOT production-ready** - it doesn't verify transactions on-chain
2. **Anyone with a valid transaction hash** can use it (even if they didn't send it)
3. **No amount verification** - system assumes 29 USDT was sent
4. **No refund mechanism** for wrong amounts

### Recommended Improvements

1. **Implement TronWeb integration** for on-chain verification
2. **Add webhook support** for automatic payment detection
3. **Implement amount verification** (reject if not exactly 29 USDT)
4. **Add email notifications** for successful payments
5. **Add admin dashboard** to review pending payments
6. **Implement refund workflow** for incorrect payments

---

## 🐛 Troubleshooting

### Problem: "This transaction has already been used"
**Solution:** Each transaction hash can only be used once. Send a new payment with a different transaction.

### Problem: "Invalid transaction hash format"
**Solution:** Make sure your transaction hash is at least 20 characters long and is a valid Tron transaction hash.

### Problem: Payment verified but tier didn't update
**Solution:** Check the API response and database. The tier should update immediately. If not, check server logs for errors.

### Problem: Can't find payment verification UI
**Solution:** Check your frontend code for payment/subscription components. You may need to add a UI for payment verification.

---

## 📞 Need Help?

If you encounter issues:

1. **Check server logs:** `docker logs <api-container>`
2. **Check database:** Verify user and payment records
3. **Check transaction on TronScan:** Ensure payment was successful
4. **Run test script:** Use the automated test script to isolate issues

---

## 🎯 Next Steps

After testing:

1. ✅ Verify payment flow works end-to-end
2. ✅ Test subscription renewal
3. ✅ Test duplicate transaction prevention
4. 🔄 Implement on-chain verification (recommended)
5. 🔄 Add email notifications
6. 🔄 Create admin dashboard for payment management
