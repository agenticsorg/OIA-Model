import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { spans } from '../../content/spans';

type Posture = 'strong' | 'partial' | 'weak' | 'absent';

const POSTURE_META: Record<Posture, { label: string; short: string }> = {
  strong:  { label: 'Strong',  short: 'Strong' },
  partial: { label: 'Partial', short: 'Partial' },
  weak:    { label: 'Weak',    short: 'Weak' },
  absent:  { label: 'Absent',  short: 'Absent' },
};

export function SpanGapMemo() {
  const [state, setState] = useLocalStorage<Partial<Record<string, Posture>>>('oia:op:span-posture', {});

  const summary = useMemo(() => {
    const counts = { strong: 0, partial: 0, weak: 0, absent: 0 };
    for (const s of spans) {
      const p = state[s.id];
      if (p) counts[p] += 1;
    }
    return counts;
  }, [state]);

  const artifact = useMemo(() => {
    const rated = spans.filter((s) => state[s.id]);
    if (rated.length === 0) return '';
    const weak = spans.filter((s) => state[s.id] === 'weak' || state[s.id] === 'absent');
    const lines: string[] = [];
    lines.push('# Cross-layer span gap memo');
    lines.push('');
    lines.push('Posture ratings across the six OIA Model cross-layer spans, for review with the security / compliance / audit team.');
    lines.push('');
    lines.push('## Current posture');
    lines.push('| Span | Posture | Layers it touches |');
    lines.push('|---|---|---|');
    for (const s of spans) {
      const p = state[s.id];
      const label = p ? POSTURE_META[p].label : 'Not assessed';
      const layerList = s.layerRange.map((n) => `L${n}`).join(', ');
      lines.push(`| ${s.name} (${s.code}) | ${label} | ${layerList} |`);
    }
    lines.push('');
    lines.push('## Priority gaps');
    if (weak.length === 0) lines.push('- No spans rated weak / absent.');
    else
      for (const s of weak)
        lines.push(
          `- **${s.name} (${s.code})** — ${POSTURE_META[state[s.id]!].label}. Layers in scope: ${s.layerRange.map((n) => `L${n}`).join(', ')}.`,
        );
    lines.push('');
    lines.push('## Recommended action');
    lines.push('- Schedule a span-by-span coherence review with the layer owners listed above.');
    lines.push('- Auditability and Provenance cannot be retrofitted; design them into every layer now.');
    lines.push('');
    lines.push('_Generated from OIA Model §5 Cross-Layer Spans._');
    return lines.join('\n');
  }, [state]);

  function setSpan(id: string, p: Posture | null) {
    const n = { ...state };
    if (p === null) delete n[id];
    else n[id] = p;
    setState(n);
  }

  return (
    <MicroTool
      title="Rate each span · produce a gap memo"
      subtitle="Give every cross-layer span a posture rating. The tool generates a compliance-ready memo naming the weak spans and the layers they touch."
    >
      <div className="flex flex-col gap-3">
        {spans.map((s) => (
          <div key={s.id} className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white flex items-center gap-2">
                <span className="text-[0.6875rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
                  {s.code}
                </span>
                {s.name}
              </div>
              <div className="text-[0.75rem] text-white/45 font-mono tracking-wide">
                Layers · {s.layerRange.map((n) => `L${n}`).join(' · ')}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {(Object.keys(POSTURE_META) as Posture[]).map((p) => (
                <TogglePill
                  key={p}
                  active={state[s.id] === p}
                  onClick={() => setSpan(s.id, state[s.id] === p ? null : p)}
                  strong={p === 'weak' || p === 'absent'}
                >
                  {POSTURE_META[p].short}
                </TogglePill>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        <SummaryCell label="Strong"  value={summary.strong} />
        <SummaryCell label="Partial" value={summary.partial} />
        <SummaryCell label="Weak"    value={summary.weak}    strong />
        <SummaryCell label="Absent"  value={summary.absent}  strong />
      </div>
      <ArtifactPreview
        text={artifact}
        label="Span gap memo · paste into your CISO / audit doc"
        filename="span-gap-memo.md"
      />
    </MicroTool>
  );
}

function SummaryCell({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div
      className={`flex flex-col px-3 py-2 rounded border gap-0.5 ${
        strong ? 'border-[#f05122]/50 bg-[#f05122]/10' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <span className="text-[0.625rem] font-mono text-white/50 tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className={`text-xl font-normal display-font ${strong ? 'text-[#ff8a5c]' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
