# 🚀 Complete Render + Supabase Deployment Guide (Backend + PostgreSQL Database)

## Overview
- **Frontend:** Vercel (React Router)
- **Backend:** Render Docker (Laravel)
- **Database:** Supabase PostgreSQL

**Estimated Time:** 20-30 minutes

---

## ✅ PREREQUISITE: Push Code to GitHub

### Step 0a: Initialize Git (if not already done)
```powershell
cd c:\Users\Public\Music\learner

# Check if git repo exists
git status

# If not, initialize git
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Step 0b: Create GitHub Repository
1. Go to https://github.com/new
2. Enter:
   - **Repository name:** `erudite-lms`
   - **Description:** ERUDITE Learning Management System
   - **Privacy:** Public (easier for Render)
3. Click **"Create repository"**
4. **DO NOT** initialize with README (you already have code)

### Step 0c: Push Code to GitHub
```powershell
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/erudite-lms.git

# Rename to main branch
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit - ERUDITE LMS with Docker and Supabase config"

# Push to GitHub
git push -u origin main
```

**✅ Verify:** Go to https://github.com/YOUR_USERNAME/erudite-lms and see your code

---

## 🗄️ STEP 1: Create Supabase PostgreSQL Database

### Step 1a: Sign Up to Supabase
1. Go to https://supabase.com
2. Click **"Start Your Project"** or **"Sign Up"**
3. Choose **"Continue with GitHub"** (easier)
4. Authorize Supabase
5. Verify your email

### Step 1b: Create New Project
1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in:
   ```
   Project Name:      erudite-lms
   Database Password:  (auto-generated or create strong password)
   Region:            Choose closest to you
   ```
4. Click **"Create New Project"**

### Step 1c: Wait for Database Creation
- Takes 2-3 minutes
- Status: "Setting up your database..."
- Then shows dashboard ✅

### Step 1d: Get Connection Details
1. Go to **"Project Settings"** (bottom left gear icon)
2. Click **"Database"** tab
3. Look for **"Connection Pooling"** or **"Connection String"**
4. Copy the following info:

**Connection String Format:**
```
postgresql://postgres:[password]@[host]:[port]/postgres
```

**Extract these values:**
```
Host:     [host-from-connection-string]
Port:     5432
Database: postgres
Username: postgres
Password: [password-you-created]
```

**Example:**
```
Host:     db.xxxxxxxxxxxxx.supabase.co
Port:     5432
Database: postgres
Username: postgres
Password: abc123XyZ789abc
```

⚠️ **Save these values!** You'll need them for Render.

---

## 🐳 STEP 2: Deploy Backend to Render

### Step 2a: Create Web Service
1. Go to https://render.com/dashboard
2. Click **"New +"** button
3. Select **"Web Service"**
4. Click **"Connect GitHub account"** (or link existing)
5. Search for **`erudite-lms`** repository
6. Click **"Connect"**

### Step 2b: Configure Web Service

**Basic Settings:**
```
Name:               erudite-api
Branch:             main
Region:             Oregon (us-west)
Runtime:            Docker (auto-selected)
```

**Build Settings (auto-detected):**
```
Dockerfile path:    backend/Dockerfile
Docker Context:     ./
Build Command:      (leave blank - Docker builds it)
Start Command:      (leave blank - Dockerfile CMD runs it)
```

### Step 2c: Add Environment Variables

Click **"Advanced"** section, then **"Add Environment Variable"** for each:

| KEY | VALUE |
|-----|-------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `LOG_CHANNEL` | `stderr` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | `db.xxxxxxxxxxxxx.supabase.co` (from Step 1d) |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | `postgres` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `abc123XyZ789abc` (from Step 1d) |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (update after Vercel deploy) |
| `SESSION_DRIVER` | `cookie` |

### Step 2d: Select Instance Type
- Choose **"Free"** to test (or **"Starter"** $7/mo for better performance)
- Free tier works fine for testing

### Step 2e: Deploy
Click **"Deploy Web Service"**

**Status Updates:**
- "Building..." (3-5 minutes)
- "Deploying..." (2-3 minutes)
- "Live" ✅ (green indicator)

### Step 2f: Get Backend URL
Once deployed, Render shows your URL:
```
https://erudite-api.onrender.com
```

**📌 Save this URL** - you'll need it for Vercel frontend config

---

## ✅ STEP 3: Verify Backend Deployment

### Step 3a: Check API Health
Open in browser or terminal:
```bash
curl https://erudite-api.onrender.com/api/health
```

**Expected Response:**
```json
{"status":"ok"}
```

### Step 3b: Check Logs
In Render dashboard:
1. Click on **"erudite-api"** service
2. Go to **"Logs"** tab
3. Look for messages like:
   ```
   Migration: 2024_01_01_000000_create_users_table
   Migration: 2024_01_02_000000_create_courses_table
   ✓ Migrations completed
   Laravel development server started: http://0.0.0.0:8000
   ```

### Step 3c: Test API Endpoint
```bash
curl https://erudite-api.onrender.com/api/auth/check
```

### Step 3d: Verify Database Connection
Check logs for:
```
✓ Connected to PostgreSQL database
✓ All migrations completed successfully
```

If you see connection errors, go back to Render Environment variables and verify the Supabase credentials.

---

## 🌐 STEP 4: Deploy Frontend to Vercel

### Step 4a: Go to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub (or sign in)
3. Click **"Add New..."** → **"Project"**
4. Find **"erudite-lms"** repo
5. Click **"Import"**

### Step 4b: Configure Build
```
Framework:          React Router (auto-detected)
Build Command:      npm run build
Output Directory:   build/client
Install Command:    npm install
```

### Step 4c: Add Environment Variable
1. Scroll to **"Environment Variables"**
2. Click **"Add"**
3. Enter:
   ```
   Name:  VITE_API_URL
   Value: https://erudite-api.onrender.com
   ```

### Step 4d: Deploy
Click **"Deploy"**

**Your Frontend URL:**
```
https://erudite-lms.vercel.app
```

---

## 🔗 STEP 5: Update Backend CORS

Now that you have your Vercel URL:

1. Go back to Render dashboard
2. Click on **"erudite-api"** service
3. Go to **"Environment"** tab
4. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://erudite-lms.vercel.app
   ```
