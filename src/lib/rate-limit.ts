import { LRUCache } from 'lru-cache';

export interface RateLimitOptions {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

export interface RateLimiter {
  check: (limit: number, token: string) => Promise<void>;
}

export function rateLimit(options: RateLimitOptions = {}): RateLimiter {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;

      if (isRateLimited) {
        return Promise.reject(new Error('Rate limit exceeded'));
      }

      return Promise.resolve();
    },
  };
}
