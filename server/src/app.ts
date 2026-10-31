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

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible local and development usage
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration for client origin and credentials
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request body and cookie parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(env.SESSION_COOKIE_SECRET));

// API router mount
app.use('/api', apiRoutes);

// Static client hosting (if built)
const clientDistPath = fs.existsSync(path.resolve(process.cwd(), 'client/dist'))
  ? path.resolve(process.cwd(), 'client/dist')
  : path.resolve(process.cwd(), '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    // Only serve index.html for non-api requests
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Fallback 404 handler for undefined API routes
app.use((_req, res) => {
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
  const server = app.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(`✨ JECRC Alumni Diwali 2026 Server running on port ${env.PORT}`);
    console.log(`📍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://localhost:${env.PORT}/api`);
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
