
// Vercel serverless function entry point
// This file handles all API routes for Vercel deployment

import express, { type Request, Response, NextFunction } from 'express';
// Import from bundled files (built during Vercel deployment)
import { registerRoutes } from '../dist/server/routes.js';
import { serveStatic } from '../dist/server/vite.js';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set larger payload limits for PDF handling (up to 30MB)
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Trust proxy for Vercel (important for sessions and redirects)
app.set('trust proxy', 1);

// Session middleware - use database store for serverless (sessions persist across invocations)
let sessionStore: any = null;
if (process.env.DATABASE_URL) {
  try {
    const pgSession = await import('connect-pg-simple');
    const pg = await import('pg');
    const PGStore = pgSession.default(session);
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    sessionStore = new PGStore({
      pool: pool,
      tableName: 'user_sessions', // Table name for sessions
      createTableIfMissing: true, // Auto-create table if it doesn't exist
    });
    console.log('✅ Using database-backed session store');
  } catch (error) {
    console.warn('⚠️ Failed to setup database session store, using memory store:', error);
  }
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  store: sessionStore || undefined, // Use database store if available, otherwise memory
  resave: false, // Don't resave if unchanged
  saveUninitialized: false, // Don't save uninitialized sessions
  name: 'sessionId', // Explicit session name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    sameSite: 'lax', // Help with cross-site requests
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let browser set domain
    path: '/' // Ensure cookie is available for all paths
  }
}));

// Add request debugging middleware - log ALL requests to see what's happening
app.use((req: any, res: Response, next: NextFunction) => {
  console.log('🌐 Request received:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    url: req.url,
    query: req.query
  });
  
  if (req.path === '/api/auth/user' || req.path.startsWith('/auth/')) {
    console.log('🔍 Session debug:', {
      path: req.path,
      hasSession: !!req.session,
      sessionId: req.session?.id,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      cookies: req.headers.cookie ? 'present' : 'missing'
    });
  }
  next();
});

// Initialize Passport (must be after session middleware)
// Note: configurePassport is called inside registerRoutes via setupAuth
// But we need to initialize Passport here for the serverless function
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Error handling middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error('Request error:', {
    status,
    message,
    path: req.path,
    method: req.method
  });

  res.status(status).json({ message });
});

// Initialize routes and static serving
let initialized = false;
let initPromise: Promise<void> | null = null;

async function initializeApp() {
  if (initialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      console.log('🚀 Initializing app routes...');
      
      // Register all API routes
      // Note: registerRoutes returns an HTTP Server, but we don't need it for serverless
      await registerRoutes(app);
      // Server is created but not used in serverless environment
      
      // Log registered routes for debugging
      console.log('✅ Routes registered. Checking for /auth/google route...');
      const routes: string[] = [];
      app._router?.stack?.forEach((middleware: any) => {
        if (middleware.route) {
          routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
          middleware.handle.stack?.forEach((handler: any) => {
            if (handler.route) {
              routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
            }
          });
        }
      });
      console.log('📋 Registered routes:', routes.filter(r => r.includes('auth') || r.includes('google')).join(', ') || 'No auth routes found');
      
      // Setup static file serving for production
      serveStatic(app);
      
      // Add a catch-all 404 handler AFTER all routes to debug
      app.use((req: any, res: Response) => {
        console.log('❌ 404 - No route matched:', {
          method: req.method,
          path: req.path,
          originalUrl: req.originalUrl,
          url: req.url
        });
        res.status(404).json({ 
          message: `Cannot ${req.method} ${req.path}`,
          path: req.path,
          originalUrl: req.originalUrl
        });
      });
      
      initialized = true;
      console.log('✅ App initialization complete');
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      throw error;
    }
  })();
  
  return initPromise;
}

// SIMPLIFIED APPROACH: Register routes synchronously, no top-level await
// This ensures routes are always registered regardless of async initialization

// Configure Passport immediately (synchronously if possible, or lazy load in route)
let passportConfigured = false;
async function ensurePassportConfigured() {
  if (passportConfigured) return;
  try {
    const { configurePassport } = await import('../dist/server/auth/passport.js');
    configurePassport();
    passportConfigured = true;
    console.log('✅ Passport configured');
  } catch (error) {
    console.error('❌ Failed to configure Passport:', error);
  }
}

// Register /auth/google route - ALWAYS registered
app.get('/auth/google', async (req: any, res: any) => {
  console.log('🔍 /auth/google route hit!');
  
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    return res.status(503).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Configuration Error</title></head>
      <body style="font-family: Arial; padding: 40px; text-align: center;">
        <h1>OAuth Not Configured</h1>
        <p>GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET environment variables are missing.</p>
        <p>Please configure them in Vercel Dashboard → Settings → Environment Variables</p>
      </body>
      </html>
    `);
  }
  
  await ensurePassportConfigured();
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res);
});

app.get('/auth/google/callback', async (req: any, res: any, next: any) => {
  console.log('🔍 /auth/google/callback route hit!');
  console.log('📋 Query params:', req.query);
  console.log('🔐 Session before auth:', {
    sessionId: req.session?.id,
    hasSession: !!req.session
  });
  
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    console.error('❌ OAuth credentials missing');
    return res.status(503).json({ error: 'OAuth not configured' });
  }
  
  await ensurePassportConfigured();
  
  // Use Passport authenticate with proper error handling
  passport.authenticate('google', { 
    failureRedirect: '/login?error=google_failed',
    session: true // Ensure session is used
  })(req, res, (err: any) => {
    if (err) {
      console.error('❌ OAuth authentication error:', err);
      return res.redirect('/login?error=oauth_failed');
    }
    
    if (!req.user) {
      console.error('❌ No user after OAuth authentication');
      return res.redirect('/login?error=no_user');
    }
    
    // Log in the user (creates session)
    req.login(req.user, (loginErr: any) => {
      if (loginErr) {
        console.error('❌ Login error after OAuth:', loginErr);
        return res.redirect('/login?error=login_failed');
      }
      
      console.log('✅ Google OAuth callback successful');
      console.log('🔐 Session after login:', {
        sessionId: req.session?.id,
        userId: req.user?.id,
        userEmail: req.user?.email,
        hasUser: !!req.user
      });
      
      // Redirect to app
      const returnTo = (req.session as any)?.returnTo || '/app';
      delete (req.session as any)?.returnTo;
      res.redirect(returnTo);
    });
  });
});

// Test route
app.get('/test-auth-route', (req: any, res: any) => {
  res.json({ 
    message: 'Auth routing is working!',
    hasClientId: !!process.env.GMAIL_CLIENT_ID,
    hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET
  });
});

console.log('✅ Auth routes registered synchronously');

// Initialize app in background (non-blocking)
initializeApp().catch(err => console.error('Initialization error:', err));

// Export the Express app directly - Vercel supports this
export default app;

