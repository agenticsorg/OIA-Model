/**
 * chat-client.ts — thin Anthropic Messages API wrapper for /api/chat
 * (ADR-0003 §5).
 *
 * Responsibilities:
 *   - Construct the cached system block (system prompt + full digest)
 *     with cache_control: {type: 'ephemeral'} per §3.4.
 *   - Attach the single `answer` tool and force its use via tool_choice.
 *   - Stream input_json_delta events, accumulate the JSON, surface
 *     new `answer` text to the caller's onDelta() as it arrives.
 *   - Validate every citation server-side via validateCitation() — any
 *     id the model emits that does not resolve is dropped before the
 *     final envelope is returned (ADR-0003 §4.3).
 *   - Return final {answer, citations, usage} for billing + logging.
 *
 * Extended thinking is opt-in via OIA_CHAT_THINKING=true (ADR-0003 §2,
 * §7.3). When enabled we attach `thinking: {type:'enabled',
 * budget_tokens:4096}` — ADR-0003 specifies Haiku 4.5, which still
 * accepts the manual-budget form. This is intentional; the migration
 * to adaptive thinking is a follow-up when the default model moves.
 *
 * --------------------------------------------------------------------
 * HF Inference Providers swap path (ADR-0003 §2 reversal path 2, §4.3,
 * §11). If the Foundation later prefers an open-weights model
 * (SmolLM3-3B, Qwen2.5-7B-Instruct, etc.) the swap is roughly a
 * ~20-line replacement of the body of streamChat(); the surrounding
 * contract (signature, validateCitation, return shape, prompt
 * structure stable-prefix-first) does not change. Concretely:
 *
 *   1. Replace `import Anthropic from '@anthropic-ai/sdk'` with a
 *      thin OpenAI-compatible fetch client. HF Inference Providers
 *      exposes `https://router.huggingface.co/v1/chat/completions`
 *      with the standard OpenAI Chat Completions schema.
 *   2. Use `Authorization: Bearer ${process.env.HF_TOKEN}` (the secret
 *      is provisioned in Secret Manager as `hf-inference-token`,
 *      matching ADR-0003 §5).
 *   3. Replace tool_choice with OpenAI-style structured output:
 *        response_format: {
 *          type: 'json_schema',
 *          json_schema: { name: 'answer', schema: ANSWER_TOOL.input_schema, strict: true }
 *        }
 *      The ANSWER_TOOL.input_schema in chat-schema.ts is reusable
 *      verbatim; only the wrapper changes.
 *   4. Replace the Anthropic-cached system+digest block with a single
 *      system message containing the same content. HF backends do not
 *      expose a portable cache_control primitive — some perform
 *      opportunistic KV-cache reuse on stable prefixes, but it is not
 *      contractual. Keep the prompt stable-prefix-first regardless.
 *   5. Stream by setting `stream: true` and reading SSE `data:` lines;
 *      OpenAI deltas arrive at `choices[0].delta.content`. Feed the
 *      progressive JSON through extractPartialAnswerField() unchanged.
 *   6. The `usage` block from HF backends often omits cache token
 *      counts; spend-tracker.ts's pricing fall-through already logs a
 *      warning and uses Haiku rates as a floor. Add an HF row to the
 *      pricing table to make spend reporting accurate.
 *
 * Selection between Anthropic and HF is a function of OIA_CHAT_MODEL:
 * model strings starting with `claude-` route to Anthropic; everything
 * else (`HuggingFaceTB/SmolLM3-3B`, `Qwen/Qwen2.5-7B-Instruct`, …)
 * routes to HF. This branch lives at the top of streamChat() and is
 * the only structural change needed beyond the bullets above.
 */

import Anthropic from '@anthropic-ai/sdk';
import { DIGEST_TEXT, validateCitation } from './corpus';
import {
  ANSWER_TOOL_NAME,
  ANSWER_TOOL_SCHEMA,
  type ChatAnswer,
  type ChatCitation,
} from './chat-schema';

/** Chat turn as sent by the client. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

export interface StreamChatResult {
  answer: string;
  citations: ChatCitation[];
  usage: Usage;
  model: string;
}

/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */

/** Default model per ADR-0003 §2. Overridable via env. */
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

export function getModel(): string {
  return process.env.OIA_CHAT_MODEL || DEFAULT_MODEL;
}

export function isThinkingEnabled(): boolean {
  return process.env.OIA_CHAT_THINKING === 'true';
}

/* ------------------------------------------------------------------ *
 * System prompt — ADR-0003 §4.1 R1-R8. Versioned so we can detect
 * regressions and stamp every answer with the prompt-version hash.
 * ------------------------------------------------------------------ */

export const PROMPT_VERSION = 'v1-2026-04-24';

