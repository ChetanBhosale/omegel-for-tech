/**
 * Tiny structured-ish logger with timestamps and levels. Keeps backend flow
 * logs consistent and easy to scan.
 */
function ts(): string {
  return new Date().toISOString();
}

export const log = {
  info: (scope: string, message: string, meta?: Record<string, unknown>) => {
    console.log(`${ts()} [${scope}] ${message}${fmt(meta)}`);
  },
  warn: (scope: string, message: string, meta?: Record<string, unknown>) => {
    console.warn(`${ts()} [${scope}] ⚠ ${message}${fmt(meta)}`);
  },
  error: (scope: string, message: string, meta?: Record<string, unknown>) => {
    console.error(`${ts()} [${scope}] ✗ ${message}${fmt(meta)}`);
  },
};

function fmt(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return '';
  const parts = Object.entries(meta).map(([k, v]) => `${k}=${v}`);
  return `  (${parts.join(', ')})`;
}

/** Short, readable id for logs (first 8 chars of a UUID). */
export function shortId(id: string): string {
  return id.slice(0, 8);
}
