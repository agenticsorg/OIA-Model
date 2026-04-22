import type { IncomingMessage, ServerResponse } from 'node:http';
import { insertFeedback, listFeedbackPublic, countFeedback, type FeedbackRow } from './db';

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
    send(res, 200, { ok: true, id });
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

  return false;
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
