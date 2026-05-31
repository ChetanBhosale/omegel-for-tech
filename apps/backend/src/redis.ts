import { Redis } from '@upstash/redis';
import Secrets from '@repo/secrets/backend';

/**
 * Upstash Redis (REST) client. Used for shared matching state — the waiting
 * queue and online presence — so it survives restarts and is consistent
 * across instances.
 *
 * NOTE: Upstash REST does not support pub/sub, and live WebSocket sockets can
 * never be stored in Redis (they're per-process TCP connections). Cross-
 * instance signal relay would require a pub/sub channel; this module keeps the
 * shared data layer ready for that future step.
 */
if (!Secrets.UPSTASH_REDIS_REST_URL || !Secrets.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set.'
  );
}

export const redis = new Redis({
  url: Secrets.UPSTASH_REDIS_REST_URL,
  token: Secrets.UPSTASH_REDIS_REST_TOKEN,
});

// Redis key namespace.
export const KEYS = {
  /** Sorted set of waiting member ids (score = enqueue timestamp = FIFO). */
  queue: 'match:queue',
  /** Set of all online member ids. */
  online: 'match:online',
} as const;
