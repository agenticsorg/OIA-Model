import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Severity = 'low' | 'med' | 'high';
type UrgencyState = {
  mythos: Severity | null;
  fragmentation: Severity | null;
  behaviours: Severity | null;
};

const DEVS = [
  {
    id: 'mythos' as const,
    title: 'Frontier capability expansion',
    blurb: 'Mythos System Card + Project Glasswing, April 2026',
  },
  {
    id: 'fragmentation' as const,
    title: 'Agentic deployment fragmentation',
    blurb: 'Regulated-sector rollout without a shared vocabulary',
  },
  {
    id: 'behaviours' as const,
    title: 'Unanticipated model behaviours',
    blurb: 'Strategic concealment · unauthorised capability expansion',
  },
];

const SEV_LABELS: Record<Severity, string> = { low: 'Low', med: 'Medium', high: 'High' };

export function UrgencyBrief() {
  const [state, setState] = useLocalStorage<UrgencyState>('oia:op:urgency', {
    mythos: null,
    fragmentation: null,
    behaviours: null,
  });

  const score = useMemo(() => {
    const vals = Object.values(state);
    const w: number[] = vals.map((v) => (v === 'high' ? 2 : v === 'med' ? 1 : 0));
    return w.reduce((a, b) => a + b, 0);
  }, [state]);
  const level = score >= 4 ? 'High' : score >= 2 ? 'Elevated' : 'Watch';

  const artifact = useMemo(() => {
    const filled = Object.values(state).some((v) => v !== null);
    if (!filled) return '';
    const lines: string[] = [];
    lines.push('# OIA Model — organisational urgency brief (§2.2)');
    lines.push('');
    lines.push(`**Composite level:** ${level} (${score}/6)`);
    lines.push('');
    lines.push('## Our exposure to the three developments');
    for (const d of DEVS) {
      const v = state[d.id];
      const vLabel = v ? SEV_LABELS[v] : 'Not yet assessed';
      lines.push(`- **${d.title}** — _${d.blurb}_ → **${vLabel}**`);
    }
    lines.push('');
    lines.push('## Recommended next move');
    if (level === 'High') {
      lines.push('- Convene an architecture review within 30 days. Use the OIA Assessment + Implementation Roadmap to identify gaps at the state-holding layers (L3, L8) and the Security / Sovereignty / Auditability spans.');
    } else if (level === 'Elevated') {
      lines.push('- Schedule an architecture review within the next quarter. Focus first on whichever development scored High above.');
    } else {
      lines.push('- Monitor the developments above on a quarterly cadence. Track whichever item moves to Medium or High.');
    }
    lines.push('');
    lines.push('_Generated from OIA Model §2.2 Contemporary Context._');
    return lines.join('\n');
  }, [state, score, level]);

  return (
    <MicroTool
      title="Draft an urgency brief for your board / leadership"
      subtitle="Rate your exposure to each of the three 2026 developments. The tool produces a board-level brief with a composite urgency level and a recommended next move."
    >
      <div className="flex flex-col gap-3">
        {DEVS.map((d) => (
          <div key={d.id} className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white">{d.title}</div>
              <div className="text-[0.75rem] text-white/50 leading-relaxed">{d.blurb}</div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {(Object.keys(SEV_LABELS) as Severity[]).map((s) => (
                <TogglePill
                  key={s}
                  active={state[d.id] === s}
                  onClick={() => setState({ ...state, [d.id]: state[d.id] === s ? null : s })}
                  strong={s === 'high'}
                >
                  {SEV_LABELS[s]}
                </TogglePill>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase">
          Composite urgency
        </span>
        <span
          className={`chip ${
            level === 'High' ? 'chip-strong' : level === 'Elevated' ? 'chip-accent' : 'chip-mono'
          }`}
        >
          {level} · {score}/6
        </span>
      </div>
      <ArtifactPreview
        text={artifact}
        label="Board brief · paste into pre-reads or a policy memo"
        filename="urgency-brief.md"
      />
    </MicroTool>
  );
}
