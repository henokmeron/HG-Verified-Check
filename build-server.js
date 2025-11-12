// Build script to compile server TypeScript files with esbuild
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  'server/services/OAuthEmailService.ts',
  'server/mockData/generateComprehensiveMockData.ts',
  'server/branding/brandLogos.ts',
  'server/config/features.ts',
  'server/reporting/brand.ts',
  'server/reporting/format.ts',
  'server/reportSchema/helpers.ts',
  'server/email/gmailService.ts',
  'shared/schema.ts'
];

const outDir = 'dist/server';

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Build each file, preserving directory structure
Promise.all(
  serverFiles.map(file => {
    // Preserve directory structure: 
    // server/auth/middleware.ts -> dist/server/auth/middleware.js
    // shared/schema.ts -> dist/shared/schema.js
    let relativePath;
    if (file.startsWith('shared/')) {
      relativePath = file.replace(/^shared\//, '');
      const sharedOutDir = 'dist/shared';
      if (!fs.existsSync(sharedOutDir)) {
        fs.mkdirSync(sharedOutDir, { recursive: true });
      }
      const outFile = path.join(sharedOutDir, relativePath.replace(/\.ts$/, '.js'));
      const outDirForFile = path.dirname(outFile);
      if (!fs.existsSync(outDirForFile)) {
        fs.mkdirSync(outDirForFile, { recursive: true });
      }
      return esbuild.build({
        entryPoints: [file],
        format: 'esm',
        outfile: outFile,
        platform: 'node',
        target: 'es2022',
        sourcemap: false,
        bundle: false
      }).then(() => {
        let content = fs.readFileSync(outFile, 'utf8');
        content = content.replace(
          /from\s+['"](\.\.?\/[^'"]*?)(?<!\.js)['"]/g,
          (match, importPath) => {
            if (importPath.endsWith('/')) return match;
            if (importPath.match(/\.(js|json|node)$/)) return match;
            return match.replace(importPath, importPath + '.js');
          }
        );
        // Fix @shared/ imports in shared files (if any)
        content = content.replace(/from\s+['"]@shared\/([^'"]+)['"]/g, "from './$1.js'");
        fs.writeFileSync(outFile, content, 'utf8');
      });
    }
    relativePath = file.replace(/^server\//, '');
    const outFile = path.join(outDir, relativePath.replace(/\.ts$/, '.js'));
    
    // Ensure output directory exists
    const outDirForFile = path.dirname(outFile);
    if (!fs.existsSync(outDirForFile)) {
      fs.mkdirSync(outDirForFile, { recursive: true });
    }
    
    return esbuild.build({
      entryPoints: [file],
      format: 'esm',
      outfile: outFile,
      platform: 'node',
      target: 'es2022',
      sourcemap: false,
      bundle: false // Don't bundle - just compile TypeScript to JavaScript
    }).then(() => {
      // Post-process: Add .js extensions to relative imports and fix path aliases
      let content = fs.readFileSync(outFile, 'utf8');
      
      // Fix @shared/ imports to relative paths
      const fileDir = path.dirname(file);
      if (fileDir.startsWith('server/')) {
        // From server files, @shared/ -> ../../shared/
        content = content.replace(/from\s+['"]@shared\/([^'"]+)['"]/g, "from '../../shared/$1.js'");
        content = content.replace(/import\s*\(\s*['"]@shared\/([^'"]+)['"]\s*\)/g, "import('../../shared/$1.js')");
      }
      
      // Replace relative imports without extensions
      content = content.replace(
        /from\s+['"](\.\.?\/[^'"]*?)(?<!\.js)['"]/g,
        (match, importPath) => {
          // Skip if it's a directory import (ends with /)
          if (importPath.endsWith('/')) return match;
          // Skip if already has extension
          if (importPath.match(/\.(js|json|node)$/)) return match;
          return match.replace(importPath, importPath + '.js');
        }
      );
      // Also handle import() statements
      content = content.replace(
        /import\s*\(\s*['"](\.\.?\/[^'"]*?)(?<!\.js)['"]\s*\)/g,
        (match, importPath) => {
          if (importPath.endsWith('/')) return match;
          if (importPath.match(/\.(js|json|node)$/)) return match;
          return match.replace(importPath, importPath + '.js');
        }
      );
      fs.writeFileSync(outFile, content, 'utf8');
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

