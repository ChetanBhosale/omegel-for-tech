/**
 * Client-safe secrets for the frontend.
 *
 * IMPORTANT: Do NOT import `dotenv` here. This module is bundled into the
 * browser by Next.js. Only `NEXT_PUBLIC_*` variables are exposed, and Next.js
 * inlines these static `process.env.NEXT_PUBLIC_*` references at build time.
 */
const ClientSecrets = {
  PUBLIC_BACKEND: process.env.NEXT_PUBLIC_BACKEND_URL,
  PUBLIC_WS_URL: process.env.NEXT_PUBLIC_BACKEND_WS_URL,
  CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
};

export default ClientSecrets;
