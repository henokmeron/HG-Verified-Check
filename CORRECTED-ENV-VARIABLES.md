# ✅ CORRECTED: Environment Variables Needed

## 📝 You Only Need **4 Environment Variables** (Not 5!)

I made an error - `GMAIL_APP_PASSWORD` is NOT used. The code only uses `GMAIL_API_KEY` (which IS the app password).

---

## 🔑 Add These 4 Variables to Vercel:

Go to: **https://vercel.com/your-project/settings/environment-variables**

### 1️⃣ **STRIPE_SECRET_KEY** (For Payments)
- **Name**: `STRIPE_SECRET_KEY`
- **Value**: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- **Get it from**: https://dashboard.stripe.com/test/apikeys
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 2️⃣ **VITE_STRIPE_PUBLIC_KEY** (For Payments)
- **Name**: `VITE_STRIPE_PUBLIC_KEY`
- **Value**: Your Stripe publishable key (starts with `pk_test_` or `pk_live_`)
- **Get it from**: https://dashboard.stripe.com/test/apikeys
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 3️⃣ **GMAIL_ADDRESS** (For Email Sending)
- **Name**: `GMAIL_ADDRESS`
- **Value**: Your Gmail address (e.g., `yourname@gmail.com`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 4️⃣ **GMAIL_API_KEY** (For Email Sending)
- **Name**: `GMAIL_API_KEY`
- **Value**: Your Gmail App Password (16 characters, no spaces)
- **Get it from**: https://myaccount.google.com/apppasswords
  - Sign in → Click "Create" → Name it "AutoCheckPro"
  - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
  - **Remove spaces**: `abcdefghijklmnop`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

---

## ❌ **DO NOT ADD:**
- ~~`GMAIL_APP_PASSWORD`~~ ← This is NOT used by the code!

---

## ✅ **After Adding All 4 Variables:**

1. **Redeploy** your application:
   - Go to: https://vercel.com/your-project
   - Click "Deployments" → Click "..." → "Redeploy"
   - Wait 2-3 minutes

2. **Test**:
   - Payment should work ✅
   - Email sending should work ✅

---

## 📊 **Summary:**

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `STRIPE_SECRET_KEY` | Payment processing | ✅ Yes |
| `VITE_STRIPE_PUBLIC_KEY` | Payment form | ✅ Yes |
| `GMAIL_ADDRESS` | Email sender address | ✅ Yes |
| `GMAIL_API_KEY` | Email authentication | ✅ Yes |

**Total: 4 variables** (not 5!)

