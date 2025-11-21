# 🧪 COMPLETE TESTING GUIDE

## ⏰ **BEFORE TESTING - VERIFY DEPLOYMENT**

### **Step 1: Check Vercel Deployment Status**

Go to: https://vercel.com/justin-smiths-projects-c6a09dac/hg-verified-check/deployments

**Look for the latest deployment:**
- Commit message: `"Add debugging to payment page"` or `"Force rebuild - clear Vercel cache"`
- Status: **"Ready"** ✅ (green checkmark)
- Time: Within last 5 minutes

**If status is "Building":**
- ⏳ Wait 2-3 minutes
- 🔄 Refresh the page
- ✅ Only proceed when status shows "Ready"

**If status is "Error" or "Failed":**
- ❌ **DO NOT TEST YET**
- 📋 Copy the error message
- Send me the error immediately

---

## 🧪 TEST 1: PDF DOWNLOAD

### Steps:
1. Open: https://hg-verified-check.vercel.app
2. Click "Sign In" (top right)
3. Log in as: nokhen330@gmail.com
4. Once logged in, enter registration: `FN59XPZ`
5. Click "Check Now" or "Get Report"
6. Wait for results to load
7. Click "Download Report" button
8. **Open browser console (F12) and copy all logs**

### ✅ Expected Result:
- PDF downloads immediately (2-3 seconds)
- File name: `vehicle-report-FN59XPZ.pdf` or similar
- File size: ~50-200 KB
- PDF opens and shows vehicle data

### ❌ If It Fails:
**Copy these logs and send to me:**
- All console.log messages (press F12, go to Console tab)
- The exact error message from the red banner
- Screenshot of the error

**Look for these in console:**
- ✅ `"Generating PDF with jsPDF (serverless-compatible)"`
- ✅ `"PDF generated successfully with jsPDF, size: X bytes"`
- ❌ If you see "Puppeteer" or "Chromium" → deployment didn't work
- ❌ If you see "libnss3.so" → old code is still running

---

## 📧 TEST 2: EMAIL DELIVERY

### Steps:
1. Complete Test 1 above (do a vehicle lookup)
2. Wait 30 seconds
3. Check email inbox for: nokhen330@gmail.com
4. Look in:
   - Inbox
   - Spam folder
   - Promotions tab (if using Gmail)

### ✅ Expected Result:
- Email received within 1-2 minutes
- Subject: `"HG Verified Vehicle Report - FN59XPZ"` or similar
- Has PDF attachment
- Attachment opens correctly

### ❌ If No Email:
**Check Vercel logs:**
1. Go to: https://vercel.com/justin-smiths-projects-c6a09dac/hg-verified-check/logs
2. Look for: `"PDF report automatically sent"` or `"Failed to send PDF report"`
3. Copy the entire log section and send to me

**Possible reasons:**
- Gmail credentials not set in Vercel environment variables
- Email service not initialized
- PDF generation failed (Test 1 would also fail)

---

## 💳 TEST 3: PAYMENT FORM

### Steps:
1. Open: https://hg-verified-check.vercel.app
2. Click "Sign In" (if not already signed in)
3. Log in as: nokhen330@gmail.com
4. Click "Buy Credits" or "Pricing"
5. Select any package (e.g., "Basic - £7")
6. Click "Purchase" or "Buy Now"
7. **Open browser console (F12) immediately**

### ✅ Expected Result:
- Page loads showing "Loading Payment System..." for 1-2 seconds
- Then Stripe payment form appears:
  - Card number field
  - Expiry date field
  - CVC field
  - "Pay £X.XX" button
- Console shows: `"Payment intent created successfully"`

### ❌ If Blank Page:
**Check browser console (F12 → Console tab):**

Look for:
- `"Checkout auth state: { isAuthenticated: true/false }"`
- `"User not authenticated, showing signup prompt"`
- `"Payment intent created successfully"`

**If you see:**
- `isAuthenticated: false` → Auth issue, need to debug session
- `"Payment Initialization Failed"` → Backend error, check Vercel logs
- No logs at all → JavaScript error, send me screenshot of Console

**Common Issues:**
1. **Stuck on "Loading Payment System..."**
   - Auth check timing out
   - Session not working
   - **Solution:** Check console for errors

2. **Shows "Sign Up Required" (but you're logged in)**
   - Session not persisting
   - Cookies blocked
   - **Solution:** Clear cookies, log in again

3. **Error: "Authentication required"**
   - Backend auth check failing
   - **Solution:** Check Vercel logs for auth errors

---

## 🔍 ADMIN PANEL TESTS

### Test 4: Admin Dashboard

1. Go to: https://hg-verified-check.vercel.app/admin
2. Should see dashboard with statistics
3. **Expected:** Numbers and charts display
4. **If blank:** Check if you ran the SQL fix in Neon (from my earlier message)

### Test 5: Admin Lookups

1. Go to: https://hg-verified-check.vercel.app/admin/lookups
2. Should see table with vehicle lookups
3. **Expected:** Table with columns: Registration, User, Date, etc.
4. **If blank:** Database issue - send me Vercel logs

### Test 6: Admin Analytics

1. Go to: https://hg-verified-check.vercel.app/admin/analytics
2. Should see analytics data
3. **Expected:** Charts or statistics
4. **If blank:** Database issue - send me Vercel logs

---

## 📋 WHAT TO SEND ME AFTER TESTING

### If PDF Works:
✅ "PDF download works - got the file and it opens correctly"

### If PDF Fails:
❌ Send ALL of these:
1. Screenshot of the error message
2. **Full console logs** (F12 → Console → copy all text)
3. **Vercel logs** for that request (copy from Vercel dashboard)
4. Exact steps you took

### If Email Doesn't Arrive:
❌ Send:
1. Confirmation that PDF downloaded (or not)
2. Which email you checked: nokhen330@gmail.com
3. Screenshot of Vercel logs showing email-related messages
4. Time you tested (so I can find the right logs)

### If Payment Form Blank:
❌ Send:
1. **Browser console logs** (F12 → Console → screenshot or copy all)
2. Screenshot of the blank page
3. Confirmation you're logged in (check top right of screen)
4. What browser you're using (Chrome, Edge, Firefox, etc.)

---

## ⚠️ CRITICAL REMINDERS

1. **Always check F12 Console** - most errors show there first
2. **Wait for "Ready"** - don't test while Vercel is still deploying
3. **Clear cache** - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) to hard refresh
4. **Check Vercel logs** - they show the full server-side picture

---

## 🚀 TIMELINE

- **Now (0 min):** Vercel is deploying
- **+3 min:** Deployment should be "Ready"
- **+5 min:** Start testing
- **+10 min:** All tests completed

**If deployment takes longer than 5 minutes, something is wrong - tell me immediately.**

---

## 🎯 SUCCESS CRITERIA

All 3 must work:
- ✅ PDF downloads successfully
- ✅ Email with PDF arrives in inbox
- ✅ Payment form displays (don't need to actually pay)

If ANY of these fail, I need the specific logs/screenshots listed above.

