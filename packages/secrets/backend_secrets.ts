/**
 * Backend secrets.
 *
 * Loads the monorepo root `.env` via dotenv. This file is Node-only and must
 * NEVER be imported from frontend/browser code.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the monorepo root .env relative to this file so it works regardless
// of the process working directory.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const isProd = process.env.NODE_ENV === 'production';

const JWT_SECRET = process.env.JWT_SECRET;
// In production a real secret is mandatory — never fall back to a known value,
// otherwise sessions could be forged.
if (isProd && (!JWT_SECRET || JWT_SECRET.length < 16)) {
  throw new Error(
    'JWT_SECRET must be set to a strong value in production (>= 16 chars).'
  );
}

const BackendSecrets = {
  // shared / frontend-facing
  PUBLIC_BACKEND: process.env.NEXT_PUBLIC_BACKEND_URL,
  PUBLIC_WS_URL: process.env.NEXT_PUBLIC_BACKEND_WS_URL,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // backend only
  HTTP_PORT: process.env.HTTP_PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // redis (upstash)
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

  // auth
  JWT_SECRET: JWT_SECRET || 'dev-insecure-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // github oauth
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL:
    process.env.GITHUB_CALLBACK_URL ||
    'http://localhost:4000/api/auth/github/callback',
};

export default BackendSecrets;
