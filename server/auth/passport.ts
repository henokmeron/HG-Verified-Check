import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import type { User } from "@shared/schema";

export function configurePassport() {
  // Google OAuth Strategy
  console.log('🔧 Configuring Passport with Google OAuth...');
  console.log('📧 Gmail Client ID available:', !!process.env.GMAIL_CLIENT_ID);
  console.log('🔐 Gmail Client Secret available:', !!process.env.GMAIL_CLIENT_SECRET);
  
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
    const callbackURL = `${process.env.BASE_URL || process.env.VERCEL_URL || "http://localhost:3000"}/auth/google/callback`;
    console.log('🔗 OAuth Callback URL:', callbackURL);
    console.log('📋 Client ID (first 20 chars):', process.env.GMAIL_CLIENT_ID.substring(0, 20) + '...');
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          callbackURL: callbackURL,
          // Enable account selection (prompt for account choice)
          prompt: 'select_account',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"), null);
            }

            // Check if user exists by email
            let user = await storage.getUserByEmail(email);
            
            if (user) {
              // Update existing user with Google provider info
              user = await storage.upsertUser({
                id: user.id,
                email,
                firstName: profile.name?.givenName || user.firstName,
                lastName: profile.name?.familyName || user.lastName,
                profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
                authProvider: "google",
                providerId: profile.id,
                lastLoginAt: new Date(),
                creditBalance: user.creditBalance,
                stripeCustomerId: user.stripeCustomerId,
                role: user.role,
                isActive: user.isActive,
                preferences: user.preferences,
                passwordHash: user.passwordHash,
                emailVerified: user.emailVerified,
                mfaEnabled: user.mfaEnabled,
                lastLoginIp: user.lastLoginIp,
              });
            } else {
              // Create new user
              user = await storage.upsertUser({
                email,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                profileImageUrl: profile.photos?.[0]?.value,
                authProvider: "google",
                providerId: profile.id,
                emailVerified: true,
                lastLoginAt: new Date(),
                creditBalance: 0,
                role: "user",
                isActive: true,
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
    console.log('✅ Google OAuth strategy configured successfully');
  } else {
    console.warn('⚠️ Google OAuth not configured - missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET');
  }

  // Local Strategy (email/password) - commented out for now
  // passport.use(
  //   new LocalStrategy(
  //     {
  //       usernameField: "email",
  //       passwordField: "password",
  //     },
  //     async (email, password, done) => {
  //       try {
  //         const user = await storage.getUserByEmail(email);
  //         if (!user) {
  //           return done(null, false, { message: "Invalid email or password" });
  //         }

  //         if (user.authProvider !== "local") {
  //           return done(null, false, { 
  //             message: `Please sign in with ${user.authProvider}` 
  //           });
  //         }

  //         if (!user.passwordHash) {
  //           return done(null, false, { message: "Account not properly set up" });
  //         }

  //         const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  //         if (!isValidPassword) {
  //           return done(null, false, { message: "Invalid email or password" });
  //         }

  //         // Update last login
  //         await storage.upsertUser({
  //           id: user.id,
  //           email: user.email,
  //           firstName: user.firstName,
  //           lastName: user.lastName,
  //           profileImageUrl: user.profileImageUrl,
  //           creditBalance: user.creditBalance,
  //           stripeCustomerId: user.stripeCustomerId,
  //           role: user.role,
  //           isActive: user.isActive,
  //           lastLoginAt: new Date(),
  //           preferences: user.preferences,
  //           authProvider: user.authProvider,
  //           providerId: user.providerId,
  //           passwordHash: user.passwordHash,
  //           emailVerified: user.emailVerified,
  //           mfaEnabled: user.mfaEnabled,
  //           lastLoginIp: user.lastLoginIp,
  //         });

  //         return done(null, user);
  //       } catch (error) {
  //         return done(error, null);
  //       }
  //     }
  //   )
  // );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    console.log('🔐 Serializing user:', user?.id || user?.email);
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('🔐 Deserializing user:', id);
      const user = await storage.getUser(id);
      if (user) {
        console.log('✅ User deserialized successfully:', user.email);
      } else {
        console.warn('⚠️ User not found during deserialization:', id);
      }
      done(null, user);
    } catch (error) {
      console.error('❌ Error deserializing user:', error);
      done(error, null);
    }
  });

  return passport;
}

