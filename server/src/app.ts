import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Enable 'trust proxy' for reverse proxy environments like Render / Heroku
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible local and development usage
    crossOriginEmbedderPolicy: false,
  })
);

// Allowed origins for CORS
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// CORS configuration supporting Vercel and Render deployments
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Explicitly allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel deployment preview or production domain (*.vercel.app)
      if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      // In development or test, allow all
      if (env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // Disallow unknown production origin
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request body and cookie parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(env.SESSION_COOKIE_SECRET));

// Root-level health check for Render / monitoring services
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'OK',
    healthy: true,
    service: 'JECRC Alumni API',
    timestamp: new Date().toISOString(),
  });
});

// API router mount
app.use('/api', apiRoutes);

// Static client hosting (if built)
const clientDistPath = fs.existsSync(path.resolve(process.cwd(), 'client/dist'))
  ? path.resolve(process.cwd(), 'client/dist')
  : path.resolve(process.cwd(), '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Only serve index.html for non-api requests
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Fallback 404 handler for undefined API routes
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// Central error handler
app.use(errorHandler);

// Start server if not running test suite
const isTestMode =
  process.env.NODE_ENV === 'test' ||
  process.argv.some((arg) => arg.toLowerCase().includes('test'));

if (!isTestMode) {
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`✨ JECRC Alumni Diwali 2026 Server running on 0.0.0.0:${env.PORT}`);
    console.log(`📍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://0.0.0.0:${env.PORT}/api`);
    console.log(`💻 Client URL: ${env.CLIENT_URL}`);
    console.log(`=======================================================`);
  });

  const shutdown = () => {
    console.log('\nGracefully shutting down server...');
    server.close(() => {
      console.log('Server closed. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
