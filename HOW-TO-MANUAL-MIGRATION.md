# 📋 How to Manually Create Database Tables in Neon

Since automatic migrations aren't working, follow these steps to manually create all tables:

## Option 1: Run SQL Script (RECOMMENDED - Fastest)

1. **Open Neon Console**
   - Go to: https://console.neon.tech
   - Select your database project
   - Click on **"SQL Editor"** in the left sidebar

2. **Copy the SQL Script**
   - Open the file: `MANUAL-MIGRATION-NEON.sql`
   - Copy **ALL** the SQL code (from line 1 to the end)

3. **Paste and Run**
   - Paste the entire script into the Neon SQL Editor
   - Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify Tables Were Created**
   - The script will show a verification query at the end
   - You should see all tables with "✅ EXISTS" status

## Option 2: Use Excel CSV File (For Reference)

1. **Open the CSV File**
   - Open `DATABASE-SCHEMA-FOR-NEON.csv` in Excel or Google Sheets
   - This shows all tables, columns, data types, and constraints

2. **Use as Reference**
   - Use this file to understand the database structure
   - You can manually create tables in Neon Console using this as a guide

## 📊 Tables That Will Be Created

1. **users** - User accounts and authentication
2. **sessions** - Passport.js session storage
3. **vehicle_lookups** - Vehicle check history
4. **credit_transactions** - Credit purchase/deduction history
5. **saved_reports** - Saved PDF reports
6. **shared_reports** - Shared report links
7. **analytics** - Event tracking
8. **system_config** - System configuration
9. **api_usage** - API usage logging

## ✅ After Running the Script

1. **Verify in Neon Console**
   - Go to **"Tables"** in the left sidebar
   - You should see all 9 tables listed

2. **Test Your Application**
   - Try logging in again
   - The application should now be able to save user data

## 🔧 If You Get Errors

- **"relation already exists"** - Tables already exist, that's OK
- **"permission denied"** - Check your database user permissions
- **"syntax error"** - Make sure you copied the entire script

## 📝 Notes

- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- All foreign keys are added automatically
- All indexes are created for optimal performance
- Default values are set for required fields



