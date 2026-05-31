import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for auth endpoints — protects the OAuth start/callback and
 * /me from abuse. 30 requests per minute per IP is generous for normal use.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again shortly.' },
});

/** Looser global limiter for everything else. */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again shortly.' },
});
