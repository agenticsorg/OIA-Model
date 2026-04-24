import type { IncomingMessage, ServerResponse } from 'node:http';
import { getDb, insertFeedback, listFeedbackPublic, countFeedback, type FeedbackRow } from './db';
import { detectPii } from './pii-heuristic';
import { checkRateLimit, hashIp } from './rate-limit';
import { canSpend, getUsage, recordUsage } from './spend-tracker';
import { streamChat, getModel, PROMPT_VERSION, type ChatMessage } from './chat-client';

/**
 * Handles /api/* routes. Returns true if the request was handled so
 * the Vite middleware chain can stop; false to fall through to the
 * SPA.
 */
/* CORS — allow the static SPA (GitHub Pages on oia.agentics.org or the
   bare agenticsorg.github.io) and local dev to call the API. */
const ALLOWED_ORIGINS = new Set([
  'https://oia.agentics.org',
  'https://agenticsorg.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function applyCors(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin as string | undefined;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

export async function handleApi(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url ?? '';
  const method = req.method ?? 'GET';

  applyCors(req, res);
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  if (method === 'POST' && url === '/feedback') {
    const body = await readJson(req);
    const row = normaliseFeedback(body);
    const id = insertFeedback(row);
    const findings = detectPii(row);
    if (findings.length > 0) {
      send(res, 200, {
        ok: true,
        id,
        advisory: 'possible PII detected in body fields — review stored submission',
        findings,
      });
    } else {
      send(res, 200, { ok: true, id });
    }
    return true;
  }

  if (method === 'GET' && url === '/feedback') {
    send(res, 200, { count: countFeedback(), items: listFeedbackPublic() });
    return true;
  }

  if (method === 'GET' && url === '/feedback/health') {
    send(res, 200, { ok: true, count: countFeedback() });
    return true;
  }

  /* ADR-0003 — chat endpoints. */
  if (method === 'GET' && url === '/chat/usage') {
    send(res, 200, getUsage());
    return true;
  }

  if (method === 'POST' && url === '/chat') {
    await handleChat(req, res);
    return true;
  }

  return false;
}

/* ------------------------------------------------------------------ *
 * /api/chat — ADR-0003 §5. Streams SSE deltas, relays validated
 * citations in a final envelope.
 * ------------------------------------------------------------------ */

const INJECTION_PATTERNS = [/ignore\s+previous\s+instructions/i, /you\s+are\s+now\s+DAN/i];
const MAX_USER_TURN_CHARS = 4096;
const MAX_TURNS_PER_THREAD = 40; // ADR-0003 §6
const FEEDBACK_ROW_LIMIT = parseInt(process.env.OIA_CHAT_FEEDBACK_LIMIT || '300', 10);

interface ChatRequestBody {
  messages?: Array<{ role?: string; content?: string }>;
}

async function handleChat(req: IncomingMessage, res: ServerResponse): Promise<void> {
  /* Kill switch (ADR-0003 §6). */
  if (process.env.OIA_CHAT_ENABLED === 'false') {
    send(res, 410, { ok: false, error: 'chat endpoint disabled (OIA_CHAT_ENABLED=false)' });
    return;
  }

  const ipRaw = extractIp(req);
  const ipHash = hashIp(ipRaw);

  /* Rate limit (§6). */
  const rl = checkRateLimit(ipRaw);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfterSec ?? 60));
    send(res, 429, {
      ok: false,
      error: 'rate limit exceeded — try again shortly',
      retryAfterSec: rl.retryAfterSec,
    });
    return;
  }

  /* Spend cap (§6, §7). */
  if (!canSpend()) {
    send(res, 503, {
      ok: false,
      error: 'daily usage cap reached — try again after UTC midnight',
      usage: getUsage(),
    });
    return;
  }

  /* Body parse + validation. */
  let body: ChatRequestBody;
  try {
    body = (await readJson(req)) as ChatRequestBody;
  } catch {
    send(res, 400, { ok: false, error: 'invalid JSON body' });
    return;
  }
  const messagesRaw = Array.isArray(body.messages) ? body.messages : [];

  /* Per-conversation cap (§6). */
  if (messagesRaw.length > MAX_TURNS_PER_THREAD) {
    send(res, 413, {
      ok: false,
      error: `conversation exceeds ${MAX_TURNS_PER_THREAD}-turn cap — start a new thread`,
    });
    return;
  }
  if (messagesRaw.length === 0) {
    send(res, 400, { ok: false, error: 'messages array is required and non-empty' });
    return;
  }

  /* Normalise + prompt-injection filter (§6). */
  const messages: ChatMessage[] = [];
  for (const m of messagesRaw) {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    const content = typeof m.content === 'string' ? m.content : '';
    if (role === 'user') {
      if (content.length > MAX_USER_TURN_CHARS) {
        send(res, 400, {
          ok: false,
          error: `user turn exceeds ${MAX_USER_TURN_CHARS}-char cap`,
        });
        return;
      }
      for (const pat of INJECTION_PATTERNS) {
        if (pat.test(content)) {
          send(res, 400, {
            ok: false,
            error:
              'I cannot answer that from the attached materials. (Prompt-injection pattern refused.)',
          });
          return;
        }
      }
    }
    messages.push({ role, content });
  }

  /* Build feedback slice (ADR-0003 §3.3). */
  let feedbackSlice = '';
  try {
    feedbackSlice = buildFeedbackSlice(FEEDBACK_ROW_LIMIT);
  } catch (e) {
    process.stderr.write(`chat: feedback-slice build failed: ${(e as Error).message}\n`);
  }

  /* API-key guard before we start streaming headers. */
  if (!process.env.ANTHROPIC_API_KEY) {
    send(res, 500, {
      ok: false,
      error:
        'ANTHROPIC_API_KEY is not configured — chat endpoint cannot reach the Messages API',
    });
    return;
  }

  /* SSE headers + stream loop. */
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof (res as { flushHeaders?: () => void }).flushHeaders === 'function') {
    (res as { flushHeaders: () => void }).flushHeaders();
  }

  const turnId = `turn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();

  const writeFrame = (payload: unknown) => {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      /* client disconnected; swallow */
    }
  };

  try {
    const result = await streamChat(messages, feedbackSlice, (delta) => {
      writeFrame({ type: 'delta', text: delta });
    });

    recordUsage(result.model, result.usage);

    writeFrame({
      type: 'final',
      turn_id: turnId,
      answer: result.answer,
      citations: result.citations,
      model: result.model,
      prompt_version: PROMPT_VERSION,
    });

    const latencyMs = Date.now() - startedAt;
    process.stderr.write(
      `chat ok turn=${turnId} ip=${ipHash} model=${result.model} ` +
        `in=${result.usage.input_tokens} out=${result.usage.output_tokens} ` +
        `cache_r=${result.usage.cache_read_input_tokens} cache_w=${result.usage.cache_creation_input_tokens} ` +
        `cites=${result.citations.length} lat=${latencyMs}ms\n`,
    );
  } catch (e) {
    const msg = (e as Error).message || 'chat stream failed';
    writeFrame({ type: 'error', error: msg });
    process.stderr.write(
      `chat err turn=${turnId} ip=${ipHash} model=${getModel()} msg=${msg}\n`,
    );
  } finally {
    try {
      res.end();
    } catch {
      /* already ended */
    }
  }
}

function extractIp(req: IncomingMessage): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress || '';
}

/* ADR-0003 §3.3 — SQL excluding rows 1..3 (grandfathered per ADR-0004). */
const FEEDBACK_SELECT_SQL = `
  SELECT id, created_at, role,
         hyperscaler_monopolies, layer8_certification, legacy_vendor_mapping,
         foundation_funding, regulatory_alignment,
         shape_response, reopen_decisions, reopen_reasons,
         open_questions_contrib, additional_deferrals, prematurely_deferred,
         missing_concerns, missing_tech, missing_spans,
         vertical_extension, improvements, general_feedback
    FROM feedback
   WHERE share_body = 1
     AND id NOT IN (1, 2, 3)
   ORDER BY id DESC
   LIMIT ?`;

const FEEDBACK_BODY_FIELDS: readonly string[] = [
  'hyperscaler_monopolies',
  'layer8_certification',
  'legacy_vendor_mapping',
  'foundation_funding',
  'regulatory_alignment',
  'shape_response',
  'reopen_decisions',
  'reopen_reasons',
  'open_questions_contrib',
  'additional_deferrals',
  'prematurely_deferred',
  'missing_concerns',
  'missing_tech',
  'missing_spans',
  'vertical_extension',
  'improvements',
  'general_feedback',
];

function buildFeedbackSlice(limit: number): string {
  const rows = getDb()
    .prepare(FEEDBACK_SELECT_SQL)
    .all(Math.max(1, limit)) as Record<string, unknown>[];
  if (rows.length === 0) return '';
  const chunks: string[] = [];
  for (const r of rows) {
    const id = r.id;
    const role = typeof r.role === 'string' && r.role.length > 0 ? r.role : 'Anonymous';
    const createdAt = typeof r.created_at === 'string' ? r.created_at : '';
    const lines: string[] = [`FEEDBACK #${id} — Role: ${role}${createdAt ? ` — ${createdAt}` : ''}`];
    for (const field of FEEDBACK_BODY_FIELDS) {
      const v = r[field];
      if (typeof v === 'string' && v.trim().length > 0) {
        lines.push(`  ${field}: ${v.trim()}`);
      }
    }
    chunks.push(lines.join('\n'));
  }
  return chunks.join('\n\n');
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf-8');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function s(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length === 0 ? null : t.slice(0, 20_000);
}

function normaliseFeedback(body: Record<string, unknown>): FeedbackRow {
  return {
    share_name: body.share_name === true || body.share_name === 1 ? 1 : 0,
    share_body: body.share_body === true || body.share_body === 1 ? 1 : 0,
    name: s(body.name),
    email: s(body.email),
    organization: s(body.organization),
    role: s(body.role),
    hyperscaler_monopolies: s(body.hyperscaler_monopolies),
    layer8_certification: s(body.layer8_certification),
    legacy_vendor_mapping: s(body.legacy_vendor_mapping),
    foundation_funding: s(body.foundation_funding),
    regulatory_alignment: s(body.regulatory_alignment),
    shape_response: s(body.shape_response),
    reopen_decisions: s(body.reopen_decisions),
    reopen_reasons: s(body.reopen_reasons),
    open_questions_contrib: s(body.open_questions_contrib),
    additional_deferrals: s(body.additional_deferrals),
    prematurely_deferred: s(body.prematurely_deferred),
    missing_concerns: s(body.missing_concerns),
    missing_tech: s(body.missing_tech),
    missing_spans: s(body.missing_spans),
    vertical_extension: s(body.vertical_extension),
    improvements: s(body.improvements),
    general_feedback: s(body.general_feedback),
  };
}
