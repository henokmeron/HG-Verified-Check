
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
      connectionTimeoutMillis: 20000, // Increased timeout for serverless (20s)
      // Serverless-friendly settings
      allowExitOnIdle: true, // Allow pool to close when idle
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
      tableName: 'sessions', // Use 'sessions' table (matches our migration)
      createTableIfMissing: true, // Auto-create table if it doesn't exist
      // CRITICAL: Disable automatic session pruning in serverless
      // Pruning causes connection timeouts and is not needed in serverless
      // Sessions will expire naturally based on cookie maxAge
      pruneSessionInterval: false, // Disable automatic pruning
    });
    
    // Override pruneSessions method to handle errors gracefully
    if (sessionStore && typeof sessionStore.pruneSessions === 'function') {
      const originalPruneSessions = sessionStore.pruneSessions.bind(sessionStore);
      sessionStore.pruneSessions = async function() {
        try {
          // Only prune if we have an active connection
          if (pool.totalCount > 0) {
            await Promise.race([
              originalPruneSessions(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Prune timeout')), 5000)
              )
            ]);
          }
        } catch (error: any) {
          // Silently ignore prune errors - they're not critical
          const errorMessage = error?.message || error?.toString() || 'Unknown prune error';
          if (!errorMessage.includes('timeout') && !errorMessage.includes('Connection terminated')) {
            console.warn('⚠️ Session prune warning (non-fatal):', errorMessage);
          }
        }
      };
    }
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
      // CRITICAL: Don't catch auth routes - they're registered synchronously above
      app.use((req: any, res: Response) => {
        // Skip 404 for auth routes - they should be handled by routes registered above
        if (req.path.startsWith('/auth/')) {
          console.log('⚠️ 404 handler caught auth route - this should not happen');
          console.log('⚠️ Route should have been handled by:', req.path);
          // Don't send 404 - let it fall through or return error
          return res.status(500).json({ 
            message: `Auth route not handled: ${req.path}. This route should be registered synchronously above.`,
            path: req.path,
            originalUrl: req.originalUrl,
            note: 'Check that /auth/google/callback route is registered before initializeApp()'
          });
        }
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
// CRITICAL: This route should NOT wait for migrations - OAuth doesn't need database
// CRITICAL: Wrap in try-catch to ensure it runs even if there are errors
app.get('/auth/google', (req: any, res: any, _next: any) => {
  // CRITICAL: Wrap everything in try-catch to ensure route handler always runs
  try {
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
    
    // Configure Passport if not already configured (non-blocking)
    ensurePassportConfigured().catch((err) => {
      console.warn('⚠️ Passport config error (non-fatal):', err?.message);
    });
    
    // CRITICAL: OAuth redirect doesn't need database - just redirect to Google
    // Don't wait for migrations or passport config - proceed immediately
    console.log('✅ Redirecting to Google OAuth...');
    passport.authenticate('google', { 
      scope: ['profile', 'email']
    })(req, res, _next);
  } catch (error: any) {
    // If anything fails, log it but still try to redirect
    console.error('❌ Error in /auth/google route handler:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    
    // Try to redirect anyway - don't let errors block OAuth
    try {
      passport.authenticate('google', { 
        scope: ['profile', 'email']
      })(req, res, _next);
    } catch (retryError: any) {
      console.error('❌ Passport authenticate also failed:', retryError);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Error</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>OAuth Configuration Error</h1>
          <p>Unable to redirect to Google. Please check Vercel logs.</p>
          <p>Error: ${retryError?.message || 'Unknown error'}</p>
          <a href="/">Return to Homepage</a>
        </body>
        </html>
      `);
    }
  }
});

// Register callback route - MUST be before any other route handlers that might match
// CRITICAL: This route MUST execute - if it doesn't, we'll show an error page
// CRITICAL: Register this BEFORE initializeApp() to ensure it's always available
// CRITICAL: This route is registered at the TOP LEVEL, synchronously, so it's always available
// CRITICAL: This route MUST be registered at the TOP LEVEL, synchronously
// It's registered BEFORE initializeApp() so it's always available
app.get('/auth/google/callback', async (req: any, res: any, _next: any) => {
  // CRITICAL: Log immediately to confirm route is hit - if you don't see this, the route isn't being matched
  console.log('🔍🔍🔍 /auth/google/callback route hit!');
  console.log('✅✅✅ Callback handler is executing!');
  console.log('📋 Request method:', req.method);
  console.log('📋 Request path:', req.path);
  console.log('📋 Request originalUrl:', req.originalUrl);
  console.log('📋 Query params:', req.query);
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
    // CRITICAL: DO NOT wait for migrations - they timeout and block OAuth
    // Proceed immediately with authentication - Passport will handle user creation
    // The upsertUser function will create tables if needed
    console.log('✅ Proceeding with OAuth immediately - not waiting for migrations');
    
    console.log('✅ Proceeding with authentication (tables exist: ' + tablesExist + ')...');
    
    await ensurePassportConfigured();
    console.log('✅ Passport configured, starting authentication...');
    console.log('🔍 About to call passport.authenticate...');
    console.log('🔍 Request session before authenticate:', {
      sessionId: req.session?.id,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      hasPassport: !!(req.session as any)?.passport
    });
    
    // Use Passport authenticate with proper error handling
    // CRITICAL: Use session: true so req.login() works properly
    passport.authenticate('google', { 
      failureRedirect: '/login?error=google_failed',
      session: true  // Enable session for req.login()
    })(req, res, async (err: any) => {
      console.log('🔍 Passport authenticate callback invoked');
      console.log('📋 Error:', err ? err.message : 'none');
      console.log('📋 Has user:', !!req.user);
      console.log('📋 User details:', req.user ? { id: req.user.id, email: req.user.email } : 'none');
      
      if (err) {
        console.error('❌ OAuth authentication error:', err);
        return res.redirect('/login?error=oauth_failed');
      }
      
      if (!req.user) {
        console.error('❌ No user after OAuth authentication');
        return res.redirect('/login?error=user_not_found');
      }
      
      console.log('✅ User authenticated:', req.user.email);
      
      // CRITICAL: Use req.login() to properly establish session
      // This is the correct way to log in a user with Passport
      req.login(req.user, { session: true }, async (loginErr: any) => {
        if (loginErr) {
          console.error('❌ Login error:', loginErr);
          return res.redirect('/login?error=login_failed');
        }
        
        console.log('✅ User logged in via req.login()');
        console.log('🔐 Session after login:', {
          sessionId: req.session?.id,
          hasPassport: !!(req.session as any)?.passport,
          passportUser: (req.session as any)?.passport?.user
        });
        
        // CRITICAL: Save session explicitly and wait for it
        try {
          await new Promise<void>((resolve, reject) => {
            req.session.save((err: any) => {
              if (err) {
                console.error('❌ Session save error in callback:', err);
                reject(err);
              } else {
                console.log('✅ Session explicitly saved after req.login()');
                resolve();
              }
            });
          });
        } catch (sessionError: any) {
          console.error('❌ Session save error:', sessionError);
          // Continue anyway - req.login() should have saved it
        }
        
        // Redirect to app
        const returnTo = (req.session as any)?.returnTo || '/app';
        delete (req.session as any)?.returnTo;
        console.log('🔄 Redirecting to:', returnTo);
        res.redirect(returnTo);
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
app.get('/test-auth-route', (_req: any, res: any) => {
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

process.on('unhandledRejection', (reason: any, _promise: Promise<any>) => {
  // Log but don't crash - allow the function to continue
  const errorMessage = reason?.message || reason?.toString() || 'Unknown rejection';
  console.error('⚠️ Unhandled Rejection (non-fatal):', errorMessage);
  // Don't exit - allow the function to continue processing requests
});

// Run database migrations on startup (CRITICAL: Must complete before handling requests)
// In serverless, we need to ensure migrations run before any database queries
let migrationPromise: Promise<boolean> | null = null;
let migrationAttempts = 0;
const MAX_MIGRATION_ATTEMPTS = 3;

async function ensureMigrationsRun(): Promise<boolean> {
  // If migration already succeeded, return immediately
  if (migrationPromise) {
    try {
      const result = await migrationPromise;
      if (result) {
        console.log('📦 Migration already completed successfully (cached)');
        return true;
      }
      // If previous attempt failed, allow retry if under max attempts
      if (migrationAttempts >= MAX_MIGRATION_ATTEMPTS) {
        console.error(`❌ Migration failed ${migrationAttempts} times, not retrying`);
        return false;
      }
      console.log(`📦 Previous migration attempt failed, starting new attempt (${migrationAttempts + 1}/${MAX_MIGRATION_ATTEMPTS})...`);
      // Reset promise to allow retry
      migrationPromise = null;
    } catch (error) {
      // Previous promise failed, reset it
      console.log('📦 Previous migration promise failed, resetting for retry...');
      migrationPromise = null;
    }
  }
  
  migrationAttempts++;
  console.log(`📦 Starting migration attempt ${migrationAttempts}/${MAX_MIGRATION_ATTEMPTS}...`);
  console.log('📋 DATABASE_URL available:', !!process.env.DATABASE_URL);
  
  migrationPromise = (async () => {
    try {
      // @ts-ignore - dist files are generated at build time
      const { ensureTablesExist } = await import('../dist/server/migrate.js');
      console.log('📦 Migration function imported, calling ensureTablesExist()...');
      
      const result = await ensureTablesExist();
      
      console.log(`📦 Migration attempt ${migrationAttempts} returned:`, result);
      
      if (result) {
        console.log('✅ Database migrations completed successfully');
        migrationAttempts = 0; // Reset counter on success
      } else {
        console.error(`❌ Migration attempt ${migrationAttempts} did NOT complete - ensureTablesExist() returned false`);
        console.error('❌ Check the migration logs above for detailed error information');
      }
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error(`❌ Migration attempt ${migrationAttempts} failed with exception:`, errorMessage);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error stack:', error?.stack);
      return false;
    }
  })();
  
  return migrationPromise;
}

// Start migration immediately (non-blocking for module load)
// CRITICAL: Don't let migration errors block the app - catch and log them
ensureMigrationsRun().catch((error: any) => {
  console.error('⚠️ Migration startup error (non-fatal):', error?.message || error);
  // Don't throw - allow the app to continue
  // OAuth routes don't need database, so they can still work
});

// Initialize app in background (non-blocking)
// Routes are already registered above, so they'll be matched before serveStatic's catch-all
initializeApp().catch(err => {
  console.error('⚠️ Initialization error (non-fatal):', err);
  // Don't throw - allow the function to continue
});

// Error handling middleware - MUST be registered AFTER all routes
// CRITICAL: Don't catch migration errors - they should be handled separately
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error('Request error:', {
    status,
    message,
    path: req.path,
    method: req.method
  });

  // Don't return JSON for migration errors - they should be handled gracefully
  // Migration errors shouldn't block OAuth routes
  // CRITICAL: For OAuth callback, don't redirect on migration errors - let it proceed
  if (message.includes('session_pkey') || message.includes('relation') || message.includes('migration')) {
    console.error('⚠️ Migration-related error caught by error handler - this should not block OAuth');
    
    // For OAuth INIT route (/auth/google), manually redirect to Google
    if (req.path === '/auth/google' && req.method === 'GET') {
      console.log('⚠️ Migration error for OAuth init route - attempting manual redirect');
      // Try to redirect to Google OAuth manually
      if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
        try {
          // Manually construct Google OAuth URL
          const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;
          const params = new URLSearchParams({
            client_id: process.env.GMAIL_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'profile email',
            access_type: 'offline',
            prompt: 'consent'
          });
          const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
          console.log('✅ Redirecting to Google OAuth manually');
          return res.redirect(googleAuthUrl);
        } catch (redirectError: any) {
          console.error('❌ Failed to redirect manually:', redirectError);
          return res.status(500).json({ message: 'OAuth redirect failed', error: redirectError?.message });
        }
      }
      return res.status(503).json({ message: 'OAuth not configured' });
    }
    
    // For OAuth CALLBACK route, ignore the error and let the callback handler proceed
    // The callback handler will handle user creation even if migrations failed
    if (req.path === '/auth/google/callback' && req.method === 'GET') {
      console.log('⚠️ Migration error for OAuth callback - ignoring error and continuing');
      // Clear the error and continue to next handler (the route handler)
      // This allows the callback route to process the request
      return _next();
    }
  }

  res.status(status).json({ message });
});

// Export the Express app directly - Vercel supports this
export default app;