5. Render auto-redeploys (check "Deployments" tab)

---

## 🧪 STEP 6: Test Full Integration

### Test Authentication Flow
```bash
# 1. Register
curl -X POST https://erudite-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }'

# 2. Login
curl -X POST https://erudite-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Test Frontend
Open: https://erudite-lms.vercel.app

Try:
- ✅ Register a new account
- ✅ Login with that account
- ✅ Access dashboard
- ✅ Create a course (if admin)

---

## 🐛 TROUBLESHOOTING

### Database Connection Error
**Error:** `SQLSTATE[HY000] [2002] Connection refused` or `SQLSTATE[08006]`

**Fix:**
1. Go to Supabase dashboard → Project Settings → Database
2. Copy the exact connection string again
3. Update DB_HOST, DB_PASSWORD, DB_USERNAME in Render environment
4. Redeploy in Render: Click "Manual Deploy"

### API Not Responding
**Error:** `https://erudite-api.onrender.com` shows 404 or timeout

**Fix:**
1. Check Render logs for deployment errors
2. Look for: "Laravel development server started" in logs
3. If migrations failed, check database credentials
4. Try: `curl https://erudite-api.onrender.com/api/health`

### CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Fix:**
1. Go to Render → erudite-api → Environment
2. Update `CORS_ALLOWED_ORIGINS` with exact Vercel URL
3. Redeploy

### Supabase Connection Pool Issues
**Error:** `too many connections` or connection timeout

**Fix:**
1. Go to Supabase dashboard
2. Project Settings → Database
3. Increase "Connection Limit" (max 100)
4. Use Connection Pooling mode if available

### Free Tier Spinning Down
**Problem:** Service stops after 15 minutes of inactivity

**Solution:** Upgrade Render to Starter ($7/mo) for continuous uptime

---

## 📊 Your Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🌐 Vercel Frontend                                        │
│  https://erudite-lms.vercel.app                            │
│  (React Router + Vite)                                      │
│                                                             │
│              ↓ VITE_API_URL ↓                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🐳 Render Backend (Docker)                                │
│  https://erudite-api.onrender.com                          │
│  (Laravel + PHP 8.2)                                        │
│                                                             │
│              ↓ DB_CONNECTION ↓                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🗄️  Supabase PostgreSQL Database                          │
│  db.xxxxxxxxxxxxx.supabase.co:5432                         │
│  postgres (database)                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Supabase connection details saved (Host, Port, Database, Username, Password)
- [ ] Backend Docker service deployed on Render
- [ ] Supabase credentials added to Render environment variables
- [ ] Backend URL copied and tested
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL set in Vercel
- [ ] CORS_ALLOWED_ORIGINS set in Render
- [ ] API health check working
- [ ] Database migrations completed successfully
- [ ] Frontend can login to backend
- [ ] All features working in production

