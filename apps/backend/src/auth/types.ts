// Re-export the shared Zod-derived types so the whole backend imports auth
// types from one place. The single source of truth lives in @repo/types.
export type {
  NormalizedProfile,
  JwtPayload,
  AuthProvider,
} from '@repo/types';

import type { AuthProvider, NormalizedProfile } from '@repo/types';

/**
 * Contract every OAuth provider must implement. This is the abstraction that
 * makes the system scalable across GitHub, Google, etc.
 */
export interface OAuthProvider {
  readonly name: AuthProvider;
  /** Build the provider's authorize URL the user is redirected to. */
  getAuthorizationUrl(state: string): string;
  /** Exchange the OAuth `code` for a normalized user profile. */
  handleCallback(code: string): Promise<NormalizedProfile>;
}
