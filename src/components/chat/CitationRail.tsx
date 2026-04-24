/**
 * Citation rail rendered at the bottom of every assistant message
 * (ADR-0002 §7 and ADR-0003 §4.3). Each citation is a keyboard-focusable
 * link formatted as a log row — mono font, tracking, the System-Log
 * styling used by the Decision Log section.
 */
import type { Citation } from '../../lib/chat-stream';

interface Props {
  citations: Citation[];
}

function kindLabel(kind: string): string {
  switch (kind) {
    case 'digest':
      return 'Digest';
    case 'decision':
      return 'Decision';
    case 'span':
      return 'Cross-layer span';
    case 'layer':
      return 'Layer';
    case 'feedback':
      return 'Feedback submission';
    default:
      return 'Source';
  }
}

export function CitationRail({ citations }: Props) {
  if (!citations || citations.length === 0) return null;
  return (
    <div
      className="mt-3 border-t border-white/5 pt-3"
      role="group"
      aria-label="Citations"
    >
      <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase mb-2">
        Citations
      </div>
      <ul className="flex flex-wrap gap-1.5 m-0 p-0 list-none">
        {citations.map((c, i) => (
          <li key={`${c.id}-${i}`}>
            <a
              href={c.deeplink}
              aria-label={`link — ${kindLabel(c.kind)} ${c.id}`}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 bg-black text-[0.6875rem] font-mono tracking-[0.12em] text-white/70 hover:text-white hover:border-[#f05122]/50 hover:bg-[#f05122]/10 focus:outline-none focus:border-[#f05122]/70 focus:text-white transition-colors"
            >
              <span className="text-[#ff8a5c]/80" aria-hidden="true">
                ▸
              </span>
              <span className="truncate">{c.id}</span>
              <span className="text-white/30 text-[0.625rem] uppercase tracking-[0.18em] hidden sm:inline">
                {c.kind}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
