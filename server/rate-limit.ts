/**
 * rate-limit.ts — per-IP sliding-window rate limiter for /api/chat
 * (ADR-0003 §6). Also exports hashIp() for log redaction.
 *
 * Default limit: 20 messages per 10 minutes per IP.
 * Tunable via env var OIA_CHAT_RATE_LIMIT_PER_10MIN.
 *
 * Implementation: in-process Map keyed by IP (or X-Forwarded-For's first
 * hop), storing an array of request timestamps. On each call, entries
 * older than the window are pruned. Acceptable at Cloud Run
 * max-instances=1 as documented in ADR-0003 §6.
 */

import { createHash } from 'node:crypto';

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function parseLimit(): number {
  const raw = process.env.OIA_CHAT_RATE_LIMIT_PER_10MIN;
  if (!raw) return 20;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

const LIMIT = parseLimit();

/** ip -> list of epoch-ms timestamps within the current window. */
const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const key = ip || 'unknown';
  const arr = buckets.get(key) ?? [];
  const kept: number[] = [];
  for (const t of arr) {
    if (now - t < WINDOW_MS) kept.push(t);
  }

  if (kept.length >= LIMIT) {
    const oldest = kept[0];
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    buckets.set(key, kept);
    return { allowed: false, retryAfterSec };
  }

  kept.push(now);
  buckets.set(key, kept);
  return { allowed: true };
}

/**
 * 12-char sha256 prefix of an IP. For log lines — never log raw IPs.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip || 'unknown').digest('hex').slice(0, 12);
}

/** Test-only: reset internal state. */
export function _resetRateLimitForTests(): void {
  buckets.clear();
}
