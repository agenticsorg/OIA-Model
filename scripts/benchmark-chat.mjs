#!/usr/bin/env node
/**
 * Benchmark three representative questions against a running /api/chat.
 *
 *   BENCHMARK_API_BASE=http://localhost:5173 node scripts/benchmark-chat.mjs
 *
 * Prints per-turn latency, input/output/cached/write token counts, citation
 * count, and an estimated USD cost based on the Haiku 4.5 pricing in
 * ADR-0003 §7. Skips gracefully if the server returns 410 (kill switch on)
 * or 5xx with a clear message.
 *
 * The expected server payload shape (see ADR-0003 §4 and §5):
 *   POST /api/chat  →  text/event-stream with the following events:
 *     event: delta  data: {"text": "…"}
 *     event: final  data: {"answer": "…", "citations": [...], "turn_id": "…",
 *                          "usage": {"input_tokens": N, "output_tokens": N,
 *                                    "cache_read_input_tokens": N,
 *                                    "cache_creation_input_tokens": N}}
 *
 * The benchmark relies on the server echoing the `usage` block on the final
 * frame. If it's missing the cost estimate reads `n/a` but the latency and
 * citation metrics still print.
 */

const BASE = (process.env.BENCHMARK_API_BASE ?? 'http://localhost:5173').replace(/\/$/, '');
const ENDPOINT = `${BASE}/api/chat`;

const QUESTIONS = [
  'What does the digest say about Layer 8 governance?',
  'Which decisions address provider vertical extension into Layers 6, 7, or 8?',
  'Has anyone in the feedback pushed back on the shape of the nine layers?',
];

// Haiku 4.5 pricing per million tokens (ADR-0003 §7).
const PRICE_PER_MTOK = {
  input: 1.0,
  output: 5.0,
  cache_read: 0.1,
  cache_write: 1.25,
};

function fmtMs(ms) {
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function fmtUsd(usd) {
  if (!Number.isFinite(usd)) return 'n/a';
  return `$${usd.toFixed(5)}`;
}

function estimateCostUsd(usage) {
  if (!usage) return NaN;
  const input = Number(usage.input_tokens ?? 0);
  const output = Number(usage.output_tokens ?? 0);
  const cacheRead = Number(usage.cache_read_input_tokens ?? 0);
  const cacheWrite = Number(usage.cache_creation_input_tokens ?? 0);
  return (
    (input / 1_000_000) * PRICE_PER_MTOK.input +
    (output / 1_000_000) * PRICE_PER_MTOK.output +
    (cacheRead / 1_000_000) * PRICE_PER_MTOK.cache_read +
    (cacheWrite / 1_000_000) * PRICE_PER_MTOK.cache_write
  );
}

async function runOne(question, index) {
  const messages = [{ role: 'user', content: question }];
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    console.log(`\n[${index}] ${question}`);
    console.log(`  status: fetch failed — ${err.message}`);
    return { ok: false };
  }

  if (response.status === 410) {
    clearTimeout(timeout);
    console.log(`\n[${index}] ${question}`);
    console.log('  status: 410 Gone — chat surface disabled (OIA_CHAT_ENABLED=false). Skipping.');
    return { ok: false, skipped: true };
  }
  if (!response.ok) {
    clearTimeout(timeout);
    const body = await response.text().catch(() => '');
    console.log(`\n[${index}] ${question}`);
    console.log(`  status: HTTP ${response.status} — ${body.slice(0, 140) || 'no body'}. Skipping.`);
    return { ok: false, skipped: response.status >= 500 };
  }

  if (!response.body) {
    clearTimeout(timeout);
    console.log(`\n[${index}] ${question}`);
    console.log('  status: empty body. Skipping.');
    return { ok: false };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let firstByteMs = null;
  let answerLen = 0;
  let finalPayload = null;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (firstByteMs === null) firstByteMs = Date.now() - started;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const evt = parseFrame(raw);
        if (!evt) continue;
        if (evt.event === 'delta' && typeof evt.data?.text === 'string') {
          answerLen += evt.data.text.length;
        }
        if (evt.event === 'final') {
          finalPayload = evt.data;
        }
      }
    }
  } finally {
    clearTimeout(timeout);
    try { reader.releaseLock(); } catch { /* ignore */ }
  }

  const totalMs = Date.now() - started;
  const usage = finalPayload?.usage ?? null;
  const citations = Array.isArray(finalPayload?.citations) ? finalPayload.citations : [];
  const cost = estimateCostUsd(usage);

  console.log(`\n[${index}] ${question}`);
  console.log(`  latency:          ${fmtMs(totalMs)}  (first byte ${fmtMs(firstByteMs ?? totalMs)})`);
  console.log(`  answer length:    ${answerLen} chars   (final prose: ${String(finalPayload?.answer ?? '').length})`);
  console.log(`  citations:        ${citations.length}   ${citations.map((c) => c.id).join(', ') || '—'}`);
  if (usage) {
    console.log(`  input tokens:     ${usage.input_tokens ?? 0}`);
    console.log(`  output tokens:    ${usage.output_tokens ?? 0}`);
    console.log(`  cache read:       ${usage.cache_read_input_tokens ?? 0}`);
    console.log(`  cache write:      ${usage.cache_creation_input_tokens ?? 0}`);
    console.log(`  estimated cost:   ${fmtUsd(cost)}`);
  } else {
    console.log('  usage block:      not reported by server');
  }

  return { ok: true, totalMs, cost };
}

function parseFrame(raw) {
  let event = 'message';
  const dataLines = [];
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  try {
    return { event, data: JSON.parse(dataLines.join('\n')) };
  } catch {
    return { event, data: null };
  }
}

async function main() {
  console.log(`OIA chat benchmark — POST ${ENDPOINT}`);
  console.log(`Questions: ${QUESTIONS.length}`);

  const results = [];
  for (let i = 0; i < QUESTIONS.length; i++) {
    const r = await runOne(QUESTIONS[i], i + 1);
    results.push(r);
    if (r.skipped) break;
  }

  const ok = results.filter((r) => r.ok);
  if (ok.length === 0) {
    console.log('\nNo successful turns. Exiting.');
    process.exit(1);
  }

  const totalCost = ok.reduce((a, r) => a + (Number.isFinite(r.cost) ? r.cost : 0), 0);
  const meanMs = ok.reduce((a, r) => a + r.totalMs, 0) / ok.length;
  console.log('\n— summary —');
  console.log(`  successful turns: ${ok.length}/${QUESTIONS.length}`);
  console.log(`  mean latency:     ${fmtMs(meanMs)}`);
  console.log(`  total cost est:   ${fmtUsd(totalCost)}`);
}

main().catch((err) => {
  console.error(`Benchmark failed: ${err?.message ?? err}`);
  process.exit(1);
});
