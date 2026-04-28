# ERUDITE Deployment Guide

## Architecture
- **Frontend:** Vercel (React/Vite)
- **Backend:** Render (Laravel with MySQL)
- **Database:** Render PostgreSQL or MySQL

---

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Backend for Production

1. Go to [render.com](https://render.com) and sign up
2. Create a new PostgreSQL database:
   - Click "New +"
   - Select "PostgreSQL"
   - Name: `erudite_db`
   - Region: Oregon (or your preference)
   - Copy the connection string (you'll need it)

### Step 2: Configure Environment Variables in Render

Create a `.env` file for production with:
```
APP_NAME=ERUDITE
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-api-domain.onrender.com

DB_CONNECTION=pgsql
DB_HOST=your-postgres-host
DB_PORT=5432
DB_DATABASE=erudite_db
DB_USERNAME=postgres
DB_PASSWORD=your-password

MAIL_MAILER=log
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

APP_KEY=base64:YOUR_APP_KEY_HERE
```

### Step 3: Deploy Backend to Render

1. Push your code to GitHub (including `render.yaml`)
2. On Render, click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Fill in:
   - **Name:** erudite-api
   - **Branch:** main (or your branch)
   - **Runtime:** PHP
   - **Build Command:** `cd backend && bash render-build.sh`
   - **Start Command:** `cd backend && php artisan serve --host=0.0.0.0 --port=8000`

6. Set **Environment Variables** from your `.env` file
7. Click "Deploy"

### Step 4: Get Your Backend URL
After deployment, Render will give you a URL like:
```
https://erudite-api.onrender.com
```

**Save this URL** - you'll need it for the frontend.

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Update API Configuration

Update `app/services/api.ts` with your Render backend URL:

```typescript
const baseURL = process.env.VITE_API_URL || 'https://erudite-api.onrender.com';
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});
```

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `build/client`
   - **Install Command:** `npm install`

5. Set **Environment Variables:**
   - `VITE_API_URL` = `https://erudite-api.onrender.com`

6. Click "Deploy"

### Step 3: Get Your Frontend URL
After deployment, Vercel will give you a URL like:
```
https://erudite.vercel.app
```

---

## Part 3: Configure CORS & URLs

### Update Backend `.env` (on Render):
```
CORS_ALLOWED_ORIGINS=https://erudite.vercel.app
APP_URL=https://erudite-api.onrender.com
```

### Update Backend Code (if needed):
Check `config/cors.php` to allow Vercel domain:
```php
'allowed_origins' => [
    'https://erudite.vercel.app',
    'https://*.vercel.app',
],
```

---

## Part 4: Database Migrations

After first deployment to Render:

1. SSH into Render (via Web Shell)
2. Run migrations:
   ```bash
   cd backend
   php artisan migrate --force
   ```

Or configure it in `render.yaml` (already done - runs on every deploy)

---

## Part 5: Testing the Deployment

### Test API:
```bash
curl https://erudite-api.onrender.com/api/health
# Should return: {"status": "ok"}
```

### Test Frontend:
Visit `https://erudite.vercel.app` in browser

### Test Login:
1. Try logging in with test credentials
2. Check browser Network tab to see API calls to Render
3. Verify responses are working

---

## Troubleshooting

### CORS Errors
**Error:** `Access to XMLHttpRequest at 'https://erudite-api.onrender.com' from origin 'https://erudite.vercel.app' blocked by CORS policy`

**Fix:** 
- Update `config/cors.php` in backend
- Restart backend deployment
- Clear browser cache

### 502 Bad Gateway on Render
**Cause:** Build failed or start command wrong

**Fix:**
- Check Render deployment logs
- Verify PHP is installed
- Check `render-build.sh` permissions
- Run `chmod +x backend/render-build.sh`

### Environment Variables Not Loading
**Fix:**
- On Vercel: Prefix with `VITE_` for frontend to access them
- On Render: No prefix needed in Laravel

### Database Connection Failed
**Cause:** Wrong credentials or IP not whitelisted

**Fix:**
- Double-check `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- On Render PostgreSQL, check "Connections" → "Private IP"
- Ensure IP allowlist includes Render's servers

---

## Performance Tips

1. **Enable Caching:**
   - Vercel automatically caches static assets
   - Run `php artisan config:cache` on Render

2. **Use Render's Auto-Sleep:**
   - Free tier services sleep after 15 mins of inactivity
   - Upgrade to "Standard" for always-on

3. **Database Backups:**
   - Render auto-backs up PostgreSQL daily
   - Download backups from Dashboard

4. **Monitor Logs:**
   - Vercel: Analytics → Performance
   - Render: Web Service → Logs

---

## Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Database migrations run
- [ ] CORS configured correctly
- [ ] Environment variables set on both platforms
- [ ] Test login works
- [ ] Test quiz submission works
- [ ] Test notifications work
- [ ] SSL/HTTPS working (automatic)
- [ ] Email sending configured (if needed)
- [ ] Backups enabled

---

## Quick Deployment Commands

**Re-deploy Frontend:**
```bash
git push  # Vercel auto-deploys on push
```

**Re-deploy Backend:**
```bash
git push  # Render auto-deploys on push
```

**Manual Force Redeploy on Render:**
- Dashboard → Web Service → Manual Deploy

---

## Support Links

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Laravel Deployment:** https://laravel.com/docs/deployment
