
// Vercel serverless function entry point
// This file handles all API routes for Vercel deployment

import express, { type Request, Response, NextFunction } from 'express';
// Import from bundled files (built during Vercel deployment)
import { registerRoutes } from '../dist/server/routes.js';
import { serveStatic } from '../dist/server/vite.js';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set larger payload limits for PDF handling (up to 30MB)
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Session middleware - use memory store for serverless
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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
      // Register all API routes
      // Note: registerRoutes returns an HTTP Server, but we don't need it for serverless
      await registerRoutes(app);
      // Server is created but not used in serverless environment
      
      // Setup static file serving for production
      serveStatic(app);
      
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  })();
  
  return initPromise;
}

// Initialize app immediately (Vercel will cache this)
await initializeApp();

// Export the Express app - Vercel will use it as a serverless function
export default app;

