/**
 * One conversation message (user or assistant).
 *
 * Assistant prose is rendered with a tiny regex-based Markdown subset —
 * the tool-use envelope in ADR-0003 §4.3 only asks the model for a bounded
 * markdown dialect (bold, italic, inline code, fenced code, hard line
 * breaks, inline citation markers). We keep this self-contained rather
 * than pulling in a full Markdown parser.
 */
import React from 'react';
import { RadarRing } from '../RadarRing';
import { CitationRail } from './CitationRail';
import type { Citation } from '../../lib/chat-stream';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  streaming?: boolean;
  interrupted?: boolean;
  /** Optional label for a system-mono prefix like `T+0m12s`. */
  timestamp?: string;
}

export function ChatMessage({
  role,
  content,
  citations,
  streaming,
  interrupted,
  timestamp,
}: Props) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] ml-auto">
          <div className="flex items-center gap-2 justify-end mb-1 text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
            {timestamp && <span className="text-white/30">{timestamp}</span>}
            <span>User</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    );
  }

  const showTyping = streaming === true && content.trim().length === 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-1 text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f05122]" aria-hidden="true" />
        <span>Model</span>
        {timestamp && <span className="text-white/30">{timestamp}</span>}
        {interrupted && (
          <span className="ml-2 px-1.5 py-0.5 rounded border border-[#f05122]/50 bg-[#f05122]/10 text-[#ff8a5c] text-[0.625rem] tracking-[0.14em]">
            Stream interrupted
          </span>
        )}
      </div>
      <div className="rounded-lg border border-white/10 bg-black px-4 py-3">
        {showTyping ? (
          <div className="flex items-center gap-3 text-[0.6875rem] font-mono text-white/50 tracking-[0.18em] uppercase">
            <RadarRing size={28} />
            <span>Model thinking…</span>
          </div>
        ) : (
          <div className="chat-prose text-sm text-white/85 leading-relaxed">
            {renderMarkdown(content)}
          </div>
        )}
        {citations && citations.length > 0 && (
          <CitationRail citations={citations} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Minimal markdown renderer                                           */
/* ------------------------------------------------------------------ */

/**
 * Render a small subset of Markdown as React nodes:
 *   - fenced code blocks (```...```)
 *   - inline code (`...`)
 *   - bold (**text**)
 *   - italic (*text*)
 *   - hard line breaks (two spaces + newline OR blank line -> paragraph)
 *   - inline citation markers like [§4.8], [DEC-04], [FEEDBACK #17] —
 *     rendered as a small mono chip. The clickable citation-rail at the
 *     bottom is the load-bearing navigation; inline markers are cosmetic.
 */
function renderMarkdown(src: string): React.ReactNode {
  if (!src) return null;

  // Split out fenced code blocks first — they must not be inline-processed.
  const blocks = splitFenced(src);
  return blocks.map((b, i) => {
    if (b.kind === 'code') {
      return (
        <pre
          key={i}
          className="my-3 p-3 rounded border border-white/10 bg-black/80 text-[0.8125rem] font-mono text-white/80 overflow-x-auto whitespace-pre"
        >
          <code>{b.body}</code>
        </pre>
      );
    }
    return (
      <React.Fragment key={i}>{renderParagraphs(b.body)}</React.Fragment>
    );
  });
}

type Block = { kind: 'text' | 'code'; body: string };

function splitFenced(src: string): Block[] {
  const out: Block[] = [];
  const re = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m.index > lastIndex) {
      out.push({ kind: 'text', body: src.slice(lastIndex, m.index) });
    }
    out.push({ kind: 'code', body: m[2] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < src.length) {
    out.push({ kind: 'text', body: src.slice(lastIndex) });
  }
  return out;
}

function renderParagraphs(src: string): React.ReactNode {
  const paras = src.split(/\n\s*\n/);
  return paras.map((p, i) => {
    const trimmed = p.trim();
    if (!trimmed) return null;
    return (
      <p key={i} className="mb-3 last:mb-0">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(src: string): React.ReactNode[] {
  // Tokenise in priority order: inline code, bold, italic, citation marker,
  // line break. Everything else is plain text.
  // We walk through and build a list of React nodes.
  const nodes: React.ReactNode[] = [];
  let remaining = src;
  let key = 0;

  // Ordered list of (regex, renderer) pairs. The first regex to match at the
  // earliest index wins.
  const matchers: {
    re: RegExp;
    render: (m: RegExpExecArray, k: number) => React.ReactNode;
  }[] = [
    {
      re: /`([^`\n]+)`/g,
      render: (m, k) => (
        <code
          key={k}
          className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[0.8125em] text-[#ff8a5c]"
        >
          {m[1]}
        </code>
      ),
    },
    {
      re: /\*\*([^*\n]+)\*\*/g,
      render: (m, k) => (
        <strong key={k} className="text-white font-medium">
          {m[1]}
        </strong>
      ),
    },
    {
      re: /\*([^*\n]+)\*/g,
      render: (m, k) => (
        <em key={k} className="text-white/80 italic">
          {m[1]}
        </em>
      ),
    },
    {
      re: /\[(§[\w.-]+|DEC-\d+|SPAN-[A-Z]+|L-\d+|FEEDBACK #\d+)\]/g,
      render: (m, k) => (
        <span
          key={k}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded border border-white/10 bg-black text-[0.75em] font-mono tracking-[0.12em] text-[#ff8a5c]/90 align-baseline"
        >
          {m[1]}
        </span>
      ),
    },
  ];

  while (remaining.length > 0) {
    let bestIdx = -1;
    let bestMatch: RegExpExecArray | null = null;
    let bestRender: ((m: RegExpExecArray, k: number) => React.ReactNode) | null = null;

    for (const { re, render } of matchers) {
      re.lastIndex = 0;
      const m = re.exec(remaining);
      if (m && (bestIdx === -1 || m.index < bestIdx)) {
        bestIdx = m.index;
        bestMatch = m;
        bestRender = render;
      }
    }

    if (!bestMatch || !bestRender || bestIdx === -1) {
      nodes.push(renderLineBreaks(remaining, key++));
      break;
    }

    if (bestIdx > 0) {
      nodes.push(renderLineBreaks(remaining.slice(0, bestIdx), key++));
    }
    nodes.push(bestRender(bestMatch, key++));
    remaining = remaining.slice(bestIdx + bestMatch[0].length);
  }

  return nodes;
}

function renderLineBreaks(src: string, baseKey: number): React.ReactNode {
  const lines = src.split('\n');
  if (lines.length === 1) return <React.Fragment key={baseKey}>{src}</React.Fragment>;
  return (
    <React.Fragment key={baseKey}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}
