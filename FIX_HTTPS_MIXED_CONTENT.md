# Fix HTTPS Mixed Content Error

## Problem
Your frontend is served over HTTPS (`https://cryptomonitor.app`) but trying to make API calls to HTTP (`http://https://api.cryptomonitor.app`), which browsers block as "Mixed Content".

## Solution

You need to set the `NEXT_PUBLIC_API_URL` environment variable to your actual HTTPS API URL.

### Option 1: Update Environment Variable (Recommended)

1. **Create or update `.env` file in the root directory**:

```env
# Add this line with your actual API domain
NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app

# Or if API is on same domain but different path:
# NEXT_PUBLIC_API_URL=https://cryptomonitor.app/api

# Or if using subdomain:
# NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app
```

2. **Rebuild the web container**:

```bash
docker compose down
docker compose up -d --build web
```

### Option 2: Set in docker compose.yml

Update `docker compose.yml`:

```yaml
web:
  build:
    context: ./apps/web
    dockerfile: Dockerfile
    args:
      NEXT_PUBLIC_API_URL: https://api.cryptomonitor.app  # Change this
  environment:
    NEXT_PUBLIC_API_URL: https://api.cryptomonitor.app  # Change this
```

Then rebuild:
```bash
docker compose up -d --build web
```

### Option 3: Quick Test (Temporary)

For quick testing, you can set it when running docker compose:

```bash
NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app docker compose up -d --build web
```

## What URL Should You Use?

### If you have a separate API subdomain:
```env
NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app
```

### If API is on the same domain with reverse proxy:
```env
NEXT_PUBLIC_API_URL=https://cryptomonitor.app/api
```

### If using IP address (not recommended for production):
```env
NEXT_PUBLIC_API_URL=https://your-server-ip:3000
```

## Important Notes

1. **HTTPS is Required**: Since your frontend is on HTTPS, the API MUST also be on HTTPS
2. **Build Time Variable**: `NEXT_PUBLIC_API_URL` is embedded at build time, so you MUST rebuild after changing it
3. **CORS Configuration**: Make sure your API allows requests from your frontend domain

## Verify the Fix

After rebuilding, check the browser console. The error should be gone and API calls should work.

You can also check what URL is being used:
```javascript
// In browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

## Setting Up HTTPS for API

If you don't have HTTPS for your API yet, you have a few options:

### Option A: Use Nginx Reverse Proxy with Let's Encrypt

1. Install certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Get SSL certificate:
```bash
sudo certbot --nginx -d api.cryptomonitor.app
```

3. Configure Nginx to proxy to your API:
```nginx
server {
    listen 443 ssl;
    server_name api.cryptomonitor.app;

    ssl_certificate /etc/letsencrypt/live/api.cryptomonitor.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cryptomonitor.app/privkey.pem;

    location / {
        proxy_pass https://api.cryptomonitor.app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option B: Use Cloudflare (Easiest)

1. Add your domain to Cloudflare
2. Point `api.cryptomonitor.app` to your server IP
3. Enable "Full" SSL mode in Cloudflare
4. Cloudflare will handle HTTPS automatically

### Option C: Use Same Domain with Path

Instead of `api.cryptomonitor.app`, use `cryptomonitor.app/api`:

```nginx
server {
    listen 443 ssl;
    server_name cryptomonitor.app;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
    }

    # API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass https://api.cryptomonitor.app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Then set:
```env
NEXT_PUBLIC_API_URL=https://cryptomonitor.app/api
```

## Quick Fix Commands

```bash
# 1. Set the environment variable
echo "NEXT_PUBLIC_API_URL=https://api.cryptomonitor.app" >> .env

# 2. Rebuild web container
docker compose up -d --build web

# 3. Check logs
docker compose logs -f web

# 4. Test in browser
# Open https://cryptomonitor.app and check console
```

## Troubleshooting

### Still seeing HTTP in requests?

The build cache might be the issue. Force a clean rebuild:

```bash
docker compose down
docker compose build --no-cache web
docker compose up -d
```

### CORS errors after fixing HTTPS?

Update your API's CORS configuration in `apps/api/src/main.ts`:

```typescript
app.enableCors({
  origin: ['https://cryptomonitor.app', 'https://www.cryptomonitor.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```

### Certificate errors?

Make sure your SSL certificate is valid:
```bash
curl -I https://api.cryptomonitor.app
```

## Summary

The fix is simple:
1. Set `NEXT_PUBLIC_API_URL=https://your-api-domain.com` in `.env`
2. Rebuild web container: `docker compose up -d --build web`
3. Ensure API is accessible via HTTPS

That's it! The mixed content error will be resolved.
