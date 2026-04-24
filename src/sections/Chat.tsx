/**
 * The Chat surface (ADR-0002).
 *
 * One full-width section, sibling to Feedback. Ephemeral conversation,
 * streaming delta rendering, citation rail per assistant message, and a
 * client-serialised "share this thread" link. The reader is the source
 * of truth — this surface is grounded Q&A over the digest and eligible
 * feedback corpora.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import type { ChatInputHandle } from '../components/chat/ChatInput';
import { ChatUsageFooter } from '../components/chat/ChatUsageFooter';
import {
  streamChat,
  type Citation,
  type ChatMessage as WireMessage,
} from '../lib/chat-stream';

/** Per-conversation turn cap (ADR-0002 §6; one turn = one user message). */
const TURN_CAP = 40;

/** Fallback copy shown when the model produces no citations (ADR-0003 §4.3). */
const NO_CITATION_FALLBACK =
  'I cannot answer that from the attached materials. Try rephrasing, or consult the digest directly.';

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  streaming?: boolean;
  interrupted?: boolean;
  ts?: string;
}

export function Chat() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);
  const startedAtRef = useRef<number>(Date.now());

  /** Count user messages — one turn = one user message (ADR-0002 §6). */
  const turnCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  );
  const threadFull = turnCount >= TURN_CAP;

  /* --------------------------------------------------------------- */
  /* Hash parsing — #chat?q=... (pre-fill) and #chat?t=... (share)    */
  /* --------------------------------------------------------------- */

  useEffect(() => {
    function parseHash() {
      const hash = window.location.hash || '';
      // Match the `#chat` prefix, preserving any optional query string.
      const m = hash.match(/^#chat(?:\?(.*))?$/);
      if (!m) return;
      const params = new URLSearchParams(m[1] ?? '');
      const t = params.get('t');
      if (t) {
        const loaded = decodeThread(t);
        if (loaded) {
          setMessages(loaded);
          setReadOnly(true);
          return;
        }
      }
      const q = params.get('q');
      if (q) {
        setInput(q);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
    parseHash();
    window.addEventListener('hashchange', parseHash);

    // The command palette entry dispatches this event after routing to
    // `#chat`, so we can pull focus into the input without coupling to the
    // palette implementation.
    function onFocusRequest() {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    window.addEventListener('oia:chat:focus', onFocusRequest);

    return () => {
      window.removeEventListener('hashchange', parseHash);
      window.removeEventListener('oia:chat:focus', onFocusRequest);
    };
  }, []);

  /* --------------------------------------------------------------- */
  /* Autoscroll                                                       */
  /* --------------------------------------------------------------- */

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  /* --------------------------------------------------------------- */
  /* Submit                                                           */
  /* --------------------------------------------------------------- */

  const submit = useCallback(async () => {
    if (readOnly || sending || threadFull) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    setError(null);
    const userMsg: UIMessage = {
      id: mkId(),
      role: 'user',
      content: trimmed,
      ts: tsLabel(startedAtRef.current),
    };
    const assistantId = mkId();
    const assistantMsg: UIMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
      ts: tsLabel(startedAtRef.current),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setSending(true);

    const wire: WireMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    let finalSeen = false;
    try {
      for await (const evt of streamChat(wire, controller.signal)) {
        if (evt.type === 'delta') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + evt.text } : m,
            ),
          );
        } else if (evt.type === 'final') {
          finalSeen = true;
          const finalContent =
            evt.citations.length === 0 ? NO_CITATION_FALLBACK : evt.answer;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: finalContent,
                    citations: evt.citations,
                    streaming: false,
                  }
                : m,
            ),
          );
        }
      }
      if (!finalSeen) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, streaming: false, interrupted: true }
              : m,
          ),
        );
      }
    } catch (e) {
      const msg = (e as Error).message || 'chat request failed';
      const aborted = controller.signal.aborted;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                streaming: false,
                interrupted: true,
                content:
                  m.content ||
                  (aborted
                    ? 'Request cancelled.'
                    : `The chat server could not be reached. ${msg}`),
              }
            : m,
        ),
      );
      if (!aborted) setError(msg);
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }, [input, messages, readOnly, sending, threadFull]);

  function cancel() {
    abortRef.current?.abort();
  }

  function startNewThread() {
    cancel();
    setMessages([]);
    setInput('');
    setError(null);
    setReadOnly(false);
    setShareStatus(null);
    startedAtRef.current = Date.now();
    // Drop ?t= from the URL so a reload doesn't re-enter read-only mode.
    if (window.location.hash !== '#chat') {
      window.history.replaceState(null, '', '#chat');
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function shareThread() {
    if (messages.length === 0) return;
    try {
      const token = encodeThread(messages);
      const url = `${window.location.origin}${window.location.pathname}#chat?t=${token}`;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).then(
          () => {
            setShareStatus('Share link copied to clipboard.');
            window.setTimeout(() => setShareStatus(null), 2600);
          },
          () => {
            setShareStatus('Clipboard unavailable. Copy from the URL bar.');
            window.history.replaceState(null, '', `#chat?t=${token}`);
            window.setTimeout(() => setShareStatus(null), 3400);
          },
        );
      } else {
        window.history.replaceState(null, '', `#chat?t=${token}`);
        setShareStatus('Share URL is now in the address bar.');
        window.setTimeout(() => setShareStatus(null), 3400);
      }
    } catch {
      setShareStatus('Could not serialise thread — too large.');
      window.setTimeout(() => setShareStatus(null), 3400);
    }
  }

  /* --------------------------------------------------------------- */
  /* Render                                                           */
  /* --------------------------------------------------------------- */

  return (
    <TelemetryRegion id="chat">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent"
                aria-hidden="true"
              />
              Agentics Foundation · Grounded Q&amp;A
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-white display-font">
              Ask the OIA Model
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              Ask questions grounded in the Reader's Digest, the Decision Log, and
              eligible community feedback. Every answer cites the section, decision,
              span, or submission it draws from. The digest is the source of
              truth — where the chat disagrees with the digest, the digest wins.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Chip tone="mono">
              Turn {turnCount}/{TURN_CAP}
            </Chip>
            {readOnly && <Chip tone="strong">Shared thread — read only</Chip>}
            <button
              type="button"
              onClick={startNewThread}
              className="text-[0.6875rem] font-mono text-white/55 hover:text-[#ff8a5c] uppercase tracking-[0.18em] transition-colors px-2 py-1 border border-white/10 rounded"
            >
              Start new thread
            </button>
            <button
              type="button"
              onClick={shareThread}
              disabled={messages.length === 0}
              className="text-[0.6875rem] font-mono text-white/55 hover:text-[#ff8a5c] uppercase tracking-[0.18em] transition-colors px-2 py-1 border border-white/10 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Share thread
            </button>
          </div>
        </header>

        <CmdPanel
          eyebrow="Conversation · Ephemeral"
          title="Open Intelligence Architecture — grounded Q&A"
          trailing={
            <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase">
              Citations required
            </span>
          }
        >
          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label="Chat conversation"
            className="flex flex-col gap-5 max-h-[60vh] min-h-[280px] overflow-y-auto pr-1"
          >
            {messages.length === 0 && (
              <div className="text-sm text-white/50 leading-relaxed">
                <p className="mb-2">
                  No messages yet. Ask a question about the nine layers, the six
                  cross-layer spans, any of the eleven decisions, or the open
                  questions deferred to v0.2.
                </p>
                <p className="text-[0.75rem] text-white/35">
                  Conversations are ephemeral — the thread is lost on reload unless
                  you use <span className="font-mono text-[#ff8a5c]">Share thread</span>.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role}
                content={m.content}
                citations={m.citations}
                streaming={m.streaming}
                interrupted={m.interrupted}
                timestamp={m.ts}
              />
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/10">
            {readOnly ? (
              <div className="text-[0.8125rem] text-white/55 leading-relaxed">
                This is a shared read-only view of a chat thread.{' '}
                <button
                  type="button"
                  onClick={startNewThread}
                  className="text-[#ff8a5c] hover:text-white underline decoration-dotted underline-offset-2"
                >
                  Start a new thread
                </button>{' '}
                to ask your own questions.
              </div>
            ) : (
              <ChatInput
                ref={inputRef}
                value={input}
                onChange={setInput}
                onSubmit={submit}
                disabled={sending || threadFull}
                sending={sending}
                placeholder={
                  threadFull
                    ? 'Thread full — start a new thread.'
                    : 'Ask about a layer, span, decision, or feedback submission…'
                }
                rightSlot={
                  sending ? (
                    <button
                      type="button"
                      onClick={cancel}
                      className="text-[0.6875rem] font-mono text-white/55 hover:text-[#ff8a5c] uppercase tracking-[0.18em] transition-colors px-2 py-1 border border-white/10 rounded"
                    >
                      Cancel
                    </button>
                  ) : null
                }
              />
            )}
            {threadFull && !readOnly && (
              <div className="mt-2 text-[0.75rem] font-mono text-[#ff8a5c] tracking-wide">
                Thread full — start a new thread.
              </div>
            )}
            {error && (
              <div className="mt-2 text-[0.75rem] font-mono text-[#ff8a5c] tracking-wide">
                Chat error: {error}
              </div>
            )}
            {shareStatus && (
              <div
                className="mt-2 text-[0.75rem] font-mono text-[#ff8a5c] tracking-wide"
                role="status"
                aria-live="polite"
              >
                {shareStatus}
              </div>
            )}
          </div>
        </CmdPanel>

        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap text-[0.6875rem] font-mono text-white/45 tracking-[0.14em]">
          <ChatUsageFooter />
          <div className="flex items-center gap-3">
            <span>Anonymous</span>
            <span className="text-white/20">·</span>
            <span>No server-side history</span>
            <span className="text-white/20">·</span>
            <span>No cross-user memory</span>
          </div>
        </div>
      </div>
    </TelemetryRegion>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function mkId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function tsLabel(startMs: number): string {
  const secs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `T+${m}m${String(s).padStart(2, '0')}s`;
}

/** Serialise a thread to a URL-safe base64 string. */
function encodeThread(messages: UIMessage[]): string {
  const slim = messages.map((m) => ({
    r: m.role === 'user' ? 'u' : 'a',
    c: m.content,
    x: m.citations ?? undefined,
  }));
  const json = JSON.stringify(slim);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeThread(token: string): UIMessage[] | null {
  try {
    let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad > 0) b64 += '='.repeat(4 - pad);
    const json = decodeURIComponent(escape(atob(b64)));
    const slim = JSON.parse(json) as Array<{ r: string; c: string; x?: Citation[] }>;
    if (!Array.isArray(slim)) return null;
    return slim.map((row) => ({
      id: mkId(),
      role: row.r === 'u' ? 'user' : 'assistant',
      content: typeof row.c === 'string' ? row.c : '',
      citations: Array.isArray(row.x) ? row.x : undefined,
    }));
  } catch {
    return null;
  }
}
