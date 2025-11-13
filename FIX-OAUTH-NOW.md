# 🔴 URGENT: Fix Google OAuth "invalid_client" Error

## ✅ GOOD NEWS: Your Route is Working!
The fact you're seeing Google's error page means `/auth/google` is working! The problem is Google rejecting your credentials.

## 🔴 The Problem
**"Error 401: invalid_client"** = Your `GMAIL_CLIENT_ID` or `GMAIL_CLIENT_SECRET` in Vercel doesn't match Google Cloud Console.

## ✅ Step-by-Step Fix (Do This Now)

### Step 1: Go to Google Cloud Console
1. Visit: **https://console.cloud.google.com/**
2. Select your project (or create one if needed)

### Step 2: Create OAuth 2.0 Credentials
1. Go to: **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If you see "Configure consent screen" first:
   - Click it
   - **User Type**: External
   - **App name**: AutoCheckPro
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"** through all steps
   - **Scopes**: Add `email` and `profile`
   - Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 3: Create OAuth Client
1. Back in **Credentials**, click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. **Application type**: Web application
3. **Name**: AutoCheckPro Web
4. **Authorized JavaScript origins**: 
   ```
   https://hg-verified-check.vercel.app
   ```
5. **Authorized redirect URIs** (CRITICAL - must be EXACT):
   ```
   https://hg-verified-check.vercel.app/auth/google/callback
   ```
   ⚠️ **NO trailing slash, exact match!**
6. Click **"Create"**

### Step 4: Copy Your Credentials
After creating, you'll see a popup with:
- **Your Client ID** (looks like: `123456789-abc123xyz.apps.googleusercontent.com`)
- **Your Client Secret** (looks like: `GOCSPX-abc123xyz...`)

**COPY BOTH NOW!**

### Step 5: Add to Vercel (CRITICAL)
1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **DELETE** any existing `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` (if they exist)
3. **Add NEW**:
   - **Key**: `GMAIL_CLIENT_ID`
   - **Value**: Paste the Client ID from Google (the whole thing, starting with numbers)
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**
4. **Add NEW**:
   - **Key**: `GMAIL_CLIENT_SECRET`
   - **Value**: Paste the Client Secret from Google (the whole thing, starting with `GOCSPX-`)
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**
5. **Add/Update**:
   - **Key**: `BASE_URL`
   - **Value**: `https://hg-verified-check.vercel.app`
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

### Step 6: REDEPLOY (MANDATORY)
1. Go to: **Vercel Dashboard** → Your Project → **Deployments**
2. Click the **⋯** (three dots) on your latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 7: Test
1. Visit: `https://hg-verified-check.vercel.app/auth/google`
2. You should see Google's account picker (not an error)

## 🔍 Verify Your Setup

### Check Vercel Logs
1. Go to: **Vercel Dashboard** → Your Project → **Functions** → **View Logs**
2. Look for:
   - `🔍 /auth/google route hit!` (when you try to login)
   - `✅ Passport configured`
   - `✅ Redirecting to Google OAuth`

### Common Mistakes
- ❌ Client ID has extra spaces or newlines
- ❌ Client Secret is wrong
- ❌ Redirect URI doesn't match exactly (trailing slash, http vs https)
- ❌ Didn't redeploy after adding variables
- ❌ Variables added to wrong environment (only Development, not Production)

## ✅ Success Checklist
- [ ] OAuth client created in Google Cloud Console
- [ ] Redirect URI is exactly: `https://hg-verified-check.vercel.app/auth/google/callback`
- [ ] `GMAIL_CLIENT_ID` added to Vercel (all environments)
- [ ] `GMAIL_CLIENT_SECRET` added to Vercel (all environments)
- [ ] `BASE_URL` set to `https://hg-verified-check.vercel.app`
- [ ] Project redeployed after adding variables
- [ ] Can access `/auth/google` without "Cannot GET" error
- [ ] Google shows account picker (not "invalid_client" error)

## 🆘 Still Not Working?

If you still see "invalid_client" after following all steps:

1. **Double-check the Client ID** in Vercel matches Google Cloud Console exactly
2. **Double-check the Client Secret** in Vercel matches Google Cloud Console exactly
3. **Verify redirect URI** in Google Cloud Console is exactly: `https://hg-verified-check.vercel.app/auth/google/callback`
4. **Check Vercel logs** to see what Client ID is being used
5. **Try creating a NEW OAuth client** in Google Cloud Console and updating Vercel

The route is working - this is just a configuration issue that can be fixed!

