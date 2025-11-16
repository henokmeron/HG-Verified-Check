
// Vercel serverless function entry point
// This file handles all API routes for Vercel deployment

import express, { type Request, Response, NextFunction } from 'express';
// Import from bundled files (built during Vercel deployment)
// @ts-ignore - dist files are generated at build time
import { registerRoutes } from '../dist/server/routes.js';
// @ts-ignore - dist files are generated at build time
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
// Initialize session store synchronously at module load
// IMPORTANT: Wrap in try-catch to prevent crashes from database connection errors
let sessionStore: any = null;
if (process.env.DATABASE_URL) {
  try {
    // Use dynamic import for connect-pg-simple (ESM module)
    const pgSessionModule = await import('connect-pg-simple');
    const PGStore = pgSessionModule.default(session);
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // Smaller pool for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Shorter timeout for serverless
    });
    
    // Add error handlers to prevent crashes from pool errors
    pool.on('error', (err: any) => {
      // Handle pool errors gracefully - don't crash the function
      const errorMessage = err?.message || err?.toString() || 'Unknown pool error';
      console.error('⚠️ Session store pool error (non-fatal):', errorMessage);
      // Don't throw - allow the function to continue with memory store fallback
    });
    
    sessionStore = new PGStore({
      pool: pool,
      tableName: 'user_sessions', // Table name for sessions
      createTableIfMissing: true, // Auto-create table if it doesn't exist
    });
    console.log('✅ Using database-backed session store');
  } catch (error: any) {
    // Handle errors gracefully - don't crash the function
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.warn('⚠️ Failed to setup database session store, using memory store:', errorMessage);
    console.warn('⚠️ Sessions will not persist across function invocations');
    // Continue with memory store - don't throw
    sessionStore = null;
  }
} else {
  console.warn('⚠️ DATABASE_URL not set - using memory session store (sessions will not persist)');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  store: sessionStore || undefined, // Use database store if available, otherwise memory
  resave: true, // CRITICAL: Force resave in serverless to ensure persistence
  saveUninitialized: true, // CRITICAL: Save even uninitialized sessions in serverless
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

// Log session store configuration
console.log('🔐 Session configuration:', {
  hasStore: !!sessionStore,
  storeType: sessionStore ? 'database' : 'memory',
  resave: true,
  saveUninitialized: true
});

// Add request debugging middleware - log ALL requests to see what's happening
app.use((req: any, _res: Response, next: NextFunction) => {
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

// Middleware to ensure Passport deserializes user if passport data exists in session
app.use(async (req: any, _res: Response, next: NextFunction) => {
  // If user is not loaded but passport data exists in session, manually trigger deserialization
  if (!req.user && req.session && (req.session as any).passport && (req.session as any).passport.user) {
    const userId = (req.session as any).passport.user;
    try {
      // Import storage dynamically to avoid circular dependencies
      // @ts-ignore - dist files are generated at build time
      const { storage } = await import('../dist/server/storage.js');
      const user = await storage.getUser(userId);
      if (user) {
        req.user = user;
        console.log('✅ Manually loaded user from session:', user.email);
      }
    } catch (error: any) {
      // Handle errors gracefully - don't crash the function
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('❌ Error manually deserializing user:', errorMessage);
      // Continue - don't throw
    }
  }
  next();
});

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
    // @ts-ignore - dist files are generated at build time
    const { configurePassport } = await import('../dist/server/auth/passport.js');
    configurePassport();
    passportConfigured = true;
    console.log('✅ Passport configured');
  } catch (error) {
    console.error('❌ Failed to configure Passport:', error);
  }
}

// Add loop prevention: Track auth attempts and prevent infinite redirects
// MUST be registered BEFORE auth routes
app.use((req: any, res: Response, next: NextFunction) => {
  // Only apply to auth routes
  if (req.path.startsWith('/auth/google')) {
    const authAttempts = (req.session as any)?.authAttempts || 0;
    
    // If too many attempts, break the loop
    if (authAttempts > 3) {
      console.error('❌ Too many auth attempts detected, breaking redirect loop');
      delete (req.session as any)?.authAttempts;
      return res.redirect('/login?error=redirect_loop_detected');
    }
    
    // Increment attempt counter
    (req.session as any).authAttempts = authAttempts + 1;
    
    // Reset counter on successful callback (when code is present)
    if (req.path === '/auth/google/callback' && req.query.code) {
      delete (req.session as any)?.authAttempts;
    }
  }
  next();
});

// Register /auth/google route - ALWAYS registered BEFORE serveStatic catch-all
// This ensures the route is matched before any catch-all handlers
app.get('/auth/google', async (req: any, res: any, _next: any) => {
  console.log('🔍 /auth/google route hit!');
  console.log('📋 Request details:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    url: req.url
  });
  
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
  
  try {
    await ensurePassportConfigured();
    // CRITICAL: Removed prompt: 'select_account' to prevent redirect loops
    // Google will automatically show account picker if needed
    passport.authenticate('google', { 
      scope: ['profile', 'email']
    })(req, res, _next);
  } catch (error) {
    console.error('❌ Error in /auth/google:', error);
    _next(error);
  }
});

