# Forgot Password Feature - Implementation Summary

## ✅ What's Been Implemented

### 1. Database Schema Updates
- Added `passwordResetToken` field (unique)
- Added `passwordResetTokenExpiry` field
- Location: `apps/api/prisma/schema.prisma`

### 2. Backend API Endpoints

#### POST `/auth/forgot-password`
- Request: `{ "email": "user@example.com" }`
- Sends password reset email to verified users only
- Generates secure token (valid for 1 hour)
- Response: Generic message (doesn't reveal if user exists)

#### POST `/auth/reset-password`
- Request: `{ "token": "...", "newPassword": "..." }`
- Validates token and expiry
- Updates password
- Clears reset token
- Response: Success message

### 3. Email Service
- Beautiful HTML email template with:
  - Purple/pink gradient design matching app theme
  - Clear reset button
  - Alternative link for copy/paste
  - Security warning
  - 1-hour expiry notice
  - Responsive design

### 4. Security Features
- ✅ Only verified emails can reset password
- ✅ Token expires after 1 hour
- ✅ Token is unique and cryptographically secure (32 bytes)
- ✅ Generic responses (doesn't reveal if email exists)
- ✅ Token cleared after successful reset
- ✅ Password hashed with bcrypt

## 📋 Next Steps (You Need to Do)

### 1. Run Database Migration
```bash
cd apps/api
npx prisma migrate dev --name add_password_reset
npx prisma generate
```

### 2. Reset Your Premium Subscription
```bash
./reset-premium.sh
```

Or manually:
```bash
docker exec -it cryptomonitor-postgres psql -U postgres -d cryptomonitor -c "
UPDATE \"User\" 
SET 
    tier = 'free',
    \"subscriptionStatus\" = 'expired',
    \"premiumUntil\" = NULL,
    \"lastPaymentDate\" = NULL
WHERE email = 'gurgen@2vmdls.com';
"
```

### 3. Frontend Pages Needed

#### Forgot Password Page (`/forgot-password`)
```tsx
- Email input field
- Submit button
- Link back to login
- Success/error messages
```

#### Reset Password Page (`/reset-password`)
```tsx
- Read token from URL query params
- New password input (with confirmation)
- Submit button
- Password strength indicator
- Success redirect to login
```

## 🎨 Frontend Implementation Guide

### Forgot Password Form
```typescript
const handleForgotPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  // Show success message
};
```

### Reset Password Form
```typescript
const handleResetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  
  if (response.ok) {
    // Redirect to login
    router.push('/login');
  }
};
```

## 🔧 Files Modified

### Backend
- `apps/api/prisma/schema.prisma` - Added password reset fields
- `apps/api/src/auth/auth.controller.ts` - Added endpoints
- `apps/api/src/auth/auth.service.ts` - Added logic
- `apps/api/src/users/users.service.ts` - Added findByPasswordResetToken
- `apps/api/src/email/email.service.ts` - Added beautiful email template

### Scripts
- `reset-premium.sh` - Database command to reset your subscription

## 🧪 Testing

1. **Request Reset:**
   ```bash
   curl -X POST http://localhost:3000/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"gurgen@2vmdls.com"}'
   ```

2. **Check Email Logs:**
   ```bash
   docker logs cryptomonitor-api | grep "Password reset"
   ```

3. **Reset Password:**
   ```bash
   curl -X POST http://localhost:3000/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"YOUR_TOKEN","newPassword":"newpass123"}'
   ```

## 📧 Email Preview

The password reset email includes:
- 🔐 Eye-catching header
- Clear instructions
- Big "Reset Password" button
- Alternative link for manual copy/paste
- Security warning
- 1-hour expiry notice
- Professional footer

## 🔒 Security Notes

- Tokens are 64-character hex strings (256 bits of entropy)
- Only verified users can request password reset
- Tokens expire after 1 hour
- Used tokens are cleared immediately
- No information leakage (generic responses)
- Rate limiting recommended (add later if needed)
