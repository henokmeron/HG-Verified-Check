# DATABASE_URL Setup Guide

## 🔑 Environment Variable Key

**Key Name:** `DATABASE_URL`  
**Value:** Your Neon PostgreSQL connection string

## 📝 Step-by-Step: Add to Vercel

### 1. Get Your Connection String
Your Neon connection string (remove the `psql '` wrapper):
```
postgresql://neondb_owner:npg_ksJj98IxGKOb@ep-rapid-heart-af7ux59l-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Add to Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Select your project: **HG-Verified-Check** (or your project name)
3. Click: **Settings** (in the top navigation)
4. Click: **Environment Variables** (in the left sidebar)
5. Click: **Add New** button
6. Fill in:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://neondb_owner:npg_ksJj98IxGKOb@ep-rapid-heart-af7ux59l-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - **Environment:** Select all three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
7. Click: **Save**

### 3. Redeploy Your Project

After adding the variable, you **MUST redeploy**:

1. Go to: **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click: **Redeploy**
4. Wait for deployment to complete

## ✅ Verification

After redeploying, check the function logs:

1. Go to: **Deployments** → Click your latest deployment
2. Click: **Functions** tab
3. Click: **api/index.ts** → **View Logs**
4. Look for:
   - ✅ `Successfully connected to database` (good!)
   - ❌ `DATABASE_URL not provided - using mock database` (bad - variable not set)

## 📊 What Gets Stored in the Database

Your Neon PostgreSQL database stores:

1. **users** - User accounts, profiles, Google OAuth data
2. **sessions** - User session data (for login persistence)
3. **vehicle_lookups** - All vehicle lookup history
4. **saved_reports** - PDF report metadata and links
5. **credit_transactions** - Payment and credit history
6. **shared_reports** - Shared report links
7. **analytics** - Usage tracking and statistics
8. **system_config** - System configuration settings
9. **api_usage** - API usage tracking

**Everything** related to users, lookups, reports, and payments is stored in this database.

## 🔧 Code Configuration

The codebase is already configured to use `DATABASE_URL`:

- ✅ `server/db.ts` - Reads `process.env.DATABASE_URL`
- ✅ `drizzle.config.ts` - Uses it for migrations
- ✅ `server/storage.ts` - Falls back to mock if not set
- ✅ `package.json` - No changes needed (it's just an env var)

## ⚠️ Important Notes

1. **No `psql` wrapper**: Use only the connection string, not `psql '...'`
2. **Case-sensitive**: Must be exactly `DATABASE_URL` (all caps)
3. **Redeploy required**: Changes only take effect after redeployment
4. **All environments**: Add to Production, Preview, and Development

## 🚨 Troubleshooting

### Login Still Not Working?

1. Verify `DATABASE_URL` is set in Vercel
2. Check deployment logs for database connection errors
3. Ensure you redeployed after adding the variable
4. Verify the connection string is correct (no typos)

### Database Connection Failed?

- Check your Neon dashboard to ensure the database is active
- Verify the connection string is correct
- Check that `sslmode=require` is included
- Ensure your Neon project allows connections from Vercel

