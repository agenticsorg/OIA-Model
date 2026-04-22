import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Role = 'architect' | 'vendor' | 'regulator' | 'researcher';
type Depth = 'brief' | 'standard' | 'deep';

const ROLE_LABEL: Record<Role, string> = {
  architect: 'Enterprise architect',
  vendor: 'Vendor / builder',
  regulator: 'Regulator / auditor',
  researcher: 'Researcher / reviewer',
};

const DEPTH_LABEL: Record<Depth, string> = {
  brief: '15 min brief',
  standard: '40 min digest',
  deep: 'Full review',
};

const PLANS: Record<Role, Record<Depth, { id: string; label: string; why: string }[]>> = {
  architect: {
    brief: [
      { id: 'nine-layers-overview', label: '§3 — Nine layers table',      why: 'shared vocabulary for your stack' },
      { id: 'stack-diagram',        label: 'Stack Diagram',                 why: 'see layer × span coverage' },
      { id: 'assessment',           label: 'Architecture Assessment',       why: 'rate your own posture in <5 min' },
    ],
    standard: [
      { id: 'nine-layers-overview', label: '§3 — Nine layers table',        why: 'baseline map' },
      { id: 'layer-definitions',    label: '§4 — Layer definitions',        why: 'concerns + ref tech per layer' },
      { id: 'cross-layer-spans',    label: '§5 — Cross-layer spans',        why: 'where coherence breaks' },
      { id: 'assessment',           label: 'Architecture Assessment',       why: 'your self-diagnostic' },
      { id: 'implementation',       label: 'Implementation Roadmap',        why: 'per-layer checklist export' },
    ],
    deep: [
      { id: 'introduction',         label: '§1 — Introduction',             why: 'model thesis' },
      { id: 'foundations',          label: '§2 — Foundations',              why: 'lineage + properties' },
      { id: 'layer-definitions',    label: '§4 — Layers',                   why: 'full depth' },
      { id: 'cross-layer-spans',    label: '§5 — Spans',                    why: 'coherence view' },
      { id: 'stack-diagram',        label: 'Stack Diagram',                 why: 'visual cross-reference' },
      { id: 'implementation',       label: 'Implementation Roadmap',        why: 'action items' },
      { id: 'decision-log',         label: 'Decision Log Digest',           why: 'push back on decisions' },
    ],
  },
  vendor: {
    brief: [
      { id: 'provider-footprint',   label: 'Provider Footprint',            why: 'see where competitors extend vertically' },
      { id: 'layer-definitions',    label: '§4 — Layer definitions',        why: 'scope your pitch to layers' },
    ],
    standard: [
      { id: 'introduction',         label: '§1 — Introduction',             why: 'model thesis' },
      { id: 'layer-definitions',    label: '§4 — Layers',                   why: 'position your product' },
      { id: 'provider-footprint',   label: 'Provider Footprint',            why: 'competitive footprint' },
      { id: 'relationship-to-others', label: '§6 — Framework relationships', why: 'co-sell signals' },
      { id: 'explorer',             label: 'Explorer',                      why: 'find your tech / concerns' },
    ],
    deep: [
      { id: 'foreword',             label: 'Foreword',                      why: 'why the gap exists' },
      { id: 'foundations',          label: '§2 — Foundations',              why: 'positioning' },
      { id: 'layer-definitions',    label: '§4 — Layers',                   why: 'per-layer reference tech' },
      { id: 'provider-footprint',   label: 'Provider Footprint',            why: 'market map' },
      { id: 'cross-layer-spans',    label: '§5 — Spans',                    why: 'horizontal wedges' },
      { id: 'decision-log',         label: 'Decision Log',                  why: 'where the model is contested' },
    ],
  },
  regulator: {
    brief: [
      { id: 'cross-layer-spans',    label: '§5 — Cross-layer spans',        why: 'security / sovereignty / audit / provenance' },
      { id: 'deferrals',            label: '§8 — Deferrals',                why: 'what the draft does not yet cover' },
    ],
    standard: [
      { id: 'introduction',         label: '§1 — Introduction',             why: 'thesis' },
      { id: 'cross-layer-spans',    label: '§5 — Spans',                    why: 'your primary surface' },
      { id: 'relationship-to-others', label: '§6 — Framework relationships', why: 'map to NIST AI RMF / ISO 42001 / OWASP' },
      { id: 'deferrals',            label: '§8 — Deferrals',                why: 'flag regulatory gaps' },
      { id: 'decision-log',         label: 'Decision Log',                  why: 'which decisions to formally comment on' },
    ],
    deep: [
      { id: 'foundations',          label: '§2 — Foundations',              why: 'lineage relative to your frameworks' },
      { id: 'layer-definitions',    label: '§4 — Layers',                   why: 'concerns at each layer' },
      { id: 'cross-layer-spans',    label: '§5 — Spans',                    why: 'horizontal treatments' },
      { id: 'relationship-to-others', label: '§6 — Relationships',          why: 'composition with AI RMF / CSF / 42001' },
      { id: 'decision-log',         label: 'Decision Log',                  why: 'reopen / confirm each' },
    ],
  },
  researcher: {
    brief: [
      { id: 'introduction',         label: '§1 — Introduction',             why: 'thesis + three properties' },
      { id: 'decision-log',         label: 'Decision Log',                  why: 'the 11 decisions most worth challenging' },
    ],
    standard: [
      { id: 'foreword',             label: 'Foreword',                      why: 'why-now framing' },
      { id: 'foundations',          label: '§2 — Foundations',              why: 'lineage + properties' },
      { id: 'layer-definitions',    label: '§4 — Layers',                   why: 'open questions per layer' },
      { id: 'explorer',             label: 'Explorer',                      why: 'all open questions aggregated' },
      { id: 'decision-log',         label: 'Decision Log',                  why: 'push back formally' },
    ],
    deep: [
      { id: 'on-reading',           label: 'On Reading This Digest',        why: 'editorial framing' },
      { id: 'foreword',             label: 'Foreword',                      why: 'why-now' },
      { id: 'foundations',          label: '§2 — Foundations',              why: 'lineage' },
      { id: 'layer-definitions',    label: '§4 — Layers',                   why: 'full depth + OQs' },
      { id: 'cross-layer-spans',    label: '§5 — Spans',                    why: 'intersections' },
      { id: 'decision-log',         label: 'Decision Log',                  why: 'all 11 decisions' },
      { id: 'using-this-log',       label: 'On Using This Log',             why: 'review protocol' },
    ],
  },
};

