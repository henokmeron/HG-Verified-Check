# Vercel Deployment Guide

This guide will help you deploy AutoCheckPro to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. All environment variables configured (see below)
3. GitHub repository (optional, but recommended)

## Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

## Step 2: Configure Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

### Required Environment Variables

1. **DATABASE_URL**
   - Your Neon PostgreSQL connection string
   - Format: `postgresql://user:password@host/database?sslmode=require`

2. **SESSION_SECRET**
   - A random secret string for session encryption
   - Generate with: `openssl rand -base64 32`

3. **VDGI_API_KEY**
   - Your Vehicle Data UK API key

4. **STRIPE_SECRET_KEY**
   - Your Stripe secret key (starts with `sk_`)
   - Get from: https://dashboard.stripe.com/apikeys

5. **VITE_STRIPE_PUBLIC_KEY**
   - Your Stripe publishable key (starts with `pk_`)
   - Get from: https://dashboard.stripe.com/apikeys

### Optional Environment Variables

6. **GMAIL_ADDRESS**
   - Your Gmail address for sending emails

7. **GMAIL_API_KEY**
   - Gmail App Password (not your regular password)
   - Generate at: https://myaccount.google.com/apppasswords

8. **GMAIL_CLIENT_ID** (if using OAuth)
   - Google OAuth Client ID

9. **GMAIL_CLIENT_SECRET** (if using OAuth)
   - Google OAuth Client Secret

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
4. Add all environment variables (see Step 2)
5. Click "Deploy"

### Option B: Deploy via CLI

1. In your project directory, run:
   ```bash
   vercel
   ```
2. Follow the prompts to link your project
3. Add environment variables:
   ```bash
   vercel env add DATABASE_URL
   vercel env add SESSION_SECRET
   vercel env add VDGI_API_KEY
   vercel env add STRIPE_SECRET_KEY
   vercel env add VITE_STRIPE_PUBLIC_KEY
   # ... add other variables as needed
   ```
4. Deploy:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Vercel Settings

After deployment, configure these settings in the Vercel dashboard:

1. **Function Settings**:
   - Go to Settings → Functions
   - Set max duration to 60 seconds (for PDF generation)
   - Set memory to 3008 MB (for Puppeteer)

2. **Environment Variables**:
   - Go to Settings → Environment Variables
   - Add all required variables for Production, Preview, and Development

## Important Notes

### Puppeteer on Vercel

Puppeteer requires special handling on serverless platforms. The current setup uses Puppeteer for PDF generation. If you encounter issues:

1. **Option 1**: Use `@sparticuz/chromium` (recommended for serverless)
   - Install: `npm install @sparticuz/chromium`
   - Update `server/pdf/unifiedReportGenerator.ts` to use Chromium from the package

2. **Option 2**: Use an external PDF service
   - Consider services like PDFShift, HTMLPDF, or similar

### File Storage

The current setup saves PDFs to the file system (`reports/` directory). On Vercel:

- **This won't work** - Vercel is serverless and has no persistent file system
- **Solution**: Use cloud storage (AWS S3, Google Cloud Storage, or Vercel Blob)
- Update `server/routes.ts` to save PDFs to cloud storage instead

### Database

- Ensure your Neon PostgreSQL database allows connections from Vercel's IP ranges
- The connection string should include `?sslmode=require`

### Session Storage

- Current setup uses in-memory sessions (not persistent)
- For production, consider using:
  - Redis (via Upstash or similar)
  - Database-backed sessions (connect-pg-simple)

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (should be 20.x)

### API Routes Not Working

1. Check that `api/index.js` exists
2. Verify `vercel.json` rewrites are correct
3. Check function logs in Vercel dashboard

### PDF Generation Fails

1. Check function timeout (should be 60 seconds)
2. Verify memory allocation (should be 3008 MB)
3. Check Puppeteer/Chromium setup

### Environment Variables Not Loading

1. Ensure variables are set for the correct environment (Production/Preview/Development)
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)

## Post-Deployment

1. Test all major features:
   - Vehicle lookup
   - PDF generation
   - User authentication
   - Payment processing (if enabled)

2. Monitor function logs:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check for errors or warnings

3. Set up monitoring:
   - Consider adding error tracking (Sentry, LogRocket, etc.)
   - Monitor function execution times

## Support

For issues specific to Vercel deployment:
- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions

