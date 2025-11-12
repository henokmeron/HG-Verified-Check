import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Lazily import Vite and its config only in development to avoid
  // requiring the 'vite' package in production builds/environments.
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteConfig = (await import("../vite.config")).default;
  const viteLogger = createLogger();

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    // In development mode, static files are served by Vite dev server
    // This is expected and normal - only log once at startup
    if (process.env.NODE_ENV !== 'production') {
      // Only show this message once in development
      if (!(global as any).__staticWarningShown) {
        console.log('ℹ️  Development mode: Static files served by Vite dev server (port 5173)');
        console.log('   Build directory not needed in development.');
        (global as any).__staticWarningShown = true;
      }
    } else {
      // In production, this is a problem
      console.warn(`⚠️  Build directory not found: ${distPath}`);
      console.warn('   For production, build the client first with: cd client && npm run build');
    }
    return; // Skip static file serving in development
  }

  // Serve static files from the dist/public directory
  app.use(express.static(distPath));

  // Only serve index.html for non-API routes that don't match static files
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
