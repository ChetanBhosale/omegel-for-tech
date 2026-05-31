import { Router } from 'express';
import {
  startOAuth,
  handleOAuthCallback,
  getMe,
  logout,
} from './auth.controller';

const router = Router();

// Current session
router.get('/me', getMe);
router.post('/logout', logout);

// Provider OAuth flow (e.g. /api/auth/github and /api/auth/github/callback).
// The :provider param makes this scalable — Google works the same way.
router.get('/:provider', startOAuth);
router.get('/:provider/callback', handleOAuthCallback);

export default router;
