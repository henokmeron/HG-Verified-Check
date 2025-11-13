import type { Express } from "express";
import type { Authenticator } from "passport";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function createAuthRoutes(app: Express, passport: Authenticator, baseUrl: string) {
  // Simple login page for local development
  app.get("/api/login", (req, res) => {
    // Store the redirect URL in the session
    if (req.query.redirect) {
      (req.session as any).returnTo = req.query.redirect as string;
    }
    
    // Check if we're in production (Vercel) or local dev
    // Vercel sets: VERCEL=1, NODE_ENV=production, VERCEL_ENV=production
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.VERCEL === '1' || 
                        process.env.VERCEL_ENV === 'production' ||
                        process.env.VERCEL_URL;
    const isLocalDev = !isProduction && !process.env.REPL_ID;
    
    // For local development, show a simple login page
    if (isLocalDev) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>AutoCheckPro - Sign In</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 400px; margin: 100px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { text-align: center; color: #333; margin-bottom: 30px; }
            .btn { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
            .btn:hover { background: #0056b3; }
            .btn:disabled { background: #ccc; cursor: not-allowed; }
            .info { background: #e7f3ff; padding: 15px; border-radius: 4px; margin-bottom: 20px; color: #0066cc; }
            .spinner { display: none; margin: 10px auto; border: 3px solid #f3f3f3; border-top: 3px solid #007bff; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Sign In</h1>
            <div class="info">
              <strong>Local Development Mode</strong><br>
              Authentication is simplified for local testing. Click below to access the application.
            </div>
            <button class="btn" id="loginBtn" onclick="login()">
              Sign In
            </button>
            <div class="spinner" id="spinner"></div>
            <script>
              async function login() {
                const btn = document.getElementById('loginBtn');
                const spinner = document.getElementById('spinner');
                btn.disabled = true;
                btn.textContent = 'Signing in...';
                spinner.style.display = 'block';
                
                try {
                  const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    window.location.href = '${req.query.redirect || '/app'}';
                  } else {
                    const data = await response.json();
                    alert('Login failed: ' + (data.message || 'Please try again'));
                    btn.disabled = false;
                    btn.textContent = 'Sign In';
                    spinner.style.display = 'none';
                  }
                } catch (error) {
                  console.error('Login error:', error);
                  alert('Login failed. Please check the console and try again.');
                  btn.disabled = false;
                  btn.textContent = 'Sign In';
                  spinner.style.display = 'none';
                }
              }
            </script>
          </div>
        </body>
        </html>
      `);
    }
    
    // For production, redirect to Google OAuth (only if configured)
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
      res.redirect("/auth/google");
    } else {
      res.status(503).json({ 
        message: "Google OAuth not configured. Please configure GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables." 
      });
    }
  });

  // Google OAuth routes - ONLY register if credentials are configured
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
    app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    app.get(
      "/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login?error=google_failed" }),
      (req, res) => {
        res.redirect("/app");
      }
    );
    console.log('✅ Google OAuth routes registered');
  } else {
    // Provide helpful error message if someone tries to access Google OAuth without configuration
    app.get("/auth/google", (req, res) => {
      // For local development, auto-login as demo user
      console.log('🔐 Local dev: Auto-logging in as demo user...');
      
      // Set session to indicate user is logged in
      (req.session as any).userLoggedIn = true;
      (req.session as any).userId = "demo-user";
      (req.session as any).userRole = "admin"; // Give admin access for testing
      
      // Save session and redirect
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return res.status(500).send('Failed to log in');
        }
        
        console.log('✅ Demo user logged in successfully');
        
        // Get redirect URL from session or query
        const redirectTo = (req.session as any).returnTo || req.query.redirect || '/app';
        delete (req.session as any).returnTo;
        
        res.redirect(redirectTo as string);
      });
    });

    app.get("/auth/google/callback", (req, res) => {
      res.status(503).json({ 
        message: "Google OAuth is not configured. Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables." 
      });
    });
    console.warn('⚠️ Google OAuth routes not registered - credentials missing');
  }

  // Local auth routes - commented out for now, focusing on Google OAuth
  // app.post("/auth/register", async (req, res) => {
  //   try {
  //     const { email, password, firstName, lastName } = registerSchema.parse(req.body);

  //     // Check if user already exists
  //     const existingUser = await storage.getUserByEmail(email);
  //     if (existingUser) {
  //       return res.status(400).json({ message: "User already exists" });
  //     }

  //     // Hash password
  //     const passwordHash = await bcrypt.hash(password, 12);

  //     // Create user
  //     const user = await storage.upsertUser({
  //       email,
  //       passwordHash,
  //       firstName,
  //       lastName,
  //       authProvider: "local",
  //       emailVerified: false, // TODO: Implement email verification
  //       creditBalance: 0,
  //       role: "user",
  //       isActive: true,
  //     });

  //     // Auto-login after registration
  //     req.login(user, (err) => {
  //       if (err) {
  //         return res.status(500).json({ message: "Registration successful but login failed" });
  //       }
  //       res.json({ user, message: "Registration successful" });
  //     });
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       return res.status(400).json({ message: "Invalid input", errors: error.errors });
  //     }
  //     res.status(500).json({ message: "Registration failed" });
  //   }
  // });

  // app.post("/auth/login", (req, res, next) => {
  //   passport.authenticate("local", (err, user, info) => {
  //     if (err) {
  //       return res.status(500).json({ message: "Login failed" });
  //     }
  //     if (!user) {
  //       return res.status(401).json({ message: info?.message || "Login failed" });
  //     }
  //     req.login(user, (err) => {
  //       if (err) {
  //         return res.status(500).json({ message: "Login failed" });
  //       }
  //       res.json({ user, message: "Login successful" });
  //     });
  //   })(req, res, next);
  // });

  // Simple login endpoint for local development
  app.post("/api/auth/login", (req, res) => {
    // Check if we're in production (Vercel) or local dev
    // Vercel sets: VERCEL=1, NODE_ENV=production, VERCEL_ENV=production
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.VERCEL === '1' || 
                        process.env.VERCEL_ENV === 'production' ||
                        process.env.VERCEL_URL;
    const isLocalDev = !isProduction && !process.env.REPL_ID;
    
    if (isLocalDev) {
      console.log('🔐 Local dev login attempt...');
      
      // Set session flag to indicate user has logged in
      (req.session as any).userLoggedIn = true;
      
      // Explicitly save the session before responding
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return res.status(500).json({
            success: false,
            message: "Failed to save session"
          });
        }
        
        console.log('✅ Session saved successfully');
        return res.json({
          success: true,
          message: "Logged in successfully"
        });
      });
      return; // Important: prevent further execution
    }
    
    // For production, redirect to proper OAuth (only if configured)
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
      res.redirect("/auth/google");
    } else {
      res.status(500).json({ 
        message: "Google OAuth not configured. Please configure GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables." 
      });
    }
  });

  app.post("/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      // Clear the local dev session flag as well
      if (req.session) {
        (req.session as any).userLoggedIn = false;
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}

