# VERCEL ENVIRONMENT VARIABLES - COMPLETE SETUP

## 🔴 CRITICAL: Add These Missing Variables

Go to: **https://vercel.com/your-project/settings/environment-variables**

---

## 1. STRIPE KEYS (Required for Payments)

### Add these 2 variables:

**Variable 1:**
- **Name**: `STRIPE_SECRET_KEY`
- **Value**: `sk_test_51...` (your Stripe secret key - starts with `sk_test_` or `sk_live_`)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**
- **Name**: `VITE_STRIPE_PUBLIC_KEY`
- **Value**: `pk_test_51...` (your Stripe publishable key - starts with `pk_test_` or `pk_live_`)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**Where to find your Stripe keys:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" → Use for `STRIPE_SECRET_KEY`
3. Copy "Publishable key" → Use for `VITE_STRIPE_PUBLIC_KEY`

---

## 2. GMAIL CREDENTIALS (Required for Email Sending)

### Add these 3 variables:

**Variable 1:**
- **Name**: `GMAIL_ADDRESS`
- **Value**: `your-gmail@gmail.com` (the Gmail account to send from)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**
- **Name**: `GMAIL_API_KEY`
- **Value**: Your Gmail App Password (16 characters, no spaces)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**Variable 3:**
- **Name**: `GMAIL_APP_PASSWORD`
- **Value**: Same as GMAIL_API_KEY (16 characters, no spaces)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**How to get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Click "Create" and name it "AutoCheckPro"
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
5. Remove spaces: `abcdefghijklmnop`
6. Use this for both `GMAIL_API_KEY` and `GMAIL_APP_PASSWORD`

---

## 3. AFTER ADDING ALL VARIABLES

**CRITICAL**: You MUST redeploy after adding environment variables.

Go to: **https://vercel.com/your-project**

1. Click "Deployments" tab
2. Click the three dots `...` on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete (~2 minutes)

---

## ✅ Checklist

- [ ] Added STRIPE_SECRET_KEY
- [ ] Added VITE_STRIPE_PUBLIC_KEY
- [ ] Added GMAIL_ADDRESS
- [ ] Added GMAIL_API_KEY
- [ ] Added GMAIL_APP_PASSWORD
- [ ] Redeployed application
- [ ] Waited for deployment to finish

