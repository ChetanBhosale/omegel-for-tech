import type { OAuthProvider } from '../types';
import { githubProvider } from './github';

const providers: Record<string, OAuthProvider> = {
  github: githubProvider,
};

export function getProvider(slug: string): OAuthProvider | null {
  return providers[slug] ?? null;
}

export function isSupportedProvider(slug: string): boolean {
  return slug in providers;
}
