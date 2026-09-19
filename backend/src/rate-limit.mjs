import { AppError } from './errors.mjs';

export function createLoginRateLimiter({ limit = 5, windowMs = 60_000 } = {}) {
  const attempts = new Map();
  return {
    check(key) { const now = Date.now(); const item = attempts.get(key); if (!item || item.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + windowMs }); return; } item.count += 1; if (item.count > limit) throw new AppError(429, 'RATE_LIMITED', 'Too many login attempts. Try again later.'); },
    clear(key) { attempts.delete(key); },
  };
}
