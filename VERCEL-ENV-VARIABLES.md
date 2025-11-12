# Vercel Environment Variables - Quick Setup Guide

## 🔴 CRITICAL - Required for Login & Lookups

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

### 1. **VDGI_API_KEY** (Required for Vehicle Lookups)
   - Your Vehicle Data UK API key
   - Without this, lookups will fail
   - Get from: https://portal.vehicledataglobal.com

### 2. **GMAIL_CLIENT_ID** (Required for Google Login)
   - Google OAuth Client ID
   - Get from: https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID

### 3. **GMAIL_CLIENT_SECRET** (Required for Google Login)
   - Google OAuth Client Secret
   - Get from same place as GMAIL_CLIENT_ID

### 4. **BASE_URL** (Required for OAuth Callback)
   - Your Vercel app URL
   - Format: `https://your-app-name.vercel.app`
   - Example: `https://hg-verified-check.vercel.app`
   - ⚠️ **CRITICAL**: Must match your actual Vercel URL exactly

### 5. **SESSION_SECRET** (Required for Sessions)
   - Random secret string for session encryption
   - Generate with: `openssl rand -base64 32`
   - Or use any long random string

## 🟡 Important - For Full Functionality

### 6. **DATABASE_URL** (Required for Database)
   - Your Neon PostgreSQL connection string
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - Get from: https://console.neon.tech

### 7. **STRIPE_SECRET_KEY** (For Payments)
   - Your Stripe secret key (starts with `sk_`)
   - Get from: https://dashboard.stripe.com/apikeys

### 8. **VITE_STRIPE_PUBLIC_KEY** (For Payments)
   - Your Stripe publishable key (starts with `pk_`)
   - Get from: https://dashboard.stripe.com/apikeys

## 📝 How to Add in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:
   - **Key**: The variable name (e.g., `VDGI_API_KEY`)
   - **Value**: The actual value
   - **Environment**: Select **Production**, **Preview**, and **Development** (or just Production)
6. Click **Save**
7. **Redeploy** your project after adding variables

## ⚠️ Important Notes

- **BASE_URL** must be your exact Vercel URL (e.g., `https://hg-verified-check.vercel.app`)
- After adding variables, you **MUST redeploy** for them to take effect
- Variables are case-sensitive
- Make sure to add them for the correct environment (Production/Preview/Development)

## 🔍 Quick Check

After adding variables, check Vercel function logs to see if they're loaded:
- Go to: Vercel Dashboard → Your Project → Functions → View Logs
- Look for messages like:
  - `✅ Gmail Client ID available: true`
  - `✅ API Key available: true`

