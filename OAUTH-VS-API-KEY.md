# 🔑 OAuth Credentials vs API Keys - What You Need

## ❌ DO NOT USE: API Keys
**API Keys** are for accessing Google APIs directly (like Maps API, Translate API, etc.)
- These are NOT what you need for login
- They look like: `AIzaSyAbc123...`
- Location: Google Cloud Console → APIs & Services → Credentials → API Keys

## ✅ USE: OAuth 2.0 Client Credentials
**OAuth 2.0 Client ID and Secret** are for user authentication (Google login)
- These ARE what you need
- Client ID looks like: `123456789-abc123xyz.apps.googleusercontent.com`
- Client Secret looks like: `GOCSPX-abc123xyz...`
- Location: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs

## 📍 Where to Find OAuth Credentials

### Step 1: Go to Google Cloud Console
1. Visit: **https://console.cloud.google.com/**
2. Select your project
3. Go to: **APIs & Services** → **Credentials**

### Step 2: Look for "OAuth 2.0 Client IDs"
- You should see a section called **"OAuth 2.0 Client IDs"**
- If you don't see any, click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

### Step 3: Create OAuth Client (if needed)
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. If prompted to configure consent screen:
   - **User Type**: External
   - **App name**: AutoCheckPro
   - **User support email**: Your email
   - Click through all steps
3. Back to creating OAuth client:
   - **Application type**: Web application
   - **Name**: AutoCheckPro Web
   - **Authorized redirect URIs**: `https://hg-verified-check.vercel.app/auth/google/callback`
   - Click **"Create"**

### Step 4: Copy Your Credentials
After creating, you'll see a popup with:
- **Your Client ID** (the long string ending in `.apps.googleusercontent.com`)
- **Your Client Secret** (starts with `GOCSPX-`)

**These are what you need for Vercel!**

## ✅ Vercel Environment Variables

Add these to Vercel:
- **GMAIL_CLIENT_ID** = Your OAuth Client ID (from step 4)
- **GMAIL_CLIENT_SECRET** = Your OAuth Client Secret (from step 4)

## 🔍 Quick Check

**If your Client ID looks like this:** ✅
```
123456789-abc123xyzdef.apps.googleusercontent.com
```
**Then you have the right one!**

**If your Client ID looks like this:** ❌
```
AIzaSyAbc123xyz...
```
**Then you have an API Key, not OAuth credentials!**

## 📝 Summary

| What You Need | What It's Called | Where to Find It |
|--------------|------------------|------------------|
| ✅ OAuth Client ID | `GMAIL_CLIENT_ID` | APIs & Services → Credentials → OAuth 2.0 Client IDs |
| ✅ OAuth Client Secret | `GMAIL_CLIENT_SECRET` | Same place as above |
| ❌ API Key | NOT NEEDED | APIs & Services → Credentials → API Keys (ignore this) |

**You need OAuth credentials, NOT API keys!**