export function ReadingPlanGenerator() {
  const [role, setRole] = useLocalStorage<Role | null>('oia:op:reading-role', null);
  const [depth, setDepth] = useLocalStorage<Depth | null>('oia:op:reading-depth', null);

  const plan = useMemo(() => (role && depth ? PLANS[role][depth] : []), [role, depth]);

  const artifact = useMemo(() => {
    if (!role || !depth || plan.length === 0) return '';
    const lines: string[] = [];
    lines.push(`# OIA Model — reading plan for ${ROLE_LABEL[role]} (${DEPTH_LABEL[depth]})`);
    lines.push('');
    lines.push(
      'Share this with anyone who needs to get up to speed on the OIA Model for the same use case.',
    );
    lines.push('');
    plan.forEach((p, i) => {
      lines.push(`${i + 1}. **${p.label}** — ${p.why}`);
    });
    lines.push('');
    lines.push('_Ordered for ' + DEPTH_LABEL[depth].toLowerCase() + '._');
    return lines.join('\n');
  }, [role, depth, plan]);

  return (
    <MicroTool
      title="Generate a reading plan for your team"
      subtitle="Pick your role and how much time you have. The tool produces a Markdown reading plan — paste it into a project channel, a team wiki, or a kickoff doc so everyone reads to the same map."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-20">
            Role
          </span>
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <TogglePill key={r} active={role === r} onClick={() => setRole(r)} strong>
              {ROLE_LABEL[r]}
            </TogglePill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-20">
            Depth
          </span>
          {(Object.keys(DEPTH_LABEL) as Depth[]).map((d) => (
            <TogglePill key={d} active={depth === d} onClick={() => setDepth(d)} strong>
              {DEPTH_LABEL[d]}
            </TogglePill>
          ))}
        </div>
      </div>

      {plan.length > 0 && (
        <ol className="mt-4 space-y-1">
          {plan.map((p, i) => (
            <li key={p.id} className="flex items-start gap-3 text-sm">
              <span className="text-[#ff8a5c] font-mono text-[0.6875rem] pt-0.5 flex-shrink-0 w-5">
                {i + 1}.
              </span>
              <a
                href={`#${p.id}`}
                className="text-white/90 hover:text-[#ff8a5c] underline decoration-white/20 hover:decoration-[#f05122] underline-offset-2"
              >
                {p.label}
              </a>
              <span className="text-white/50 text-xs">— {p.why}</span>
            </li>
          ))}
        </ol>
      )}

      <ArtifactPreview
        text={artifact}
        label="Reading plan · paste into your team channel"
        filename="oia-reading-plan.md"
      />
    </MicroTool>
  );
}
