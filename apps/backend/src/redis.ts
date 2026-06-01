import { Redis } from '@upstash/redis';
import Secrets from '@repo/secrets/backend';

if (!Secrets.UPSTASH_REDIS_REST_URL || !Secrets.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set.'
  );
}

export const redis = new Redis({
  url: Secrets.UPSTASH_REDIS_REST_URL,
  token: Secrets.UPSTASH_REDIS_REST_TOKEN,
});

export const KEYS = {
  queue: 'match:queue',
  online: 'match:online',
} as const;
