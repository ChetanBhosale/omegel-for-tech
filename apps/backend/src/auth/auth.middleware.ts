import type { Request, Response, NextFunction } from 'express';
import { verifyToken, AUTH_COOKIE } from './jwt';

// Augment Express's Request with the authenticated user id.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Express middleware that requires a valid session cookie. Attaches `userId`
 * to the request for downstream handlers.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.userId = payload.sub;
  return next();
}
