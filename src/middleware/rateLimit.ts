import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;  // Maximum number of requests
  windowMs: number;     // Time window in milliseconds
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const ratelimits = new Map<string, RateLimitInfo>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of ratelimits.entries()) {
    if (info.resetTime <= now) {
      ratelimits.delete(key);
    }
  }
}, 60000); // Clean up every minute

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,    // 100 requests
  windowMs: 60 * 1000, // per minute
};

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = defaultConfig
) {
  const ip = req.ip || 'anonymous';
  const key = `rate-limit:${ip}`;
  const now = Date.now();

  // Get existing rate limit info
  let rateLimitInfo = ratelimits.get(key);

  // If no existing info or window has expired, create new entry
  if (!rateLimitInfo || rateLimitInfo.resetTime <= now) {
    rateLimitInfo = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Increment request count
  rateLimitInfo.count++;
  ratelimits.set(key, rateLimitInfo);

  const remaining = Math.max(0, config.maxRequests - rateLimitInfo.count);
    
  // Set rate limit headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());

  // If over limit, return 429 Too Many Requests
  if (rateLimitInfo.count > config.maxRequests) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers,
    });
  }

  // Otherwise, attach headers to request for downstream use
  req.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  req.headers.set('X-RateLimit-Remaining', remaining.toString());
  req.headers.set('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());

  return null; // Continue to next middleware/route handler
}
