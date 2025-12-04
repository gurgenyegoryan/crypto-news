# Why You CANNOT Use `api:3000` From Browser

## The Problem Explained Simply

### What You're Trying (DOESN'T WORK):
```
┌─────────────────┐
│  User's Browser │ (Chrome on user's laptop)
│  (HTTPS page)   │
└────────┬────────┘
         │
         │ Tries to connect to: http://api:3000
         ↓
    ❌ FAILS!
    
Why it fails:
1. "api" hostname doesn't exist on user's computer
2. "api" only exists inside Docker network
3. Browser blocks HTTP from HTTPS page
```

### What Actually Works:
```
┌─────────────────┐
│  User's Browser │
│  (HTTPS page)   │
└────────┬────────┘
         │
         │ https://cryptomonitor.app/api/auth/login
         ↓
┌────────────────────┐
│  Nginx (Port 443)  │ ← Running on your server
│  Reverse Proxy     │
└────────┬───────────┘
         │
         │ Removes "/api" prefix
         │ Proxies to: https://api.cryptomonitor.app/auth/login
         ↓
┌────────────────────┐
│  API Container     │ ← Docker container
│  (Port 3000)       │
└────────────────────┘
```

## Key Points

### ❌ What DOESN'T Work:
- `http://api:3000` - Browser can't resolve "api" hostname
- `https://api.cryptomonitor.app` - Localhost is user's computer, not your server
- Any HTTP URL when page is HTTPS - Browser blocks it

### ✅ What WORKS:
- `https://cryptomonitor.app/api` - Same domain, Nginx proxies to API
- `https://api.cryptomonitor.app` - Separate subdomain with SSL

## The Flow

### Your Current Setup (BROKEN):
```
Frontend Code:
  const API_URL = "http://api:3000"
  fetch(`${API_URL}/auth/login`)

Browser tries:
  http://api:3000/auth/login
  ↓
  ❌ DNS lookup fails - "api" not found
  ❌ Even if found, HTTP blocked from HTTPS page
```

### Correct Setup (WORKS):
```
Frontend Code:
  const API_URL = "https://cryptomonitor.app/api"
  fetch(`${API_URL}/auth/login`)

Browser requests:
  https://cryptomonitor.app/api/auth/login
  ↓
Nginx receives:
  /api/auth/login
  ↓
Nginx strips "/api" and proxies to:
  https://api.cryptomonitor.app/auth/login
  ↓
API Container receives:
  /auth/login
  ↓
  ✅ Works!
```

## Docker Network vs Browser

### Inside Docker Network (Container to Container):
```
┌──────────────┐         ┌──────────────┐
│ Web Container│────────▶│ API Container│
│              │         │              │
│ Can use:     │         │ Hostname:    │
│ http://api:3000        │ "api"        │
└──────────────┘         └──────────────┘

✅ This works because both containers are in same Docker network
```

### From Browser (User's Computer):
```
┌──────────────┐         ┌──────────────┐
│ User Browser │   ❌    │ API Container│
│              │────X────│              │
│ Cannot use:  │         │ Hostname:    │
│ http://api:3000        │ "api"        │
└──────────────┘         └──────────────┘

❌ This NEVER works - different networks!
```

## Solution Architecture

```
                    Internet
                       │
                       ↓
              ┌────────────────┐
              │  Your Server   │
              │  Public IP     │
              └────────┬───────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ↓                           ↓
┌─────────────────┐         ┌─────────────────┐
│  Nginx (443)    │         │  Docker Network │
│  Reverse Proxy  │         │                 │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │                  ┌────────┴────────┐
         │                  │                 │
         ├──────────────────┤                 │
         │                  ↓                 ↓
         │         ┌──────────────┐  ┌──────────────┐
         │         │ Web:3001     │  │ API:3000     │
         │         │ (Frontend)   │  │ (Backend)    │
         │         └──────────────┘  └──────────────┘
         │
         │ Routes:
         │ / → Web Container (3001)
         │ /api → API Container (3000)
         │
```

## Why This Is The Only Way

1. **Browser Security**: Cannot bypass Mixed Content Policy
2. **DNS Resolution**: Browser can't resolve Docker hostnames
3. **Network Isolation**: Browser is outside Docker network

## What You Need To Do

1. **Install Nginx** on your server
2. **Get SSL certificate** (free with Let's Encrypt)
3. **Configure Nginx** to proxy `/api` to your API container
4. **Use `https://cryptomonitor.app/api`** as your API URL

That's it! No other way around this.

## Quick Commands

```bash
# 1. Install Nginx and get SSL
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d cryptomonitor.app

# 2. Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/cryptomonitor
sudo ln -s /etc/nginx/sites-available/cryptomonitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 3. Rebuild web container (docker compose.yml already updated)
docker compose down
docker compose up -d --build web

# 4. Done! Test in browser
curl https://cryptomonitor.app/api/whale-watch
```

## Bottom Line

**You MUST use a publicly accessible HTTPS URL for your API.**

Options:
1. ✅ **Nginx reverse proxy** with `/api` path (recommended - already configured)
2. ✅ Separate subdomain `https://api.cryptomonitor.app` with SSL
3. ❌ `http://api:3000` - IMPOSSIBLE from browser

Choose option 1 (Nginx) - it's already set up in the config files!
