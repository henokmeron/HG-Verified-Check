# Database Storage Explanation

## Where is Your Database Stored?

Your database is **NOT stored on Vercel**. It's stored on **Neon PostgreSQL** (a separate cloud database service).

## Database Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel        │         │   Neon PostgreSQL │
│   (Your App)    │────────▶│   (Your Database) │
│                 │         │                   │
│ - Frontend      │  HTTP   │ - All SQL data    │
│ - API Routes    │  ────▶  │ - Tables          │
│ - Serverless    │         │ - Users           │
│   Functions     │         │ - Lookups         │
│                 │         │ - Reports         │
└─────────────────┘         └──────────────────┘
```

## How It Works

1. **Vercel (Your Website)**
   - Hosts your frontend (React app)
   - Runs your API routes (serverless functions)
   - **Does NOT store database data**

2. **Neon PostgreSQL (Your Database)**
   - Stores ALL your SQL data:
     - User accounts
     - Vehicle lookups
     - PDF reports metadata
     - Credit transactions
     - Analytics
     - Everything in your database
   - Runs on Neon's cloud infrastructure
   - Accessible via `DATABASE_URL` connection string

## Connection String

Your `DATABASE_URL` looks like this:
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
```

This points to your Neon database, which is:
- **Separate from Vercel**
- **Persistent** (data survives Vercel deployments)
- **Scalable** (Neon handles the infrastructure)
- **Secure** (SSL encrypted connections)

## What Gets Stored Where?

### On Vercel (Temporary/No Persistence)
- ❌ **NOT stored**: Database data
- ❌ **NOT stored**: PDF files (unless using Vercel Blob)
- ✅ **Stored**: Built frontend files (static assets)
- ✅ **Stored**: Serverless function code

### On Neon Database (Persistent)
- ✅ **Stored**: All SQL tables and data:
  - `users` - User accounts
  - `vehicle_lookups` - Vehicle lookup history
  - `saved_reports` - PDF report metadata
  - `credit_transactions` - Payment history
  - `analytics` - Usage analytics
  - `shared_reports` - Shared report links
  - `sessions` - User sessions
  - All other database tables

## Important Points

### 1. Database is External
- Your Neon database exists independently of Vercel
- If you delete your Vercel project, **your database remains**
- If you redeploy, **your data is still there**

### 2. Database Persistence
- All your SQL data is permanently stored in Neon
- Data persists across:
  - Vercel deployments
  - Code updates
  - Server restarts
  - Function cold starts

### 3. Connection
- Vercel connects to Neon via `DATABASE_URL`
- Connection is secure (SSL required)
- Works from anywhere (Vercel, local dev, etc.)

### 4. File Storage Issue
⚠️ **Important**: PDF files saved to `reports/` folder won't work on Vercel because:
- Vercel has no persistent file system
- Files are lost on each deployment
- **Solution**: Use cloud storage (see below)

## Recommended Setup

### For Database (Already Set Up ✅)
- **Neon PostgreSQL** - Your current setup
- All SQL data stored here
- Accessible from Vercel via `DATABASE_URL`

### For File Storage (Needs Update ⚠️)
Currently, PDFs are saved to `reports/` folder, which won't work on Vercel.

**Options:**
1. **Vercel Blob** (Recommended for Vercel)
   - Built-in file storage for Vercel
   - Easy integration
   - Free tier available

2. **AWS S3**
   - Industry standard
   - Highly scalable
   - Pay per use

3. **Google Cloud Storage**
   - Similar to S3
   - Good integration with Google services

4. **Database Storage** (For small files)
   - Store PDFs as base64 in database
   - Not recommended for large files

## Current Database Schema

Your database includes these tables (all stored in Neon):

1. **users** - User accounts and profiles
2. **vehicle_lookups** - Vehicle lookup history
3. **saved_reports** - PDF report metadata and links
4. **credit_transactions** - Payment and credit history
5. **shared_reports** - Shared report links
6. **analytics** - Usage tracking
7. **system_config** - System configuration
8. **api_usage** - API usage tracking
9. **sessions** - User sessions

All of this data is stored in your Neon PostgreSQL database, not on Vercel.

## Backup and Migration

### Backing Up Your Database
- Neon provides automatic backups
- You can also export data manually
- Use `pg_dump` or Neon's dashboard

### Migrating Database
- Your database is independent of Vercel
- Can connect from any platform
- Just update `DATABASE_URL` environment variable

## Summary

✅ **Database Location**: Neon PostgreSQL (external cloud service)  
✅ **Data Persistence**: All SQL data stored permanently in Neon  
✅ **Vercel Role**: Only hosts your app code, connects to database  
✅ **Connection**: Via `DATABASE_URL` environment variable  
⚠️ **File Storage**: Needs cloud storage solution (not file system)

Your database is safe, persistent, and separate from your Vercel deployment!

