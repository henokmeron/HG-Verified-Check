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
    // CRITICAL: Use BASE_URL for production, fallback to VERCEL_URL, then localhost
    // BASE_URL should be set to https://hg-verified-check.vercel.app in Vercel
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl && process.env.VERCEL_URL) {
      // If VERCEL_URL is a preview URL, use production domain instead
      if (process.env.VERCEL_URL.includes('hg-verified-check') && !process.env.VERCEL_URL.includes('hg-verified-check.vercel.app')) {
        baseUrl = 'https://hg-verified-check.vercel.app';
      } else {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      }
    }
    if (!baseUrl) {
      baseUrl = "http://localhost:3000";
    }
    
    // Ensure baseUrl doesn't have trailing slash
    baseUrl = baseUrl.replace(/\/$/, '');
    
    const callbackURL = `${baseUrl}/auth/google/callback`;
    console.log('🔗 OAuth Callback URL:', callbackURL);
    console.log('📋 Base URL used:', baseUrl);
    console.log('📋 Client ID (first 20 chars):', process.env.GMAIL_CLIENT_ID.substring(0, 20) + '...');
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          callbackURL: callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log('🔍 GoogleStrategy callback invoked');
            console.log('📋 Profile ID:', profile.id);
            console.log('📋 Profile emails:', profile.emails?.map((e: any) => e.value));
            console.log('📋 Profile name:', profile.name);
            
            const email = profile.emails?.[0]?.value;
            if (!email) {
              console.error('❌ No email found in Google profile');
              return done(new Error("No email found in Google profile"), null);
            }

            console.log('📧 Processing user with email:', email);
            
            // Check if user exists by email
            let user;
            try {
              user = await storage.getUserByEmail(email);
              console.log('📋 User exists:', !!user);
            } catch (error: any) {
              // Handle database errors (e.g., missing tables)
              const errorMessage = error?.message || error?.toString() || 'Unknown error';
              if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
                console.error('❌ Database tables not found. Attempting to run migrations...');
                console.error('❌ Error:', errorMessage);
                
                // CRITICAL: DO NOT RUN MIGRATIONS HERE - they timeout and block OAuth
                // Tables MUST be manually created in Neon Console using MANUAL-MIGRATION-NEON.sql
                console.error('❌ Database tables do not exist');
                console.error('❌ Please run the SQL script from MANUAL-MIGRATION-NEON.sql in Neon Console');
                console.error('❌ Or run the QUICK-FIX-SESSION-PKEY.sql script to quickly create tables');
                return done(
                  new Error(
                    'Database not ready. Please create tables manually in Neon Console using MANUAL-MIGRATION-NEON.sql. ' +
                    'Automated migrations timeout in serverless environment.'
                  ),
                  null
                );
              } else {
                // Re-throw other errors
                throw error;
              }
            }
            
            if (user) {
              console.log('🔄 Updating existing user:', user.id);
              // Set admin role for specific admin email if not already admin
              const isAdminEmail = email === 'hgerez91@gmail.com' || email === 'nokhen330@gmail.com';
              const shouldBeAdmin = isAdminEmail && user.role !== 'admin';
              
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
                creditBalance: shouldBeAdmin ? 10000 : user.creditBalance,
                stripeCustomerId: user.stripeCustomerId,
                role: shouldBeAdmin ? "admin" : user.role, // Upgrade to admin if admin email
                isActive: user.isActive,
                preferences: user.preferences,
                passwordHash: user.passwordHash,
                emailVerified: user.emailVerified,
                mfaEnabled: user.mfaEnabled,
                lastLoginIp: user.lastLoginIp,
              });
              
              if (shouldBeAdmin) {
                console.log('✅ User upgraded to admin:', email);
              }
            } else {
              console.log('➕ Creating new user');
              // Set admin role for specific admin email
              const isAdminEmail = email === 'hgerez91@gmail.com' || email === 'nokhen330@gmail.com';
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
                creditBalance: isAdminEmail ? 10000 : 0,
                role: isAdminEmail ? "admin" : "user",
                isActive: true,
              });
            }

            console.log('✅ User processed successfully:', user.id, user.email);
            return done(null, user);
          } catch (error: any) {
            console.error('❌ Error in GoogleStrategy callback:', error);
            console.error('❌ Error stack:', error?.stack);
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

