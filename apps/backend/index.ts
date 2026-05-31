import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { MemberManager } from './manager';
import Secrets from '@repo/secrets/backend';
import authRoutes from './src/auth/auth.routes';
import { notFoundHandler, errorHandler } from './src/middleware/error';
import { authRateLimiter, globalRateLimiter } from './src/middleware/rate-limit';
import { log } from './src/logger';

const app = express();

// Render (and most hosts) inject a single PORT to bind to. Fall back to the
// local HTTP_PORT for development.
const PORT = Number(process.env.PORT) || Number(Secrets.HTTP_PORT) || 4000;

// Trust the proxy (Render/Vercel) so rate-limit sees the real client IP.
app.set('trust proxy', 1);

// Security headers. crossOriginResourcePolicy relaxed so the API can be called
// from the frontend origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allowed origins for CORS. Includes the configured FRONTEND_URL plus the
// known production domains. Cookies require an exact origin (no wildcard).
const ALLOWED_ORIGINS = [
  Secrets.FRONTEND_URL,
  'http://localhost:3000',
  'https://omegel-for-tech-app.vercel.app',
  'https://omegelfortech.com',
  'https://omeglefortech.com',
  'https://www.omegelfortech.com',
].filter(Boolean) as string[];

// CORS must allow credentials so the auth cookie is sent/received cross-origin.
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin header) and any whitelisted origin.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      log.warn('cors', 'blocked origin', { origin });
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());
app.use(globalRateLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'working' });
});

// Auth routes (rate-limited): /api/auth/github, /github/callback, /me, ...
app.use('/api/auth', authRateLimiter, authRoutes);

// 404 + global error handler (must come last).
app.use(notFoundHandler);
app.use(errorHandler);

// HTTP and WebSocket share the same server/port.
const server = app.listen(PORT, () => {
  log.info('server', `HTTP + WS listening`, {
    port: PORT,
    env: Secrets.NODE_ENV,
  });
});

const manager = MemberManager.getInstance();
manager.init(server);


process.on('unhandledRejection', (reason) => {
  log.error('process', 'unhandledRejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  log.error('process', 'uncaughtException', { err: String(err) });
});

// Graceful shutdown: stop accepting connections, clean up sockets + Redis.
let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info('shutdown', `received ${signal}, closing gracefully…`);

  const forceExit = setTimeout(() => process.exit(1), 10_000);
  try {
    await manager.shutdown();
    server.close(() => {
      clearTimeout(forceExit);
      log.info('shutdown', 'closed cleanly');
      process.exit(0);
    });
  } catch (err) {
    log.error('shutdown', 'error', { err: String(err) });
    clearTimeout(forceExit);
    process.exit(1);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
