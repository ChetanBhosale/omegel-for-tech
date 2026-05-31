import type { OAuthProvider } from '../types';
import { githubProvider } from './github';

/**
 * Registry of all supported OAuth providers, keyed by their URL slug.
 * To add Google later: implement a `googleProvider` and register it here as
 * `google: googleProvider`. No other code needs to change.
 */
const providers: Record<string, OAuthProvider> = {
  github: githubProvider,
};

export function getProvider(slug: string): OAuthProvider | null {
  return providers[slug] ?? null;
}

export function isSupportedProvider(slug: string): boolean {
  return slug in providers;
}
