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
                
                // Try to run migrations now with retries
                try {
                  // @ts-ignore - dist files are generated at build time
                  // From dist/server/auth/passport.js, we need to go up one level to dist/server/
                  const { ensureTablesExist } = await import('../migrate.js');
                  
                  // Retry migration up to 5 times with delays
                  let migrationResult = false;
                  for (let i = 0; i < 5; i++) {
                    migrationResult = await ensureTablesExist();
                    if (migrationResult) {
                      break;
                    }
                    console.log(`⏳ Migration attempt ${i + 1}/5, waiting before retry...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                  
                  if (migrationResult) {
                    console.log('✅ Migrations completed, retrying user lookup...');
                    // Retry the user lookup
                    user = await storage.getUserByEmail(email);
                    console.log('📋 User exists after migration:', !!user);
                  } else {
                    console.error('❌ Migrations failed after retries');
                    return done(new Error("Database tables not initialized. Please wait a moment and try again."), null);
                  }
                } catch (migrationError: any) {
                  console.error('❌ Migration retry failed:', migrationError?.message || migrationError);
                  console.error('❌ Migration error stack:', migrationError?.stack);
                  return done(new Error("Database tables not initialized. Please wait a moment and try again."), null);
                }
              } else {
                // Re-throw other errors
                throw error;
              }
            }
            
            if (user) {
              console.log('🔄 Updating existing user:', user.id);
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
              console.log('➕ Creating new user');
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

