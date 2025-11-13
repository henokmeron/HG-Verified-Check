import type { Request, Response, NextFunction } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check if we're in production (Vercel) or local dev
  // Vercel sets: VERCEL=1, NODE_ENV=production, VERCEL_ENV=production
  const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.VERCEL === '1' || 
                        process.env.VERCEL_ENV === 'production' ||
                        process.env.VERCEL_URL;
  const isLocalDev = !isProduction && !process.env.REPL_ID;
  
  // Check Passport authentication (for production OAuth)
  const isPassportAuth = (req as any).isAuthenticated && (req as any).isAuthenticated();
  
  // Check local dev session (only for local development)
  const isLocalDevAuth = isLocalDev && (req.session as any)?.userLoggedIn;
  
  if (isPassportAuth || isLocalDevAuth) {
    // If in local dev mode and no req.user exists, create a mock user
    if (isLocalDevAuth && !req.user) {
      (req as any).user = {
        claims: {
          sub: 'local-dev-user',
          email: 'dev@autocheckpro.com'
        },
        role: 'admin'
      };
    }
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if we're in production (Vercel) or local dev
  // Vercel sets: VERCEL=1, NODE_ENV=production, VERCEL_ENV=production
  const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.VERCEL === '1' || 
                        process.env.VERCEL_ENV === 'production' ||
                        process.env.VERCEL_URL;
  const isLocalDev = !isProduction && !process.env.REPL_ID;
  
  // Check Passport authentication (for production OAuth)
  const isPassportAuth = (req as any).isAuthenticated && (req as any).isAuthenticated();
  
  // Check local dev session (only for local development)
  const isLocalDevAuth = isLocalDev && (req.session as any)?.userLoggedIn;
  
  if (!isPassportAuth && !isLocalDevAuth) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // In local dev mode, the user is always admin
  if (isLocalDevAuth) {
    if (!req.user) {
      (req as any).user = {
        claims: {
          sub: 'local-dev-user',
          email: 'dev@autocheckpro.com'
        },
        role: 'admin'
      };
    }
    return next();
  }

  // For Passport auth, check the user role
  const user = req.user as any;
  if (user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // This middleware doesn't block requests, just adds user info if available
  next();
}
