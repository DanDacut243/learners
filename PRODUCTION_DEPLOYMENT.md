# 🚀 DEPLOYMENT GUIDE - ERUDITE LMS to Production

## Overview
Deploy your ERUDITE LMS to **Vercel** (Frontend) + **Render** (Backend)

**Estimated Time:** 15-20 minutes total

---

## Prerequisites
- GitHub account (free at https://github.com)
- Vercel account (free at https://vercel.com)
- Render account (free at https://render.com)

---

## STEP 1: Push Code to GitHub

### 1a. Create GitHub Repository
```bash
# Go to https://github.com/new
# Repository name: erudite-lms
# Description: ERUDITE Learning Management System
# Click "Create repository"
```

### 1b. Add Remote & Push
```bash
cd c:\Users\Public\Music\learner

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/erudite-lms.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Expected Output:**
```
Counting objects: 100%
Compressing objects: 100%
Writing objects: 100%
...
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **Check:** Go to https://github.com/YOUR_USERNAME/erudite-lms - you should see your code

---

## STEP 2: Deploy Frontend to Vercel

### 2a. Connect Vercel to GitHub
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel
5. Search for **"erudite-lms"** repository
6. Click **"Import"**

### 2b. Configure Build Settings
- **Framework:** React Router (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `build/client`
- **Install Command:** `npm install` (default)

### 2c. Add Environment Variables
Click **"Environment Variables"** and add:

```
VITE_API_URL=https://YOUR_RENDER_BACKEND_URL/api
```

(You'll get the backend URL after deploying backend)

### 2d. Deploy
Click **"Deploy"** and wait 3-5 minutes

✅ **Check:** Vercel will show a success message with your URL  
Example: `https://erudite-lms.vercel.app`

---

## STEP 3: Deploy Backend to Render

### 3a. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easier)
3. Verify email

### 3b. Create Web Service
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub account"**
4. Select **"erudite-lms"** repository
5. Click **"Connect"**

### 3c. Configure Service
Fill in these settings:

**Basic Settings:**
- **Name:** `erudite-api`
- **Environment:** `PHP`
- **Region:** `Oregon` (closest to most users)
- **Plan:** `Free` (starter)

**Build & Deploy:**
- **Build Command:** 
  ```
  cd backend && composer install && php artisan migrate --force
  ```
- **Start Command:**
  ```
  cd backend && php -S 0.0.0.0:8000 -t public
  ```

### 3d. Add Environment Variables
Click **"Environment"** and add these:

```
APP_NAME=ERUDITE
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_URL=https://YOUR_RENDER_BACKEND_URL

DB_CONNECTION=mysql
DB_HOST=YOUR_MYSQL_HOST
DB_PORT=3306
DB_DATABASE=erudite
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD

SANCTUM_STATEFUL_DOMAINS=erudite-lms.vercel.app,YOUR_RENDER_URL
SESSION_DRIVER=cookie

CORS_ALLOWED_ORIGINS=https://erudite-lms.vercel.app
```

### 3e. Create MySQL Database
1. In Render dashboard, click **"New +"** → **"MySQL"**
2. **Name:** `erudite-db`
3. **Region:** `Oregon`
4. **Plan:** `Free`
5. Click **"Create Database"**
6. Wait for database to be ready (~2 minutes)
7. Copy connection details to `.env` variables

### 3f. Deploy Backend
Click **"Create Web Service"** and wait 5-10 minutes for deployment

✅ **Check:** Render shows deployment URL  
Example: `https://erudite-api.onrender.com`

---

## STEP 4: Update Frontend Environment Variables

1. Go back to **Vercel Dashboard**
2. Select your **erudite-lms** project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL` to your actual Render backend URL:
   ```
   VITE_API_URL=https://erudite-api.onrender.com/api
   ```
5. Click **"Save"**
6. Go to **Deployments** and click **"Redeploy"** on latest build

---

## STEP 5: Test Production URLs

### 5a. Test Frontend
1. Open `https://erudite-lms.vercel.app`
2. Check:
   - Page loads without errors
   - Can navigate to login
   - Can see all routes

### 5b. Test Backend API
```bash
# Test health endpoint
curl https://erudite-api.onrender.com/api/health

# Test login (replace with real credentials)
curl -X POST https://erudite-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@test.com","password":"password"}'
```

### 5c. Test Full Workflows
1. **Login flow:** Username + password → Dashboard
2. **Learning outcomes:** Create outcome → See in student view
3. **Assignments:** Submit → Grade → See grade
4. **Messaging:** Send message → Receive notification
5. **Badges:** View earned badges
6. **Leaderboard:** Check rankings

---

## Troubleshooting

### Frontend Build Failed on Vercel
**Solution:**
```bash
# Locally:
npm run build
npm run lint  # Check for TypeScript errors
```
Then push fix to GitHub, Vercel auto-redeploys

### Backend Returns 502 Bad Gateway
**Solution:**
- Check Render logs: Render Dashboard → Logs
- Verify `php artisan migrate --force` ran
- Check database connection variables
- Restart service: Render Dashboard → Manual Deploy

### API Calls Show CORS Error
**Solution:**
1. Update `backend/config/cors.php`:
   ```php
   'allowed_origins' => [env('CORS_ALLOWED_ORIGINS', '*')]
   ```
2. Redeploy backend

### Database Migrations Failed
**Solution:**
```bash
# Via Render terminal:
cd backend
php artisan migrate:status
php artisan migrate --force --path=/database/migrations/2026_04_28_000001_create_learning_outcomes_table.php
php artisan migrate --force
```

---

## Production Checklist

- [ ] GitHub repository created and code pushed
- [ ] Vercel deployment successful
- [ ] Render backend deployment successful
- [ ] MySQL database created and migrated
- [ ] Environment variables configured
- [ ] Frontend API URL points to backend
- [ ] Can login and navigate
- [ ] Can create learning outcomes
- [ ] Can submit assignments
- [ ] Can send messages
- [ ] Badges and leaderboard display
- [ ] No console errors (F12)
- [ ] API calls return 200 status

---

## Live URLs (After Deployment)

**Frontend:** `https://erudite-lms.vercel.app`  
**Backend API:** `https://erudite-api.onrender.com/api`  
**Database:** Render MySQL

---

## Next Steps (Optional)

### Add Custom Domain (Vercel)
1. Vercel Dashboard → Settings → Domains
2. Add your domain name
3. Update DNS records per Vercel instructions

### Enable CDN & Caching (Vercel)
Already enabled by default on Vercel ✅

### Monitor Performance (Render)
Render Dashboard → Metrics → View CPU/Memory/Disk usage

### Setup Error Alerts
Both Render and Vercel have built-in error logging

---

## Support

**Vercel Issues:** https://vercel.com/docs  
**Render Issues:** https://render.com/docs  
**Laravel Issues:** https://laravel.com/docs

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Push to GitHub | 5 min | ⏳ Your turn |
| Deploy Frontend | 5 min | ⏳ Your turn |
| Create Database | 5 min | ⏳ Your turn |
| Deploy Backend | 5 min | ⏳ Your turn |
| Test Production | 5 min | ⏳ Your turn |

**Total:** ~25 minutes to fully deployed production system

---

**Ready?** Start with Step 1! 🚀
