import type { Express } from "express";
import session from "express-session";
import { randomBytes } from "crypto";

import passport from "passport";
import { configurePassport } from "./passport";
import { createAuthRoutes } from "./routes";

/**
 * Public configuration surface for the authentication module
 */
export interface AuthConfig {
  baseUrl: string;
  sessionSecret?: string;
  sessionStore?: session.Store;
}

export function setupAuth(app: Express, config: AuthConfig) {
  const sessionSecret =
    config.sessionSecret ||
    process.env.SESSION_SECRET ||
    randomBytes(32).toString("hex");

  const sessionMiddleware = session({
    secret: sessionSecret,
    resave: true, // Changed to true for better session persistence
    saveUninitialized: true, // Changed to true to ensure session is created
    store: config.sessionStore,
    cookie: {
      httpOnly: true,
      secure: false, // Always false for localhost development
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  });

  app.set("trust proxy", 1);
  app.use(sessionMiddleware);

  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  createAuthRoutes(app, passport, config.baseUrl);
}

