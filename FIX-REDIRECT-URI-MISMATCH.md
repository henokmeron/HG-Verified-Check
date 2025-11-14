# 🔴 FIX: "Error 400: redirect_uri_mismatch"

## ✅ Progress! Your Route and Credentials Are Working!
The error changed from "invalid_client" to "redirect_uri_mismatch" - this means:
- ✅ Your route is working
- ✅ Your GMAIL_CLIENT_ID is correct
- ✅ Your GMAIL_CLIENT_SECRET is correct
- ❌ The callback URL doesn't match

## 🔴 The Problem
The callback URL your app is sending to Google doesn't match what's configured in Google Cloud Console.

## ✅ Quick Fix (2 Steps)

### Step 1: Check What URL Your App Is Sending
1. Go to: **Vercel Dashboard** → Your Project → **Functions** → **View Logs**
2. Look for: `🔗 OAuth Callback URL:`
3. Copy that exact URL (it should be something like `https://hg-verified-check.vercel.app/auth/google/callback`)

### Step 2: Update Google Cloud Console
1. Go to: **https://console.cloud.google.com/** → **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID** (the one you're using)
3. Scroll to **"Authorized redirect URIs"**
4. **DELETE** any existing redirect URIs
5. **ADD** the exact URL from Step 1 (must match EXACTLY):
   ```
   https://hg-verified-check.vercel.app/auth/google/callback
   ```
   ⚠️ **CRITICAL:**
   - NO trailing slash
   - Must be `https://` (not `http://`)
   - Must match EXACTLY (case-sensitive)
6. Click **"Save"**

## 🔍 Common Mistakes

### ❌ Wrong (with trailing slash):
```
https://hg-verified-check.vercel.app/auth/google/callback/
```

### ✅ Correct (no trailing slash):
```
https://hg-verified-check.vercel.app/auth/google/callback
```

### ❌ Wrong (http instead of https):
```
http://hg-verified-check.vercel.app/auth/google/callback
```

### ✅ Correct (https):
```
https://hg-verified-check.vercel.app/auth/google/callback
```

## 📝 Verify Your Setup

### In Google Cloud Console:
- [ ] OAuth Client ID exists
- [ ] Authorized redirect URI is exactly: `https://hg-verified-check.vercel.app/auth/google/callback`
- [ ] No trailing slash
- [ ] Using `https://` not `http://`
- [ ] Clicked "Save" after adding

### In Vercel:
- [ ] `BASE_URL` = `https://hg-verified-check.vercel.app` (no trailing slash)
- [ ] `GMAIL_CLIENT_ID` is set
- [ ] `GMAIL_CLIENT_SECRET` is set

## 🧪 Test After Fix

1. Wait 1-2 minutes for Google to update (can take a moment)
2. Visit: `https://hg-verified-check.vercel.app/auth/google`
3. You should see Google's account picker (not an error)

## 🆘 Still Not Working?

If you still see "redirect_uri_mismatch":

1. **Check Vercel logs** for the exact callback URL being sent
2. **Copy that EXACT URL** to Google Cloud Console
3. **Make sure there are NO extra spaces** in Google Cloud Console
4. **Try adding both with and without trailing slash** (some setups need both):
   ```
   https://hg-verified-check.vercel.app/auth/google/callback
   https://hg-verified-check.vercel.app/auth/google/callback/
   ```
5. **Wait 2-3 minutes** after saving (Google can take time to update)

## ✅ Success!
Once the redirect URI matches exactly, you'll see Google's account picker and can log in!