// Register callback route - MUST be before any other route handlers that might match
// CRITICAL: This route MUST execute - if it doesn't, we'll show an error page
app.get('/auth/google/callback', async (req: any, res: any, _next: any) => {
  console.log('🔍 /auth/google/callback route hit!');
  console.log('✅ Callback handler is executing!');
  console.log('🔍 FULL REQUEST INFO:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    url: req.url,
    query: req.query,
    headers: {
      host: req.headers.host,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent']
    }
  });
  console.log('📋 Query params:', req.query);
  console.log('📋 Has code:', !!req.query.code);
  console.log('📋 Has error:', !!req.query.error);
  console.log('🔐 Session before auth:', {
    sessionId: req.session?.id,
    hasSession: !!req.session,
    sessionKeys: req.session ? Object.keys(req.session) : []
  });
  
  // Check for OAuth errors from Google
  if (req.query.error) {
    console.error('❌ OAuth error from Google:', req.query.error);
    console.error('❌ Error description:', req.query.error_description);
    return res.redirect(`/login?error=${req.query.error}`);
  }
  
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    console.error('❌ OAuth credentials missing');
    return res.status(503).json({ error: 'OAuth not configured' });
  }
  
  try {
    // CRITICAL: Check if tables exist directly (faster than waiting for migration function)
    // This allows us to proceed even if migration function is slow or timing out
    console.log('📦 Checking if database tables exist...');
    
    let tablesExist = false;
    try {
      // @ts-ignore
      const { pool } = await import('../dist/server/db.js');
      if (pool) {
        const checkResult = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
        tablesExist = checkResult.rows[0]?.exists || false;
        console.log(`📋 Tables exist check: ${tablesExist ? '✅ YES' : '❌ NO'}`);
      }
    } catch (checkError: any) {
      console.error('❌ Error checking tables directly:', checkError?.message);
      // Continue with migration check as fallback
    }
    
    // If tables don't exist, try to run migrations (but don't wait forever)
    if (!tablesExist) {
      console.log('📦 Tables not found - attempting to run migrations...');
      let migrationsComplete = false;
      let retries = 0;
      const maxRetries = 5; // Reduced from 10 to fail faster
      
      while (!migrationsComplete && retries < maxRetries) {
        migrationsComplete = await ensureMigrationsRun();
        if (!migrationsComplete) {
          retries++;
          console.log(`⏳ Migrations not complete yet, waiting... (attempt ${retries}/${maxRetries})`);
          // Wait 500ms before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Re-check if tables exist (might have been created by another instance)
          try {
            // @ts-ignore
            const { pool } = await import('../dist/server/db.js');
            if (pool) {
              const recheckResult = await pool.query(`
                SELECT EXISTS (
                  SELECT FROM information_schema.tables 
                  WHERE table_schema = 'public' 
                  AND table_name = 'users'
                );
              `);
              if (recheckResult.rows[0]?.exists) {
                console.log('✅ Tables now exist (created by another instance)');
                tablesExist = true;
                break; // Exit retry loop
              }
            }
          } catch (e) {
            // Ignore recheck errors
          }
        }
      }
      
      // Final check: if tables still don't exist after retries, show error
      if (!tablesExist && !migrationsComplete) {
        // One final direct check
        try {
          // @ts-ignore
          const { pool } = await import('../dist/server/db.js');
          if (pool) {
            const finalCheck = await pool.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
              );
            `);
            tablesExist = finalCheck.rows[0]?.exists || false;
          }
        } catch (e) {
          // Ignore
        }
        
        if (!tablesExist) {
          console.error('❌ Migrations failed to complete and tables do not exist');
          return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Database Error</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f3f4f6; }
                .error-box { background: white; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                h1 { color: #ef4444; margin-bottom: 20px; }
                p { color: #6b7280; margin-bottom: 20px; }
                .button { background: #6b46c1; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="error-box">
                <h1>❌ Database Not Ready</h1>
                <p>Database tables are not initialized. Please wait a moment and try again.</p>
                <p>If this persists, check your DATABASE_URL configuration in Vercel.</p>
                <a href="/" class="button">Return to Homepage</a>
              </div>
            </body>
            </html>
          `);
        }
      }
    }
    
    console.log('✅ Database tables confirmed to exist, proceeding with authentication...');
    
    await ensurePassportConfigured();
    console.log('✅ Passport configured, starting authentication...');
    console.log('🔍 About to call passport.authenticate...');
    console.log('🔍 Request session before authenticate:', {
      sessionId: req.session?.id,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      hasPassport: !!(req.session as any)?.passport
    });
    
    // Use Passport authenticate with proper error handling
    // CRITICAL: Never redirect back to /auth/google to prevent loops
    passport.authenticate('google', { 
      failureRedirect: '/login?error=google_failed', // Always redirect to /login, never back to /auth/google
      session: true // Ensure session is used
    })(req, res, (err: any) => {
      console.log('🔍 Passport authenticate callback invoked');
      console.log('📋 Error:', err ? err.message : 'none');
      console.log('📋 Has user:', !!req.user);
      console.log('📋 User details:', req.user ? { id: req.user.id, email: req.user.email } : 'none');
      console.log('🔍 Request session in callback:', {
        sessionId: req.session?.id,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        hasPassport: !!(req.session as any)?.passport,
        passportUser: (req.session as any)?.passport?.user
      });
      
      if (err) {
        console.error('❌ OAuth authentication error:', err);
        console.error('❌ Error stack:', err.stack);
        // Show error page instead of redirecting to prevent loops
        return res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>OAuth Authentication Failed</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f3f4f6; }
              .error-box { background: white; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #ef4444; margin-bottom: 20px; }
              p { color: #6b7280; margin-bottom: 20px; }
              .error-details { background: #fef2f2; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: left; font-family: monospace; font-size: 12px; color: #991b1b; }
              .button { background: #6b46c1; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="error-box">
              <h1>❌ OAuth Authentication Failed</h1>
              <p>There was an error authenticating with Google.</p>
              <div class="error-details">
                <strong>Error:</strong> ${err?.message || 'Unknown error'}<br>
                <strong>Please check Vercel logs for more details.</strong>
              </div>
              <a href="/" class="button">Return to Homepage</a>
            </div>
          </body>
          </html>
        `);
      }
      
      if (!req.user) {
        console.error('❌ No user after OAuth authentication');
        console.error('❌ This usually means the GoogleStrategy callback failed');
        // Show error page instead of redirecting to prevent loops
        return res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>User Not Found</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f3f4f6; }
              .error-box { background: white; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #ef4444; margin-bottom: 20px; }
              p { color: #6b7280; margin-bottom: 20px; }
              .button { background: #6b46c1; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="error-box">
              <h1>❌ User Not Found</h1>
              <p>The GoogleStrategy callback failed to create or find your user account.</p>
              <p>This might be a database issue. Please check Vercel logs.</p>
              <a href="/" class="button">Return to Homepage</a>
            </div>
          </body>
          </html>
        `);
      }
      
      console.log('✅ User authenticated, logging in...');
      console.log('📋 User details:', {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName
      });
      
      // Log in the user (creates session)
      // CRITICAL: Use req.login with callback to ensure session is saved
      console.log('🔐 About to call req.login with user:', {
        userId: req.user.id,
        userEmail: req.user.email
      });
      
      req.login(req.user, { session: true }, (loginErr: any) => {
        if (loginErr) {
          console.error('❌ Login error after OAuth:', loginErr);
          console.error('❌ Login error stack:', loginErr.stack);
          return res.redirect('/login?error=login_failed');
        }
        
        console.log('✅ req.login completed, checking session...');
        console.log('🔐 Session immediately after req.login:', {
          sessionId: req.session?.id,
          hasPassport: !!(req.session as any)?.passport,
          passportUser: (req.session as any)?.passport?.user,
          sessionKeys: req.session ? Object.keys(req.session) : [],
          fullSession: JSON.stringify(req.session, null, 2)
        });
        
        // CRITICAL: Explicitly save the session to ensure passport data is persisted
        // In serverless, we MUST save the session before redirecting
        req.session.save((saveErr: any) => {
          if (saveErr) {
            console.error('❌ Error saving session:', saveErr);
            console.error('❌ Session save error stack:', saveErr.stack);
            return res.redirect('/login?error=session_save_failed');
          }
          
          console.log('✅ Session saved successfully');
          console.log('🔐 Session after save:', {
            sessionId: req.session?.id,
            userId: req.user?.id,
            userEmail: req.user?.email,
            hasUser: !!req.user,
            hasPassport: !!(req.session as any)?.passport,
            passportUser: (req.session as any)?.passport?.user,
            sessionKeys: req.session ? Object.keys(req.session) : []
          });
          
          // Verify passport data is in session before redirecting
          if (!(req.session as any)?.passport?.user) {
            console.error('❌ CRITICAL: Passport data not in session after save!');
            console.error('❌ Session data:', JSON.stringify(req.session, null, 2));
            return res.redirect('/login?error=session_data_missing');
          }
          
          console.log('✅ Google OAuth callback successful - passport data confirmed in session');
          
          // Redirect to app
          const returnTo = (req.session as any)?.returnTo || '/app';
          delete (req.session as any)?.returnTo;
          console.log('🔄 Redirecting to:', returnTo);
          
          // Save session one more time before redirect to ensure it's persisted
          req.session.save((finalSaveErr: any) => {
            if (finalSaveErr) {
              console.error('❌ Error in final session save:', finalSaveErr);
            } else {
              console.log('✅ Final session save completed');
            }
            res.redirect(returnTo);
          });
        });
      });
    });
  } catch (error: any) {
    console.error('❌ Unexpected error in callback handler:', error);
    console.error('❌ Error stack:', error.stack);
    // CRITICAL: Show error page instead of redirecting to prevent loops
    // This ensures user sees what went wrong instead of getting stuck in a loop
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Error</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f3f4f6; }
          .error-box { background: white; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #ef4444; margin-bottom: 20px; }
          p { color: #6b7280; margin-bottom: 20px; line-height: 1.6; }
          .error-details { background: #fef2f2; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: left; font-family: monospace; font-size: 12px; color: #991b1b; }
          .button { background: #6b46c1; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 20px; }
          .button:hover { background: #5b21b6; }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h1>❌ Authentication Error</h1>
          <p>There was an error during the login process. Please try again.</p>
          <div class="error-details">
            <strong>Error:</strong> ${error?.message || 'Unknown error'}<br>
            <strong>Please check Vercel logs for more details.</strong>
          </div>
          <a href="/" class="button">Return to Homepage</a>
          <a href="/auth/google" class="button" style="background: #059669; margin-left: 10px;">Try Login Again</a>
        </div>
      </body>
      </html>
    `);
  }
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

// Add a diagnostic route to verify routing works
app.get('/api/diagnostic', (req: any, res: any) => {
  const routes: string[] = [];
  app._router?.stack?.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    }
  });
  res.json({
    message: 'Diagnostic endpoint',
    registeredRoutes: routes.filter(r => r.includes('auth') || r.includes('google') || r.includes('diagnostic')),
    hasSession: !!req.session,
    sessionId: req.session?.id,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    hasUser: !!req.user
  });
});

// Add global error handlers to prevent crashes from uncaught errors
process.on('uncaughtException', (error: Error) => {
  // Log but don't crash - allow the function to continue
  console.error('⚠️ Uncaught Exception (non-fatal):', error.message);
  console.error('⚠️ Error stack:', error.stack);
  // Don't exit - allow the function to continue processing requests
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  // Log but don't crash - allow the function to continue
  const errorMessage = reason?.message || reason?.toString() || 'Unknown rejection';
  console.error('⚠️ Unhandled Rejection (non-fatal):', errorMessage);
  // Don't exit - allow the function to continue processing requests
});

// Run database migrations on startup (CRITICAL: Must complete before handling requests)
// In serverless, we need to ensure migrations run before any database queries
let migrationPromise: Promise<boolean> | null = null;

async function ensureMigrationsRun(): Promise<boolean> {
  if (migrationPromise) {
    console.log('📦 Migration already running, waiting for existing promise...');
    return migrationPromise; // Return existing promise if already running
  }
  
  migrationPromise = (async () => {
    try {
      console.log('📦 Starting migration check...');
      console.log('📋 DATABASE_URL available:', !!process.env.DATABASE_URL);
      
      // @ts-ignore - dist files are generated at build time
      const { ensureTablesExist } = await import('../dist/server/migrate.js');
      console.log('📦 Migration function imported, calling ensureTablesExist()...');
      
      const result = await ensureTablesExist();
      
      console.log('📦 Migration function returned:', result);
      
      if (result) {
        console.log('✅ Database migrations completed successfully');
      } else {
        console.error('❌ Database migrations did NOT complete - ensureTablesExist() returned false');
        console.error('❌ Check the migration logs above for detailed error information');
      }
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('❌ Migration check failed with exception:', errorMessage);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error stack:', error?.stack);
      return false;
    }
  })();
  
  return migrationPromise;
}

// Start migration immediately (non-blocking for module load, but will complete before first request)
ensureMigrationsRun();

// Initialize app in background (non-blocking)
// Routes are already registered above, so they'll be matched before serveStatic's catch-all
initializeApp().catch(err => {
  console.error('⚠️ Initialization error (non-fatal):', err);
  // Don't throw - allow the function to continue
});

// Export the Express app directly - Vercel supports this
export default app;

