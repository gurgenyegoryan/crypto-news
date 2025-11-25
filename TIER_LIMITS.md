# CryptoMonitor Tier Limits

## Free Plan
- **Price Alerts**: 1 alert maximum
- **Wallet Tracking**: 1 wallet maximum
- **Whale Alerts**: Basic (view only)
- **Support**: Email support only
- **Telegram Notifications**: ❌ Not available

## Premium Plan ($29/month)
- **Price Alerts**: ✅ Unlimited
- **Wallet Tracking**: ✅ Unlimited
- **Whale Alerts**: ✅ Real-time notifications
- **Multi-chain Support**: ✅ ETH, BTC, SOL, BSC
- **Advanced Analytics**: ✅ Portfolio analytics
- **Telegram Notifications**: ✅ Available (with toggle)
- **Support**: ✅ 24/7 priority support

## Implementation Details

### Backend Enforcement
- `apps/api/src/alerts/alerts.service.ts`: Enforces 1 alert limit for free users
- `apps/api/src/wallets/wallets.service.ts`: Enforces 1 wallet limit for free users

### Frontend Features
- Upgrade prompts when free users hit limits
- Premium-only Telegram notification toggle in Settings
- Telegram Chat ID field only shows when:
  1. User is Premium
  2. Telegram notifications are enabled