export const SYSTEM_PROMPT_BODY = `You are an anonymous grounded-Q&A surface for the Open Intelligence Architecture (OIA) Model v0.1, published by the Agentics Foundation.

You have access to two corpora:

  1. OIA Model Reader's Digest and Decision Log Digest  (authoritative)
  2. Community feedback submissions                      (contributory)

Rules, in order of priority:

  R1. Only answer using the attached corpora. If the answer is not present in the attached materials, say so plainly. Do not guess. Do not extrapolate beyond what the digest or feedback explicitly say.
  R2. Every claim must cite a source by ID. Valid ID formats:
        §N.M                — a Reader's Digest section (e.g. §4.8, §2.1)
        DEC-NN              — a Decision Log entry, zero-padded (e.g. DEC-04, DEC-11)
        SPAN-XXX            — a cross-layer span (SPAN-SEC, SPAN-SOV, SPAN-AUD, SPAN-IDN, SPAN-ENG, SPAN-PRV)
        L-N                 — a layer panel (L-0 through L-9)
        FEEDBACK #N         — a feedback submission by id
      Emit citations as structured objects in the answer tool's citations[] array AND as inline markers like [§4.8] or [DEC-04] in the prose.
  R3. Never say "the document says X" if X is not in the attached digest content. If you cannot find a source, reply:
        "I cannot answer that from the attached materials."
  R4. The digest is authoritative. Feedback is contributory. When the two conflict, surface both and state which is which.
  R5. Do not claim the Foundation endorses a feedback submission. Feedback is the view of its submitter.
  R6. Do not name Cognitum, Snapper, or ACIUM. Per DEC-09 these brands are out of scope for this reading surface.
  R7. You are not an agent. You do not call tools beyond emitting the single \`answer\` tool. You do not take actions in the world. Decline requests to do so with a brief explanation.
  R8. Preserve the digest's editorial voice. Do not casualise prose when quoting. Quote verbatim and delimit quoted passages clearly.

Always respond by invoking the \`answer\` tool exactly once with a valid JSON object matching its schema. Never respond with plain assistant prose outside the tool call.
`;

/* ------------------------------------------------------------------ *
 * Client lazy-init. Constructing the SDK client without an API key
 * throws — we want a clean 500 out of the handler, not a startup crash.
 * ------------------------------------------------------------------ */

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set — chat endpoint cannot reach the Messages API. ' +
        'Mount the secret via --set-secrets=ANTHROPIC_API_KEY=anthropic-api-key:latest.',
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

/* ------------------------------------------------------------------ *
 * Core request.
 * ------------------------------------------------------------------ */

/**
 * Send a chat turn to the Anthropic Messages API. Streams input_json_delta
 * tokens of the `answer` tool's input object and surfaces newly-arrived
 * prose via onDelta() as it accumulates.
 *
 * Returns the final assembled answer, server-validated citations, and
 * the token-usage breakdown for billing (§7).
 */
