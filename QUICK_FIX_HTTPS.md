# Quick Fix: HTTPS Mixed Content Error

## The Problem
Browser error: "Mixed Content: The page at 'https://cryptomonitor.app/login' was loaded over HTTPS, but requested an insecure resource 'http://https://api.cryptomonitor.app/auth/login'"

## The Solution (3 Steps)

### Step 1: Set Your API URL

Create or update `.env` file in the root directory:

```bash
# Create .env file
cat > .env << 'EOF'
# Your HTTPS API URL (REQUIRED!)
NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app

# Other required variables
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=cryptomonitor
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://cryptomonitor.app
ADMIN_USDT_WALLET=your_wallet_address
EOF
```

**Replace `https://api.cryptomonitor.app` with your actual API URL!**

### Step 2: Rebuild Web Container

```bash
docker-compose down
docker-compose up -d --build web
```

### Step 3: Verify

Open your browser and check:
- No more mixed content errors
- API calls should work
- Check browser console for confirmation

## Alternative: Quick One-Liner

```bash
echo "NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app" > .env && docker-compose up -d --build web
```

## What URL Should I Use?

### If you have a subdomain for API:
```
NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app
```

### If API is on same domain with path:
```
NEXT_PUBLIC_API_URL=https://cryptomonitor.app/api
```

### For local development:
```
NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app
```

## Don't Have HTTPS for API Yet?

### Quick Option: Use Cloudflare
1. Add domain to Cloudflare
2. Point `api.cryptomonitor.app` to your server
3. Enable "Full" SSL mode
4. Done! Cloudflare handles HTTPS

### Or: Use Nginx + Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.cryptomonitor.app

# Nginx will be auto-configured
```

## Still Not Working?

### Clear build cache:
```bash
docker-compose down
docker-compose build --no-cache web
docker-compose up -d
```

### Check the variable is set:
```bash
docker-compose exec web env | grep NEXT_PUBLIC_API_URL
```

### Check browser console:
Open browser dev tools → Console → Look for the API URL being used

## That's It!

After setting `NEXT_PUBLIC_API_URL` and rebuilding, the error will be gone.

For more details, see: `FIX_HTTPS_MIXED_CONTENT.md`
