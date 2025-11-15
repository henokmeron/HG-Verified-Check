# 🔴 CRITICAL: Fix Google OAuth Configuration

## ❌ Issues Found in Your Google Cloud Console:

1. **JavaScript Origin appears truncated**: Shows "https://hg-verifie" (should be complete)
2. **Callback URL might be using preview URL**: Code uses `VERCEL_URL` which can be a preview deployment

## ✅ Step-by-Step Fix:

### Step 1: Fix JavaScript Origin in Google Cloud Console

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Click on your OAuth 2.0 Client ID: `795787923261-8ejac2mct0cbvhdlk0hii11g8ehi4sq5`
3. In **"Authorized JavaScript origins"** section:
   - **DELETE** any incomplete or truncated entries
   - **ADD** this EXACT URL (no trailing slash):
     ```
     https://hg-verified-check.vercel.app
     ```
   - ⚠️ **CRITICAL**: Must be `https://` (not `http://`)
   - ⚠️ **CRITICAL**: No trailing slash
   - ⚠️ **CRITICAL**: Must match your production domain exactly

### Step 2: Verify Redirect URI

Your redirect URI looks correct:
```
https://hg-verified-check.vercel.app/auth/google/callback
```

**Double-check:**
- ✅ No trailing slash
- ✅ Uses `https://`
- ✅ Matches exactly what's in the code

### Step 3: Set BASE_URL in Vercel

1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **ADD** a new environment variable:
   - **Name**: `BASE_URL`
   - **Value**: `https://hg-verified-check.vercel.app`
   - **Environment**: Production (and Preview if you want)
3. Click **"Save"**

### Step 4: Redeploy

After setting `BASE_URL`:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger a new deployment

## 🔍 Verify Your Configuration:

### In Google Cloud Console, you should have:

**Authorized JavaScript origins:**
```
https://hg-verified-check.vercel.app
```

**Authorized redirect URIs:**
```
https://hg-verified-check.vercel.app/auth/google/callback
```

### In Vercel Environment Variables, you should have:

- `GMAIL_CLIENT_ID`: `795787923261-8ejac2mct0cbvhdlk0hii11g8ehi4sq5.apps.googleusercontent.com`
- `GMAIL_CLIENT_SECRET`: (your secret)
- `BASE_URL`: `https://hg-verified-check.vercel.app` ← **ADD THIS**
- `DATABASE_URL`: (your database URL)
- `SESSION_SECRET`: (your session secret)

## ⚠️ Common Mistakes:

### ❌ Wrong JavaScript Origin:
```
https://hg-verifie  (truncated)
http://hg-verified-check.vercel.app  (http instead of https)
https://hg-verified-check.vercel.app/  (trailing slash)
```

### ✅ Correct JavaScript Origin:
```
https://hg-verified-check.vercel.app
```

## 📝 After Making Changes:

1. **Wait 5-10 minutes** for Google's changes to propagate
2. **Redeploy** your Vercel app
3. **Try logging in again**
4. **Check Vercel logs** for:
   - `🔗 OAuth Callback URL: https://hg-verified-check.vercel.app/auth/google/callback`
   - This should match your Google Cloud Console redirect URI exactly

