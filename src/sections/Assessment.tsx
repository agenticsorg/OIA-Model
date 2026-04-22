import { useMemo } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { layers } from '../content/layers';
import { spans } from '../content/spans';
import { useLocalStorage, LS_KEYS } from '../hooks/useLocalStorage';

type Status = 'coherent' | 'gap' | 'notyet' | 'na';
type AssessmentState = Partial<Record<string, Status>>;

const OPTIONS: { value: Status; label: string; short: string; description: string }[] = [
  { value: 'coherent', label: 'Coherent', short: '✓', description: 'We have this working and auditable.' },
  { value: 'gap',      label: 'Gap',      short: '!', description: 'We know we have a gap here.' },
  { value: 'notyet',   label: 'Not Yet',  short: '○', description: 'Not addressed in our deployment yet.' },
  { value: 'na',       label: 'N/A',      short: '–', description: 'Out of scope for our deployment.' },
];

export function Assessment() {
  const [state, setState] = useLocalStorage<AssessmentState>(LS_KEYS.assessment, {});

  const totals = useMemo(() => {
    const t = { coherent: 0, gap: 0, notyet: 0, na: 0, unrated: 0 };
    for (const l of layers) {
      const s = state[l.id];
      if (!s) t.unrated += 1;
      else t[s] += 1;
    }
    return t;
  }, [state]);

  const inScope = 10 - totals.na;
  const coverage = inScope > 0 ? Math.round((totals.coherent / inScope) * 100) : 0;

  const spanReadiness = useMemo(() => {
    return spans.map((s) => {
      const relevant = s.layerRange.map((n) => {
        const l = layers.find((x) => x.number === n);
        return l ? state[l.id] : undefined;
      });
      const total = relevant.length;
      const coherent = relevant.filter((x) => x === 'coherent').length;
      const gap = relevant.filter((x) => x === 'gap').length;
      const notyet = relevant.filter((x) => x === 'notyet').length;
      const na = relevant.filter((x) => x === 'na').length;
      const effective = total - na;
      const pct = effective > 0 ? Math.round((coherent / effective) * 100) : 0;
      return { span: s, pct, coherent, gap, notyet, na, total };
    });
  }, [state]);

  function setLayer(id: string, next: Status | undefined) {
    setState((prev) => {
      const n = { ...prev };
      if (next === undefined) delete n[id];
      else n[id] = next;
      return n;
    });
  }

  function reset() {
    if (window.confirm('Reset your assessment?')) setState({});
  }

  return (
    <TelemetryRegion id="assessment" className="">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent"
                aria-hidden="true"
              />
              Practical Tool · Self-Diagnostic
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-white display-font">
              Architecture Assessment
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              Mark each layer against your current deployment. The OIA Model becomes a
              diagnostic instrument — your coverage score updates live, and the six
              cross-layer spans show where coherence is strongest or weakest.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="mono">Saves locally</Chip>
            <button
              type="button"
              onClick={reset}
              className="text-[0.6875rem] font-mono text-white/45 hover:text-[#ff8a5c] uppercase tracking-[0.18em] transition-colors px-2 py-1 border border-white/10 rounded"
            >
              Reset
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Layer matrix */}
          <CmdPanel
            eyebrow="Layer Matrix"
            title="Mark coverage at each of the nine layers"
            trailing={<Chip tone="accent">10 rows · L0 → L9</Chip>}
            bodyClassName="p-0"
          >
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase w-10">
                Layer
              </span>
              <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase">
                Name
              </span>
              <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase">
                Status
              </span>
            </div>
            {layers.map((l) => {
              const current = state[l.id];
              const isStateHolding = l.number === 3 || l.number === 8;
              return (
                <div
                  key={l.id}
                  className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 items-center border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className={`w-10 text-sm font-mono flex items-center gap-1.5 ${
                      isStateHolding ? 'text-[#ff8a5c]' : 'text-white/70'
                    }`}
                  >
                    {isStateHolding && (
                      <span
                        className="w-1 h-1 rounded-full bg-[#f05122] shadow-[0_0_6px_#f05122]"
                        aria-hidden="true"
                      />
                    )}
                    L{l.number}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <a
                      href={`#${l.id}`}
                      className="text-sm text-white hover:text-[#ff8a5c] transition-colors truncate"
                    >
                      {l.name}
                    </a>
                    <span className="text-[0.625rem] text-white/40 font-mono tracking-[0.14em] uppercase truncate">
                      {l.concerns.length} concerns · {l.openQuestions.length} OQ
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {OPTIONS.map((o) => {
                      const selected = current === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          title={o.description}
                          onClick={() => setLayer(l.id, selected ? undefined : o.value)}
                          aria-pressed={selected}
                          className={`w-9 h-9 rounded border flex items-center justify-center text-sm font-mono transition-all ${
                            selected
                              ? o.value === 'coherent'
                                ? 'bg-[#f05122] border-[#f05122] text-white shadow-[0_0_10px_rgba(240,81,34,0.45)]'
                                : o.value === 'gap'
                                  ? 'bg-[#f05122]/20 border-[#f05122] text-[#ff8a5c] shadow-[0_0_10px_rgba(240,81,34,0.25)]'
                                  : o.value === 'notyet'
                                    ? 'bg-white/5 border-white/40 text-white'
                                    : 'bg-white/[0.02] border-white/20 text-white/60'
                              : 'bg-transparent border-white/10 text-white/35 hover:border-white/40 hover:text-white/80'
                          }`}
                        >
                          {o.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center gap-3 text-[0.6875rem] font-mono text-white/45 tracking-[0.14em]">
              {OPTIONS.map((o) => (
                <span key={o.value} className="inline-flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded border border-white/15 text-white/80 flex items-center justify-center">
                    {o.short}
                  </span>
                  {o.label}
                </span>
              ))}
            </div>
          </CmdPanel>

          {/* Health dashboard */}
          <div className="flex flex-col gap-4">
            <CmdPanel eyebrow="Coverage" title="Layer health score">
              <div className="flex items-center gap-5">
                <CoverageRing pct={coverage} />
                <div className="flex-1">
                  <div className="text-4xl font-normal text-white display-font leading-none">
                    {coverage}
                    <span className="text-xl text-white/55">%</span>
                  </div>
                  <div className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase mt-1">
                    Coherent · In scope
                  </div>
                  <div className="mt-3 text-[0.6875rem] font-mono text-white/55 leading-relaxed">
                    {totals.coherent} of {inScope} in-scope layers coherent
                    {totals.na > 0 ? ` · ${totals.na} marked N/A` : ''}
                    {totals.unrated > 0 ? ` · ${totals.unrated} unrated` : ''}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <TotalCell label="Coherent" value={totals.coherent} accent />
                <TotalCell label="Gap" value={totals.gap} warn />
                <TotalCell label="Not Yet" value={totals.notyet} />
                <TotalCell label="N/A" value={totals.na} />
              </div>
            </CmdPanel>

            <CmdPanel eyebrow="Span Coherence" title="Cross-layer readiness">
              <div className="flex flex-col gap-2">
                {spanReadiness.map(({ span, pct, coherent, gap, notyet, na, total }) => (
                  <a
                    key={span.id}
                    href={`#${span.id}`}
                    className="block p-2 rounded hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase flex-shrink-0">
                        {span.code}
                      </span>
                      <span className="text-xs text-white/85 truncate flex-1">{span.name}</span>
                      <span className="text-[0.6875rem] font-mono text-white/70 flex-shrink-0">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#f05122] to-[#ff8a5c]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[0.625rem] font-mono text-white/35 tracking-wide mt-1">
                      {coherent}/{total - na} coherent
                      {gap > 0 ? ` · ${gap} gap` : ''}
                      {notyet > 0 ? ` · ${notyet} not yet` : ''}
                      {na > 0 ? ` · ${na} n/a` : ''}
                    </div>
                  </a>
                ))}
              </div>
            </CmdPanel>
          </div>
        </div>
      </div>
    </TelemetryRegion>
  );
}

function CoverageRing({ pct }: { pct: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#f05122"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="drop-shadow-[0_0_10px_rgba(240,81,34,0.5)] transition-[stroke-dashoffset] duration-700"
        />
      </svg>
    </div>
  );
}

function TotalCell({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  const base = 'flex items-center justify-between px-3 py-2 rounded border';
  const tone = accent
    ? 'border-[#f05122]/50 bg-[#f05122]/10 text-[#ff8a5c]'
    : warn
      ? 'border-[#f05122]/25 bg-[#f05122]/[0.04] text-[#ffb08c]'
      : 'border-white/10 bg-white/[0.02] text-white/70';
  return (
    <div className={`${base} ${tone}`}>
      <span className="text-[0.625rem] font-mono tracking-[0.18em] uppercase">{label}</span>
      <span className="text-base font-normal display-font">{value}</span>
    </div>
  );
}
