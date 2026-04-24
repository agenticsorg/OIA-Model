/**
 * Client-side SSE consumer for POST /api/chat.
 *
 * Streams deltas (`delta` events containing answer text chunks) followed by a
 * single `final` event carrying the validated answer, citations, and turn id.
 * See ADR-0003 §4.3 and §5 for the wire contract.
 */
import { apiUrl } from './api-base';

/** A single citation envelope per ADR-0003 §4.3. */
export interface Citation {
  id: string;
  kind: 'digest' | 'decision' | 'span' | 'layer' | 'feedback' | string;
  deeplink: string;
}

/** Conversation message shape sent on every turn (stateless server). */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** A streamed token chunk from the model. */
export interface ChatDeltaEvent {
  type: 'delta';
  text: string;
}

/** Final envelope with server-validated citations. */
export interface ChatFinalEvent {
  type: 'final';
  answer: string;
  citations: Citation[];
  turn_id: string;
}

export type ChatEvent = ChatDeltaEvent | ChatFinalEvent;

/** Thrown when the server returns a non-2xx response. */
export class ChatRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ChatRequestError';
  }
}

/**
 * POST /api/chat and yield each SSE event as it arrives.
 *
 * Frame grammar (one event per blank-line-delimited block):
 *   event: delta | final | error
 *   data: <json>
 *
 * The final frame terminates the generator. Errors are thrown.
 */
export async function* streamChat(
  messages: ChatMessage[],
  signal: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const response = await fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      /* ignore */
    }
    throw new ChatRequestError(
      response.status,
      detail || `chat request failed with status ${response.status}`,
    );
  }
  if (!response.body) {
    throw new ChatRequestError(0, 'no response body from /api/chat');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by double newlines.
      let frameEnd: number;
      while ((frameEnd = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, frameEnd);
        buffer = buffer.slice(frameEnd + 2);
        const parsed = parseFrame(raw);
        if (parsed) yield parsed;
      }
    }
    // Drain any trailing frame.
    if (buffer.trim().length > 0) {
      const parsed = parseFrame(buffer);
      if (parsed) yield parsed;
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* ignore */
    }
  }
}

function parseFrame(raw: string): ChatEvent | null {
  let eventName = 'message';
  const dataLines: string[] = [];
  for (const line of raw.split('\n')) {
    if (!line) continue;
    if (line.startsWith(':')) continue; // SSE comment
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (dataLines.length === 0) return null;
  const dataStr = dataLines.join('\n');

  try {
    const payload = JSON.parse(dataStr) as Record<string, unknown>;
    if (eventName === 'delta') {
      const text = typeof payload.text === 'string' ? payload.text : '';
      return { type: 'delta', text };
    }
    if (eventName === 'final') {
      const answer = typeof payload.answer === 'string' ? payload.answer : '';
      const citations = Array.isArray(payload.citations)
        ? (payload.citations as Citation[])
        : [];
      const turn_id = typeof payload.turn_id === 'string' ? payload.turn_id : '';
      return { type: 'final', answer, citations, turn_id };
    }
    if (eventName === 'error') {
      const msg =
        (typeof payload.message === 'string' && payload.message) ||
        (typeof payload.error === 'string' && payload.error) ||
        'upstream chat error';
      throw new ChatRequestError(
        typeof payload.status === 'number' ? payload.status : 500,
        msg,
      );
    }
  } catch (err) {
    if (err instanceof ChatRequestError) throw err;
    // Malformed JSON frame — skip silently; ADR-0003 §4.3 says we prefer
    // graceful degradation over hard failure during streaming.
  }
  return null;
}
