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
      format: 'esm',
      outfile: outFile,
      platform: 'node',
      target: 'es2022',
      sourcemap: false,
      bundle: false, // Don't bundle - just compile TypeScript to JavaScript
      external: [
        // Mark all node_modules as external
        /^[^./]|^\.[^./]|^\.\.[^/]/
      ]
    }).then(() => {
      // Post-process: Add .js extensions to relative imports
      let content = fs.readFileSync(outFile, 'utf8');
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

