# Nginx Reverse Proxy Setup Guide

## Why You Need This

**You CANNOT use `http://api:3000` from the browser** because:

1. ❌ `api` is a Docker internal hostname - doesn't exist on user's computer
2. ❌ Browser blocks HTTP requests from HTTPS pages (Mixed Content Policy)
3. ❌ This is a security feature that cannot be bypassed

## The Solution: Nginx Reverse Proxy

Use ONE domain for everything. Nginx routes requests:
- `https://cryptomonitor.app/` → Frontend (port 3001)
- `https://cryptomonitor.app/api/` → API (port 3000)

```
User Browser
    ↓
https://cryptomonitor.app/api/auth/login
    ↓
Nginx (port 443)
    ↓
https://api.cryptomonitor.app/auth/login (API container)
```

## Step-by-Step Setup

### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Step 2: Install SSL Certificate

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get free SSL certificate
sudo certbot --nginx -d cryptomonitor.app -d www.cryptomonitor.app
```

### Step 3: Configure Nginx

```bash
# Copy the nginx.conf file to Nginx sites
sudo cp nginx.conf /etc/nginx/sites-available/cryptomonitor

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/cryptomonitor /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 4: Update Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### Step 5: Rebuild Web Container

```bash
# The docker-compose.yml is already updated to use /api path
docker-compose down
docker-compose up -d --build web
```

### Step 6: Verify

Open browser and test:
- `https://cryptomonitor.app` → Should load frontend
- `https://cryptomonitor.app/api/whale-watch` → Should return API data

Check browser console - NO mixed content errors!

## How It Works

### Before (BROKEN):
```
Browser → http://api:3000/auth/login
          ↓
          ❌ "api" hostname not found
          ❌ HTTP blocked from HTTPS page
```

### After (WORKING):
```
Browser → https://cryptomonitor.app/api/auth/login
          ↓
Nginx → Removes "/api" prefix
          ↓
https://api.cryptomonitor.app/auth/login (API container)
          ↓
✅ Works!
```

## Configuration Explained

### Frontend Requests
```javascript
// In your React code
fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`)
// Becomes: https://cryptomonitor.app/api/auth/login
```

### Nginx Routes It
```nginx
location /api/ {
    rewrite ^/api/(.*) /$1 break;  # Remove /api prefix
    proxy_pass https://api.cryptomonitor.app;  # Send to API container
}
```

### API Receives
```
Original: https://cryptomonitor.app/api/auth/login
API sees: https://api.cryptomonitor.app/auth/login
```

## Troubleshooting

### Nginx won't start?
```bash
# Check for errors
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Still getting mixed content errors?
```bash
# Make sure web container is rebuilt
docker-compose down
docker-compose build --no-cache web
docker-compose up -d

# Check the API URL is correct
docker-compose exec web env | grep NEXT_PUBLIC_API_URL
# Should show: NEXT_PUBLIC_API_URL=https://cryptomonitor.app/api
```

### API not responding?
```bash
# Check API is running
docker-compose ps

# Check API logs
docker-compose logs -f api

# Test API directly
curl https://api.cryptomonitor.app/whale-watch
```

### SSL certificate issues?
```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates
```

## Alternative: If You Don't Want Nginx

If you really don't want to use Nginx, your ONLY option is:

1. Expose API on a public HTTPS URL (like `https://api.cryptomonitor.app`)
2. Get SSL certificate for that domain
3. Set `NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app`

But using Nginx with `/api` path is **simpler and better** because:
- ✅ Only one domain needed
- ✅ Only one SSL certificate needed
- ✅ Better security (API not directly exposed)
- ✅ Easier to manage

## Summary

1. **Install Nginx** with SSL certificate
2. **Copy nginx.conf** to `/etc/nginx/sites-available/cryptomonitor`
3. **Enable the site** and restart Nginx
4. **Rebuild web container** (already configured in docker-compose.yml)
5. **Done!** Everything works through `https://cryptomonitor.app`

No more mixed content errors! 🎉
