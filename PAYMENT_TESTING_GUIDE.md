# Payment System Testing Guide

## Overview

Your payment system accepts **1 USDT** via:
1. **TRC20 (Tron network)** - Address: `TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29`
2. **Polygon (MATIC network)** - Address: `0x9c4c8f7c057f459c62add15c7330f2a3060479a4`

---

## 🚀 Quick Start - Testing Your Payment

### Option A: Test with TRC20 (Tron)

1. **Send 1 USDT** to: `TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29`
2. **Network:** TRC20
3. **Copy Transaction Hash**
4. **Go to Dashboard** -> Settings -> Billing -> Upgrade
5. **Select "Tron (TRC20)"** in dropdown
6. **Paste Hash** and Verify

### Option B: Test with Polygon (MATIC)

1. **Send 1 USDT** to: `0x9c4c8f7c057f459c62add15c7330f2a3060479a4`
2. **Network:** Polygon (MATIC)
3. **Copy Transaction Hash**
4. **Go to Dashboard** -> Settings -> Billing -> Upgrade
5. **Select "Polygon (MATIC)"** in dropdown
6. **Paste Hash** and Verify

---

## 🧪 Automated Testing

You can use the updated test script to verify both networks.

1. **Edit the script:**
   ```bash
   nano scripts/test-payment.ts
   ```
   
   Update with your transaction hash and network:
   ```typescript
   const TX_HASH = 'YOUR_TRANSACTION_HASH';
   const NETWORK = 'POLYGON'; // or 'TRC20'
   ```

2. **Run the test:**
   ```bash
   npx tsx scripts/test-payment.ts
   ```

---

## 🔍 API Endpoints

### Verify Payment
```bash
POST /payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "txHash": "your-transaction-hash-here",
  "network": "POLYGON"  // or "TRC20"
}
```
