/**
 * spend-tracker.ts — daily USD spend cap for /api/chat (ADR-0003 §6, §7).
 *
 * Tracks cumulative estimated spend per UTC date in the `chat_usage`
 * SQLite table (one row per UTC date). Spend is stored as integer
 * micro-dollars to avoid float drift across thousands of tiny increments.
 *
 * Per-model pricing comes from ADR-0003 §7 (Haiku 4.5 $1/$5 per MTok;
 * $1.25 cache-write, $0.10 cache-read). Unknown models fall back to
 * Haiku rates with a stderr warning — pricing is not a correctness
 * surface, but we don't want to silently bill $0 for a Sonnet call.
 *
 * Cap: `OIA_CHAT_DAILY_SPEND_USD` (default $5.00). A leading "$" is
 * tolerated so operators can set `OIA_CHAT_DAILY_SPEND_USD=$10` without
 * the cap coming back NaN.
 */

import { getDb } from './db';

export interface UsageDelta {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

export interface UsageSummary {
  dateUtc: string;
  spentUsd: number;
  capUsd: number;
  percent: number;
}

/** Per-model pricing in USD per million tokens. */
interface PricingRow {
  input: number;
  output: number;
  cacheWrite: number;
  cacheRead: number;
}

const PRICING: Record<string, PricingRow> = {
  // Claude Haiku 4.5 — ADR-0003 §7 published rates
  'claude-haiku-4-5': { input: 1.0, output: 5.0, cacheWrite: 1.25, cacheRead: 0.1 },
  'claude-haiku-4-5-20251001': {
    input: 1.0,
    output: 5.0,
    cacheWrite: 1.25,
    cacheRead: 0.1,
  },
  // Claude Sonnet 4.6 — standard rates
  'claude-sonnet-4-6': { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.3 },
  // Claude Opus 4.7
  'claude-opus-4-7': { input: 5.0, output: 25.0, cacheWrite: 6.25, cacheRead: 0.5 },
};

function pricingFor(model: string): PricingRow {
  const hit = PRICING[model];
  if (hit) return hit;
  process.stderr.write(
    `spend-tracker: WARN unknown model "${model}" — falling back to Haiku 4.5 pricing\n`,
  );
  return PRICING['claude-haiku-4-5'];
}

function parseCapUsd(): number {
  const raw = process.env.OIA_CHAT_DAILY_SPEND_USD;
  if (!raw) return 5.0;
  const stripped = raw.trim().replace(/^\$/, '');
  const n = Number.parseFloat(stripped);
  return Number.isFinite(n) && n >= 0 ? n : 5.0;
}

export function dateUtc(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Compute the USD cost of a single Messages API turn from its usage
 * counts. Returns a non-negative USD amount.
 */
export function costOf(model: string, usage: UsageDelta): number {
  const p = pricingFor(model);
  const inputTok = usage.input_tokens ?? 0;
  const outputTok = usage.output_tokens ?? 0;
  const cacheReadTok = usage.cache_read_input_tokens ?? 0;
  const cacheWriteTok = usage.cache_creation_input_tokens ?? 0;
  return (
    (inputTok * p.input) / 1_000_000 +
    (outputTok * p.output) / 1_000_000 +
    (cacheReadTok * p.cacheRead) / 1_000_000 +
    (cacheWriteTok * p.cacheWrite) / 1_000_000
  );
}

/**
 * Attribute usage to today's row. Creates the row if it does not exist.
 */
export function recordUsage(model: string, usage: UsageDelta): void {
  const today = dateUtc();
  const usd = costOf(model, usage);
  const microusd = Math.round(usd * 1_000_000);
  const db = getDb();
  db.prepare(
    `INSERT INTO chat_usage (date_utc, spent_microusd, turn_count)
     VALUES (@date, @microusd, 1)
     ON CONFLICT(date_utc) DO UPDATE SET
       spent_microusd = spent_microusd + @microusd,
       turn_count = turn_count + 1`,
  ).run({ date: today, microusd });
}

/**
 * Look up today's spend summary. Non-destructive — if no row exists,
 * returns {spentUsd: 0, ...}.
 */
export function getUsage(): UsageSummary {
  const today = dateUtc();
  const capUsd = parseCapUsd();
  const row = getDb()
    .prepare('SELECT spent_microusd FROM chat_usage WHERE date_utc = ?')
    .get(today) as { spent_microusd?: number } | undefined;
  const microusd = row?.spent_microusd ?? 0;
  const spentUsd = microusd / 1_000_000;
  const percent = capUsd > 0 ? Math.round((spentUsd / capUsd) * 1000) / 10 : 0;
  return { dateUtc: today, spentUsd, capUsd, percent };
}

/** Gate for the /chat entrypoint. */
export function canSpend(): boolean {
  const { percent } = getUsage();
  return percent < 100;
}