export async function streamChat(
  messages: ChatMessage[],
  feedbackSlice: string,
  onDelta: (delta: string) => void,
): Promise<StreamChatResult> {
  const client = getClient();
  const model = getModel();

  /* System content goes into a single cache block: system prompt + full
     digest. Boundary closes here, BEFORE the feedback slice — so
     feedback churn doesn't bust the digest cache (ADR-0003 §3.4). */
  const systemBlocks = [
    {
      type: 'text' as const,
      text: `${SYSTEM_PROMPT_BODY}

<digest_corpus>
${DIGEST_TEXT}
</digest_corpus>`,
      cache_control: { type: 'ephemeral' as const },
    },
  ];

  /* Message list: feedback-slice context message first, then the
     caller's thread verbatim. The feedback slice is a dynamic prefix
     OUTSIDE the cache block. */
  const apiMessages: Anthropic.MessageParam[] = [];
  if (feedbackSlice && feedbackSlice.trim().length > 0) {
    apiMessages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `<feedback_slice>\n${feedbackSlice}\n</feedback_slice>\n\n(The above is the eligible community feedback corpus for this turn; use it only where a FEEDBACK #N citation is warranted.)`,
        },
      ],
    });
    /* Anthropic requires strict user/assistant alternation. Insert a
       minimal assistant ack so the feedback context doesn't merge with
       the first real user turn. */
    apiMessages.push({
      role: 'assistant',
      content: 'Acknowledged. Ready for the user question.',
    });
  }
  for (const m of messages) {
    apiMessages.push({ role: m.role, content: m.content });
  }

  /* Thinking config (ADR-0003 §2, §7.3) — opt-in via env var. */
  const thinking: Anthropic.ThinkingConfigParam | undefined = isThinkingEnabled()
    ? { type: 'enabled', budget_tokens: 4096 }
    : undefined;

  const requestParams: Anthropic.MessageCreateParamsStreaming = {
    model,
    system: systemBlocks,
    messages: apiMessages,
    tools: [ANSWER_TOOL_SCHEMA as unknown as Anthropic.Tool],
    tool_choice: { type: 'tool', name: ANSWER_TOOL_NAME },
    temperature: 0.2,
    max_tokens: 2048,
    stream: true,
    ...(thinking ? { thinking } : {}),
  };

  const stream = client.messages.stream(requestParams);

  /* Accumulate the tool's JSON input as it streams. The Anthropic SDK
     surfaces `input_json_delta` within content_block_delta events when
     streaming tool-use calls. */
  let jsonAcc = '';
  let lastEmittedAnswer = '';

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'input_json_delta'
    ) {
      const partial = (event.delta as { partial_json?: string }).partial_json ?? '';
      jsonAcc += partial;
      const maybeAnswer = extractPartialAnswerField(jsonAcc);
      if (maybeAnswer !== null && maybeAnswer.length > lastEmittedAnswer.length) {
        const delta = maybeAnswer.slice(lastEmittedAnswer.length);
        lastEmittedAnswer = maybeAnswer;
        try {
          onDelta(delta);
        } catch {
          /* Caller's onDelta is best-effort; never let it break streaming. */
        }
      }
    }
  }

  const final = await stream.finalMessage();

  /* Extract the tool's final input. Anthropic returns it already parsed
     as an object in the `input` field on a tool_use block. */
  let parsed: ChatAnswer | null = null;
  for (const block of final.content) {
    if (block.type === 'tool_use' && block.name === ANSWER_TOOL_NAME) {
      parsed = block.input as ChatAnswer;
      break;
    }
  }

  const rawAnswer = typeof parsed?.answer === 'string' ? parsed.answer : '';
  const rawCitations = Array.isArray(parsed?.citations) ? parsed!.citations : [];

  /* Validate every citation server-side — drop anything whose id
     doesn't resolve to a known anchor (ADR-0003 §4.3).  Also rewrite
     `kind` and `deeplink` to the authoritative values from the map,
     since a confused model can emit a correct id with wrong metadata. */
  const validated: ChatCitation[] = [];
  for (const c of rawCitations) {
    if (!c || typeof c.id !== 'string') continue;
    const v = validateCitation(c.id);
    if (v.ok) {
      validated.push({ id: c.id.trim(), kind: v.kind, deeplink: v.deeplink });
    }
  }

  const usage: Usage = {
    input_tokens: final.usage?.input_tokens ?? 0,
    output_tokens: final.usage?.output_tokens ?? 0,
    cache_read_input_tokens: final.usage?.cache_read_input_tokens ?? 0,
    cache_creation_input_tokens: final.usage?.cache_creation_input_tokens ?? 0,
  };

  return {
    answer: rawAnswer,
    citations: validated,
    usage,
    model,
  };
}

/* ------------------------------------------------------------------ *
 * Progressive-JSON helpers.
 *
 * While the tool input is streaming, the `answer` field arrives as a
 * progressively-growing JSON string. We want to surface partial prose
 * to the UI as it lands, but the partial JSON will often be malformed
 * (unterminated strings, trailing commas). Rather than trying to parse
 * incomplete JSON, we scan for the "answer": "..." field and extract
 * whatever legal-looking prefix of the string has arrived so far.
 * ------------------------------------------------------------------ */

const ANSWER_FIELD_RE = /"answer"\s*:\s*"/;

/**
 * Given a (possibly-truncated) JSON blob representing the tool input,
 * return the best-effort partial value of the `answer` field. Returns
 * null if the "answer": " prefix hasn't arrived yet.
 *
 * Handles JSON escape sequences (\", \\, \n, \r, \t, \uXXXX) so we
 * don't emit raw backslash noise to the UI.
 */
export function extractPartialAnswerField(jsonBlob: string): string | null {
  const m = ANSWER_FIELD_RE.exec(jsonBlob);
  if (!m) return null;
  const start = m.index + m[0].length;
  const out: string[] = [];
  let i = start;
  while (i < jsonBlob.length) {
    const ch = jsonBlob.charCodeAt(i);
    if (ch === 0x22 /* " */) break; // end of string
    if (ch === 0x5c /* \ */) {
      if (i + 1 >= jsonBlob.length) break; // wait for more bytes
      const esc = jsonBlob[i + 1];
      switch (esc) {
        case '"':
          out.push('"');
          i += 2;
          break;
        case '\\':
          out.push('\\');
          i += 2;
          break;
        case '/':
          out.push('/');
          i += 2;
          break;
        case 'n':
          out.push('\n');
          i += 2;
          break;
        case 'r':
          out.push('\r');
          i += 2;
          break;
        case 't':
          out.push('\t');
          i += 2;
          break;
        case 'b':
          out.push('\b');
          i += 2;
          break;
        case 'f':
          out.push('\f');
          i += 2;
          break;
        case 'u': {
          if (i + 6 > jsonBlob.length) return out.join(''); // wait for more
          const hex = jsonBlob.slice(i + 2, i + 6);
          const code = Number.parseInt(hex, 16);
          if (Number.isFinite(code)) {
            out.push(String.fromCharCode(code));
          }
          i += 6;
          break;
        }
        default:
          // Unknown escape — keep raw; don't throw.
          out.push(esc ?? '');
          i += 2;
      }
    } else {
      out.push(jsonBlob[i]);
      i += 1;
    }
  }
  return out.join('');
}
