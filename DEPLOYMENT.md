# Deployment Configuration

This document outlines the deployment setup for HG Verified Vehicle Check.

## Build Configuration

The project uses a two-stage build process:

1. **Frontend Build**: `vite build` - Builds the React frontend into `dist/public`
2. **Server Build**: `esbuild server/index.ts` - Bundles the Express server into `dist/index.js`

## Environment Variables Required for Deployment

### Authentication
- `REPLIT_DOMAINS` - Required for Replit OAuth authentication (already configured)
- `SESSION_SECRET` - Required for session management
- `ISSUER_URL` - OAuth issuer URL (defaults to https://replit.com/oidc)

### Database
- `DATABASE_URL` - PostgreSQL connection string (automatically provided by Replit)

### Payment Processing
- `STRIPE_SECRET_KEY` - Stripe secret key for payment processing
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key for frontend integration

### Vehicle Data API
- `DVLA_API_KEY` - UK Vehicle Data API key (optional, falls back to test data)

## Server Configuration

The server is properly configured for deployment:
- Listens on `0.0.0.0:${PORT}` where PORT defaults to 5000
- Uses the PORT environment variable provided by Replit Deployments
- Serves both API and static frontend files from the same port
- Includes proper error handling and logging

## Build Scripts

The package.json includes the required scripts:
- `build`: Builds both frontend and backend for production
- `start`: Starts the production server from built files
- `dev`: Development server for local testing

## Deployment Process

1. Run `npm run build` to create production builds
2. Run `npm start` to start the production server
3. Server will serve on port 5000 or the PORT environment variable
4. Frontend is served as static files from `/dist/public`
5. API endpoints are available under `/api/*`

## File Structure After Build

```
dist/
├── index.js          # Built server bundle
└── public/           # Built frontend assets
    ├── index.html
    ├── assets/
    └── ...
```

## Notes

- The server automatically detects production mode and serves static files
- Authentication requires REPLIT_DOMAINS to be properly configured
- Database connection is handled via the DATABASE_URL environment variable
- All builds use ESM format to match the project configuration