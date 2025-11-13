# Google OAuth Setup Guide - FIX "invalid_client" Error

## 🔴 The Error You're Seeing

**"Access blocked: Authorization Error"**  
**"The OAuth client was not found"**  
**"Error 401: invalid_client"**

This means your `GMAIL_CLIENT_ID` or `GMAIL_CLIENT_SECRET` in Vercel is either:
- ❌ Missing
- ❌ Incorrect (typo)
- ❌ Not matching your Google Cloud Console OAuth client
- ❌ Callback URL not configured in Google Cloud Console

## ✅ Step-by-Step Fix

### 1. Go to Google Cloud Console

1. Visit: **https://console.cloud.google.com/**
2. Select your project (or create a new one)
3. Go to: **APIs & Services** → **Credentials**

### 2. Create OAuth 2.0 Client ID

1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - **User Type**: External (for public use)
   - **App name**: AutoCheckPro (or your app name)
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"**
   - **Scopes**: Add `email` and `profile`
   - **Test users**: Add your email (optional for testing)
   - Click **"Save and Continue"**

4. Back in Credentials, create OAuth client:
   - **Application type**: Web application
   - **Name**: AutoCheckPro Web Client
   - **Authorized JavaScript origins**: 
     ```
     https://hg-verified-check.vercel.app
     https://hg-verified-check-*.vercel.app
     ```
   - **Authorized redirect URIs** (CRITICAL - must match exactly):
     ```
     https://hg-verified-check.vercel.app/auth/google/callback
     ```
   - Click **"Create"**

### 3. Copy Your Credentials

After creating, you'll see:
- **Client ID** (starts with something like `123456789-abc...`)
- **Client Secret** (starts with `GOCSPX-...`)

**Copy both of these!**

### 4. Add to Vercel Environment Variables

1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

   **GMAIL_CLIENT_ID**
   - Value: Your Client ID from Google Cloud Console
   - Environment: Production, Preview, Development

   **GMAIL_CLIENT_SECRET**
   - Value: Your Client Secret from Google Cloud Console
   - Environment: Production, Preview, Development

   **BASE_URL**
   - Value: `https://hg-verified-check.vercel.app` (your exact Vercel URL)
   - Environment: Production, Preview, Development

3. **Redeploy** your project after adding variables

## ✅ Verify Your Setup

After redeploying, the login should:
1. Show a professional Google sign-in page
2. Let users **select which Gmail account** to use (Google's standard account picker)
3. Redirect back to your app after authentication

## 🔍 Troubleshooting

### Still getting "invalid_client"?

1. **Check Vercel logs**:
   - Go to Vercel Dashboard → Your Project → Functions → View Logs
   - Look for: `📧 Gmail Client ID available: true`
   - If it says `false`, the variable isn't set correctly

2. **Verify callback URL matches exactly**:
   - In Google Cloud Console, your redirect URI must be:
     ```
     https://hg-verified-check.vercel.app/auth/google/callback
     ```
   - No trailing slash, exact match

3. **Check for typos**:
   - `GMAIL_CLIENT_ID` (not `GMAIL_CLIENT_ID_` or `GMAIL_CLIENTID`)
   - `GMAIL_CLIENT_SECRET` (not `GMAIL_CLIENT_SECRET_`)

4. **Redeploy after adding variables**:
   - Environment variables only take effect after redeployment

## 📝 Multiple Gmail Accounts

The Google OAuth flow **automatically** shows an account picker if the user has multiple Gmail accounts signed in. This is standard Google behavior - no code changes needed!

Users will see:
1. Google's account selection screen
2. Can choose any of their Gmail accounts
3. Can add a new account if needed

This is the professional, standard way Google OAuth works!

