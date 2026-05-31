import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { MemberManager } from './manager';
import Secrets from '@repo/secrets/backend';
import authRoutes from './src/auth/auth.routes';
import { notFoundHandler, errorHandler } from './src/middleware/error';
import { authRateLimiter, globalRateLimiter } from './src/middleware/rate-limit';

const app = express();

// Render (and most hosts) inject a single PORT to bind to. Fall back to the
// local HTTP_PORT for development.
const PORT = Number(process.env.PORT) || Number(Secrets.HTTP_PORT) || 4000;

// Trust the proxy (Render/Vercel) so rate-limit sees the real client IP.
app.set('trust proxy', 1);

// Security headers. crossOriginResourcePolicy relaxed so the API can be called
// from the frontend origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS must allow credentials so the auth cookie is sent/received cross-origin.
app.use(
  cors({
    origin: Secrets.FRONTEND_URL,
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
  console.log(`HTTP + WS server running on port ${PORT}`);
});

const manager = MemberManager.getInstance();
manager.init(server);


process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

// Graceful shutdown: stop accepting connections, clean up sockets + Redis.
let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] received ${signal}, closing gracefully…`);

  const forceExit = setTimeout(() => process.exit(1), 10_000);
  try {
    await manager.shutdown();
    server.close(() => {
      clearTimeout(forceExit);
      console.log('[shutdown] closed cleanly');
      process.exit(0);
    });
  } catch (err) {
    console.error('[shutdown] error:', err);
    clearTimeout(forceExit);
    process.exit(1);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
