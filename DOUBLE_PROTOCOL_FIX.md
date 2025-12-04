# Fixed: Double Protocol Issue

## The Problem

Your code had fallback URLs like:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://https://api.cryptomonitor.app';
```

This caused URLs to become: `http://https//api.cryptomonitor.app` (double protocol!)

## The Fix

Changed all fallback URLs from:
```javascript
'http://https://api.cryptomonitor.app'  // ❌ WRONG
```

To:
```javascript
'https://api.cryptomonitor.app'  // ✅ CORRECT
```

## Files Fixed

- ✅ `apps/web/src/context/AuthContext.tsx`
- ✅ `apps/web/src/app/forgot-password/page.tsx`
- ✅ `apps/web/src/app/reset-password/page.tsx`
- ✅ `apps/web/src/app/verify/page.tsx`
- ✅ `apps/web/src/app/dashboard/DashboardContent.tsx`
- ✅ `apps/web/src/components/CopyTrading.tsx`
- ✅ `apps/web/src/components/SecurityScanner.tsx`
- ✅ `apps/web/src/components/SentimentAnalysis.tsx`
- ✅ `apps/web/src/components/RecentWins.tsx`
- ✅ `apps/web/src/hooks/useRealtime.ts`

## Next Steps

Rebuild your web container:

```bash
docker compose down
docker compose up -d --build web
```

## Verify

After rebuilding, check browser console - the URLs should now be correct:
- ✅ `https://api.cryptomonitor.app/auth/login`
- ❌ NOT `http://https//api.cryptomonitor.app/auth/login`

The mixed content error will be gone!