---

## 🎉 You're Done!

Your ERUDITE LMS is now live and ready to use!

- **Frontend:** https://erudite-lms.vercel.app
- **API:** https://erudite-api.onrender.com
- **Database:** Supabase PostgreSQL

**Next Steps:**
- Monitor logs regularly
- Set up error tracking (Sentry)
- Consider upgrading tiers for better performance
- Add custom domain names
- Set up Supabase backups
- Enable Row Level Security (RLS) in Supabase for data protection

---

## ✅ PREREQUISITE: Push Code to GitHub

### Step 0a: Initialize Git (if not already done)
```powershell
cd c:\Users\Public\Music\learner

# Check if git repo exists
git status

# If not, initialize git
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Step 0b: Create GitHub Repository
1. Go to https://github.com/new
2. Enter:
   - **Repository name:** `erudite-lms`
   - **Description:** ERUDITE Learning Management System
   - **Privacy:** Public (easier for Render)
3. Click **"Create repository"**
4. **DO NOT** initialize with README (you already have code)

### Step 0c: Push Code to GitHub
```powershell
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/erudite-lms.git

# Rename to main branch
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit - ERUDITE LMS with Docker and PostgreSQL config"

# Push to GitHub
git push -u origin main
```

**✅ Verify:** Go to https://github.com/YOUR_USERNAME/erudite-lms and see your code

---

## 🗄️ STEP 1: Create Render PostgreSQL Database

### Step 1a: Sign Up to Render
1. Go to https://render.com
2. Click **"Sign up"**
3. Select **"GitHub"** (easier authentication)
4. Authorize Render to access your GitHub account
5. Verify your email

### Step 1b: Create PostgreSQL Database
1. Go to https://render.com/dashboard
2. Click **"New +"** button (top right)
3. Select **"PostgreSQL"**
4. Fill in the form:
   ```
   Name:              erudite_db
   Database:          erudite
   User:              erudite_user
   Region:            Oregon (us-west)
   PostgreSQL Version: 15 (or latest)
   ```
5. Click **"Create Database"**

### Step 1c: Wait for Database Creation
- Takes 2-3 minutes
- You'll see status: "Creating..."
- Then: "Available" ✅

### Step 1d: Copy Database Connection Info
Once created, you'll see a page with:
```
Hostname:    (copy this)
Port:        5432
Database:    erudite
Username:    erudite_user
Password:    (copy this - it's auto-generated)
```

**⚠️ IMPORTANT:** Save these values! You'll need them.

**Example:**
```
Hostname: dpg-abc123xyz.render.onrender.com
Port: 5432
Database: erudite
Username: erudite_user
Password: abc123xyz789abc123xyz789abc
```

---

## 🐳 STEP 2: Deploy Backend as Docker Service

### Step 2a: Create Web Service
1. Go back to https://render.com/dashboard
2. Click **"New +"** button
3. Select **"Web Service"**
4. Click **"Connect GitHub account"** (or link existing)
5. Search for **`erudite-lms`** repository
6. Click **"Connect"**

### Step 2b: Configure Web Service

**Basic Settings:**
```
Name:               erudite-api
Branch:             main
Region:             Oregon (us-west)
Runtime:            Docker (auto-selected)
```

**Build Settings (auto-detected):**
```
Dockerfile path:    backend/Dockerfile
Docker Context:     ./
Build Command:      (leave blank - Docker builds it)
Start Command:      (leave blank - Dockerfile CMD runs it)
```

### Step 2c: Add Environment Variables

Click **"Advanced"** section, then **"Add Environment Variable"** for each:

| KEY | VALUE |
|-----|-------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `LOG_CHANNEL` | `stderr` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | `dpg-abc123xyz.render.onrender.com` (from Step 1d) |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | `erudite` |
| `DB_USERNAME` | `erudite_user` |
| `DB_PASSWORD` | `abc123xyz789abc123xyz789abc` (from Step 1d) |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (update after Vercel deploy) |
| `SESSION_DRIVER` | `cookie` |

### Step 2d: Select Instance Type
- Choose **"Free"** to test (or **"Starter"** $7/mo for better performance)
- Free tier works fine for testing

### Step 2e: Deploy
Click **"Deploy Web Service"**

**Status Updates:**
- "Building..." (3-5 minutes)
- "Deploying..." (2-3 minutes)
- "Live" ✅ (green indicator)

### Step 2f: Get Backend URL
Once deployed, Render shows your URL:
```
https://erudite-api.onrender.com
```

**📌 Save this URL** - you'll need it for Vercel frontend config

---

## ✅ STEP 3: Verify Backend Deployment

### Step 3a: Check API Health
Open in browser or terminal:
```bash
curl https://erudite-api.onrender.com/api/health
```

**Expected Response:**
```json
{"status":"ok"}
```

### Step 3b: Check Logs
In Render dashboard:
1. Click on **"erudite-api"** service
2. Go to **"Logs"** tab
3. Look for messages like:
   ```
   Migration: 2024_01_01_000000_create_users_table
   Migration: 2024_01_02_000000_create_courses_table
   ✓ Migrations completed
   Laravel development server started: http://0.0.0.0:8000
   ```

### Step 3c: Test API Endpoint
```bash
curl https://erudite-api.onrender.com/api/auth/check
```

---

## 🌐 STEP 4: Deploy Frontend to Vercel

### Step 4a: Go to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub (or sign in)
3. Click **"Add New..."** → **"Project"**
4. Find **"erudite-lms"** repo
5. Click **"Import"**

### Step 4b: Configure Build
```
Framework:          React Router (auto-detected)
Build Command:      npm run build
Output Directory:   build/client
Install Command:    npm install
```

### Step 4c: Add Environment Variable
1. Scroll to **"Environment Variables"**
2. Click **"Add"**
3. Enter:
   ```
   Name:  VITE_API_URL
   Value: https://erudite-api.onrender.com
   ```

### Step 4d: Deploy
Click **"Deploy"**

**Your Frontend URL:**
```
https://erudite-lms.vercel.app
```

---

## 🔗 STEP 5: Update Backend CORS

Now that you have your Vercel URL:

1. Go back to Render dashboard
2. Click on **"erudite-api"** service
3. Go to **"Environment"** tab
4. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://erudite-lms.vercel.app
   ```
5. Render auto-redeploys (check "Deployments" tab)

---

## 🧪 STEP 6: Test Full Integration

### Test Authentication Flow
```bash
# 1. Register
curl -X POST https://erudite-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }'

# 2. Login
curl -X POST https://erudite-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Test Frontend
Open: https://erudite-lms.vercel.app

Try:
- ✅ Register a new account
- ✅ Login with that account
- ✅ Access dashboard
- ✅ Create a course (if admin)

---

## 🐛 TROUBLESHOOTING

### Database Connection Error
**Error:** `SQLSTATE[HY000] [2002] Connection refused`

**Fix:**
1. Check `DB_HOST`, `DB_PASSWORD` in Render environment
2. Verify PostgreSQL database status (should be "Available")
3. Redeploy service: Click "Manual Deploy"

### API Not Responding
**Error:** `https://erudite-api.onrender.com` shows 404 or timeout

**Fix:**
1. Check Render logs for deployment errors
2. Look for: "Laravel development server started" in logs
3. If migrations failed, check database credentials
4. Try: `curl https://erudite-api.onrender.com/api/health`

### CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Fix:**
1. Go to Render → erudite-api → Environment
2. Update `CORS_ALLOWED_ORIGINS` with exact Vercel URL
3. Redeploy

### Free Tier Spinning Down
**Problem:** Service stops after 15 minutes of inactivity

**Solution:** Upgrade to Starter ($7/mo) for continuous uptime

---

## 📊 Your Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🌐 Vercel Frontend                                        │
│  https://erudite-lms.vercel.app                            │
│  (React Router + Vite)                                      │
│                                                             │
│              ↓ VITE_API_URL ↓                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🐳 Render Backend (Docker)                                │
│  https://erudite-api.onrender.com                          │
│  (Laravel + PHP 8.2)                                        │
│                                                             │
│              ↓ DB_CONNECTION ↓                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🗄️  Render PostgreSQL Database                            │
│  dpg-xxx.render.onrender.com:5432                          │
│  erudite (database)                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created on Render
- [ ] Backend Docker service deployed on Render
- [ ] Backend URL copied and tested
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL set in Vercel
- [ ] CORS_ALLOWED_ORIGINS set in Render
- [ ] API health check working
- [ ] Frontend can login to backend
- [ ] All features working in production

---

## 🎉 You're Done!

Your ERUDITE LMS is now live and ready to use!

- **Frontend:** https://erudite-lms.vercel.app
- **API:** https://erudite-api.onrender.com
- **Database:** PostgreSQL on Render

**Next Steps:**
- Monitor logs regularly
- Set up error tracking (Sentry)
- Consider upgrading to paid tiers for better performance
- Add custom domain names
