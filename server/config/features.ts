// Feature flags for safe deployment and UK compliance
// These flags allow gradual rollout and emergency disable

export const featureFlags = {
  // Email service - can be disabled if issues occur
  DISABLE_EMAIL: process.env.DISABLE_EMAIL === 'true',
  
  // Payment processing - can be disabled for maintenance
  DISABLE_PAYMENTS: process.env.DISABLE_PAYMENTS === 'true',
  
  // Read-only mode - prevents data modifications
  READONLY_MODE: process.env.READONLY_MODE === 'true',
  
  // Vehicle lookup limits for UK compliance
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false',
  
  // GDPR compliance features
  ENABLE_GDPR_FEATURES: process.env.ENABLE_GDPR_FEATURES !== 'false',
  
  // Debug mode for detailed logging
  DEBUG_MODE: process.env.NODE_ENV === 'development' || process.env.DEBUG_MODE === 'true'
};

// UK Compliance constants
export const UK_COMPLIANCE = {
  // Data retention periods (in days)
  USER_DATA_RETENTION: 365 * 6, // 6 years for accounting
  LOOKUP_HISTORY_RETENTION: 30, // 30 days
  SESSION_RETENTION: 365, // 1 year
  COOKIE_CONSENT_RETENTION: 365 * 2, // 2 years
  
  // Rate limits for UK compliance
  FREE_LOOKUPS_PER_DAY: 3,
  MAX_LOOKUPS_PER_HOUR: 20,
  
  // Required legal notices
  COMPANY_NAME: "HG Verified Ltd",
  COMPANY_NUMBER: "12345678", // Update with real company number
  REGISTERED_OFFICE: "[Full Registered Address]", // Update with real address
  SUPPORT_EMAIL: "support@hgverified.com",
  DPO_EMAIL: "dpo@hgverified.com" // Data Protection Officer
};

// Startup safety checks
export function validateCompliance() {
  const requiredSecrets = [
    'GMAIL_ADDRESS',
    'GMAIL_API_KEY', 
    'VDGI_API_KEY',
    'DATABASE_URL',
    'STRIPE_SECRET_KEY'
  ];
  
  const missing = requiredSecrets.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required secrets for UK compliance:', missing);
    console.error('Configure these in Replit Secrets before deployment');
    return false;
  }
  
  console.log('✅ UK compliance secrets validation passed');
  return true;
}

// Log feature flag status (for deployment verification)
export function logFeatureStatus() {
  console.log('🔧 Feature Flags Status:');
  Object.entries(featureFlags).forEach(([flag, enabled]) => {
    const status = enabled ? '✅' : '❌';
    console.log(`   ${status} ${flag}: ${enabled}`);
  });
}