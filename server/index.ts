import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from "url";
import { emailService } from "./services/EmailService";
import { argv } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Set larger payload limits for PDF handling (up to 30MB)
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Session middleware for demo login
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Environment variable validation
function validateEnvironmentVariables() {
  const requiredVars = {
    DATABASE_URL: 'Database connection string',
    STRIPE_SECRET_KEY: 'Stripe payment processing',
    VDGI_API_KEY: 'Vehicle data lookup API'
  };

  const missingVars: string[] = [];

  for (const [varName, description] of Object.entries(requiredVars)) {
    if (!process.env[varName]) {
      missingVars.push(`${varName} (${description})`);
    }
  }

  if (missingVars.length > 0) {
    console.warn('⚠️  Warning: Missing environment variables:');
    missingVars.forEach(varInfo => {
      console.warn(`   • ${varInfo}`);
    });
    console.warn('\n📝 To fix deployment errors, configure these variables in:');
    console.warn('   Deployments pane → Configuration tab → Environment Variables');
    console.warn('\n🔧 Some features may be disabled until these are configured.\n');
    return false;
  }

  console.log('✅ All required environment variables are configured');
  return true;
}

(async () => {
  try {
    console.log('🚀 Starting server initialization...');
    
    // Validate environment variables (non-blocking)
    validateEnvironmentVariables();

    const server = await registerRoutes(app);
    console.log('✅ Routes registered successfully');
    
    // Initialize email service
    console.log('📧 Initializing email service...');
    // The email service initializes itself when imported
    // Force initialization by accessing the service
    if (emailService) {
      console.log('📧 Email service imported successfully');
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log the error for debugging
      console.error('🔴 Request error:', {
        status,
        message,
        path: _req.path,
        method: _req.method
      });

      res.status(status).json({ message });
      // Don't throw here - just log and respond
    });

    // Force production mode for deployment readiness
    app.set("env", "production");
    
    // Setup static file serving for production
    console.log('📦 Setting up static file serving for production...');
    serveStatic(app);

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 3000 for production.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
     const port = argv.includes('--port') ? parseInt(argv[argv.indexOf('--port') + 1]) : parseInt(process.env.PORT || '5000', 10);
     console.log(`[DEBUG] Starting server on port ${port}`);
 
     server.listen(port, '0.0.0.0', () => {
       console.log(`\n🎉 Server successfully started!`);
       console.log(`🌐 API Server running at: http://localhost:${port}`);
       console.log(`🔗 Client will run at: http://localhost:5173`);
       console.log(`📝 Test endpoint: http://localhost:${port}/api/public/vehicle-lookup`);
       console.log(`📊 Environment: ${app.get("env") || 'production'}`);
       log(`serving on port ${port}`);
     });

  } catch (error) {
    console.error('\n💥 Server initialization failed:');
    console.error('Error:', (error as Error).message);
    console.error('\n🔍 Common solutions:');
    console.error('   1. Check all environment variables are configured');
    console.error('   2. Ensure DATABASE_URL points to a valid database');
    console.error('   3. Verify API keys are correct and active');
    console.error('   4. Check for typos in configuration values');
    console.error('\n📝 Configure missing variables in: Deployments pane → Configuration tab');
    console.error('\nStack trace:');
    console.error((error as Error).stack);
    
    // Exit with error code to indicate deployment failure
    process.exit(1);
  }
})();
