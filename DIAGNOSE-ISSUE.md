# Website Not Working - Diagnostic Guide

## ✅ Servers Status
- **Frontend**: Running on http://localhost:5173
- **Backend**: Running on http://localhost:5000

## 🔍 How to Diagnose

### Step 1: Check Browser Console
1. Open http://localhost:5173 in your browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Look for **red error messages**
5. **Copy and share** any errors you see

### Step 2: Check Network Requests
1. In Developer Tools, go to the **Network** tab
2. Refresh the page (F5)
3. Look for requests with **red status codes** (4xx, 5xx)
4. Click on failed requests to see error details
5. **Share** any failed API calls

### Step 3: Check Backend Window
1. Look at the **Backend PowerShell window**
2. Check for any **error messages** in red
3. Try running a vehicle check
4. **Share** any errors that appear

### Step 4: Test API Endpoints
Open these URLs in your browser to test:
- http://localhost:5000/api/auth/user (should return user info or 401)
- http://localhost:5173 (should show the website)

## 🐛 Common Issues After Cleanup

### Issue 1: Missing Dependencies
**Symptoms**: Module not found errors
**Fix**: 
```bash
npm install
cd client && npm install
```

### Issue 2: Port Already in Use
**Symptoms**: Server won't start
**Fix**: 
```bash
taskkill /F /IM node.exe
# Then restart servers
```

### Issue 3: Missing Environment Variables
**Symptoms**: API calls fail
**Fix**: Check `start-server.js` has all required variables

### Issue 4: Build Errors
**Symptoms**: Frontend won't load
**Fix**: Check frontend PowerShell window for Vite errors

## 📋 What to Share
Please share:
1. **Browser console errors** (F12 → Console)
2. **Failed network requests** (F12 → Network)
3. **Backend window errors**
4. **What specifically isn't working**:
   - Website won't load?
   - Reports won't display?
   - Vehicle checks fail?
   - PDF generation fails?

