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

const BackendSecrets = {
  // shared / frontend-facing
  PUBLIC_BACKEND: process.env.NEXT_PUBLIC_BACKEND_URL,
  PUBLIC_WS_URL: process.env.NEXT_PUBLIC_BACKEND_WS_URL,
  CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,

  // backend only
  HTTP_PORT: process.env.HTTP_PORT,
  WS_PORT: process.env.WS_PORT || 4001,
};

export default BackendSecrets;
