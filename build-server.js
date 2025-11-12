// Build script to compile server TypeScript files with esbuild
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const serverFiles = [
  'server/routes.ts',
  'server/vite.ts',
  'server/storage.ts',
  'server/db.ts',
  'server/auth/index.ts',
  'server/auth/passport.ts',
  'server/auth/routes.ts',
  'server/auth/middleware.ts',
  'server/pdf/unifiedReportGenerator.ts',
  'server/services/EmailService.ts',
  'server/services/OAuthEmailService.ts'
];

const outDir = 'dist/server';

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Build each file
Promise.all(
  serverFiles.map(file => {
    const outFile = path.join(outDir, path.basename(file, '.ts') + '.js');
    return esbuild.build({
      entryPoints: [file],
      bundle: true, // Bundle to resolve all imports
      format: 'esm',
      outfile: outFile,
      platform: 'node',
      target: 'es2022',
      sourcemap: false,
      external: [
        // External dependencies that should not be bundled
        'express',
        'express-session',
        'passport',
        'passport-google-oauth20',
        'passport-local',
        'stripe',
        'axios',
        'zod',
        'nodemailer',
        'nanoid',
        'puppeteer',
        'react',
        'react-dom',
        'react-dom/server',
        'googleapis',
        '@neondatabase/serverless',
        'fs',
        'path',
        'http',
        'url'
      ]
    });
  })
)
  .then(() => {
    console.log('✅ Server files built successfully');
  })
  .catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
  });

