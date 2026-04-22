import { useMemo, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { layers } from '../content/layers';
import { refTechs } from '../content/ref-techs';

type Mode = 'concerns' | 'tech' | 'questions';

interface ConcernRow {
  text: string;
  layer: number;
  layerName: string;
  layerId: string;
}

const ALL_CONCERNS: ConcernRow[] = layers.flatMap((l) =>
  l.concerns.map((c) => ({ text: c, layer: l.number, layerName: l.name, layerId: l.id })),
);

const ALL_QUESTIONS: ConcernRow[] = layers.flatMap((l) =>
  l.openQuestions.map((q) => ({ text: q, layer: l.number, layerName: l.name, layerId: l.id })),
);

export function Explorer() {
  const [mode, setMode] = useState<Mode>('concerns');
  const [q, setQ] = useState('');
  const [layerFilter, setLayerFilter] = useState<number | null>(null);

  const filter = (src: ConcernRow[]) => {
    const lq = q.trim().toLowerCase();
    return src.filter((row) => {
      if (layerFilter !== null && row.layer !== layerFilter) return false;
      if (!lq) return true;
      return (
        row.text.toLowerCase().includes(lq) ||
        row.layerName.toLowerCase().includes(lq)
      );
    });
  };

  const concerns = useMemo(() => filter(ALL_CONCERNS), [q, layerFilter]);
  const questions = useMemo(() => filter(ALL_QUESTIONS), [q, layerFilter]);
  const techs = useMemo(() => {
    const lq = q.trim().toLowerCase();
    return refTechs
      .filter((t) => {
        if (layerFilter !== null && t.layer !== layerFilter) return false;
        if (!lq) return true;
        return (
          t.name.toLowerCase().includes(lq) ||
          (t.group?.toLowerCase().includes(lq) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [q, layerFilter]);

  const totals = {
    concerns: ALL_CONCERNS.length,
    tech: refTechs.length,
    questions: ALL_QUESTIONS.length,
  };

  return (
    <TelemetryRegion id="explorer" className="scroll-mt-24">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent"
                aria-hidden="true"
              />
              Practical Tool · Searchable Index
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-white display-font">
              Explorer
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              Every Key Concern, Reference Technology, and Open Question from the model —
              searchable, filterable by layer, each result linking back to its source panel.
              Treat the digest as a lookup table.
            </p>
          </div>
          <Chip tone="mono">
            {totals.concerns} concerns · {totals.tech} tech · {totals.questions} OQ
          </Chip>
        </header>

        <CmdPanel bodyClassName="p-0">
          <div className="p-4 border-b border-white/10 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-white/10 shadow-inner">
                <ModeButton active={mode === 'concerns'} onClick={() => setMode('concerns')}>
                  Concerns
                </ModeButton>
                <ModeButton active={mode === 'tech'} onClick={() => setMode('tech')}>
                  Technologies
                </ModeButton>
                <ModeButton active={mode === 'questions'} onClick={() => setMode('questions')}>
                  Open Questions
                </ModeButton>
              </div>
              <div className="flex-1 relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={
                    mode === 'concerns'
                      ? 'search concerns — e.g. sovereignty, kill-chain, provenance…'
                      : mode === 'tech'
                        ? 'search vendors / frameworks — e.g. LangChain, Anthropic…'
                        : 'search open questions…'
                  }
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/25 font-mono focus:outline-none focus:border-[#f05122]/60"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40 hover:text-white/90"
                  >
                    clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase mr-1">
                Layer
              </span>
              <LayerFilterPill active={layerFilter === null} onClick={() => setLayerFilter(null)}>
                All
              </LayerFilterPill>
              {layers.map((l) => (
                <LayerFilterPill
                  key={l.id}
                  active={layerFilter === l.number}
                  onClick={() =>
                    setLayerFilter(layerFilter === l.number ? null : l.number)
                  }
                >
                  L{l.number}
                </LayerFilterPill>
              ))}
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {mode === 'concerns' && (
              <ResultList
                rows={concerns.map((r) => ({
                  primary: r.text,
                  secondary: `Layer ${r.layer} — ${r.layerName}`,
                  href: `#${r.layerId}`,
                  chip: `L${r.layer}`,
                }))}
                query={q}
                emptyHint="No concerns match."
              />
            )}
            {mode === 'questions' && (
              <ResultList
                rows={questions.map((r) => ({
                  primary: r.text,
                  secondary: `Layer ${r.layer} — ${r.layerName}`,
                  href: `#${r.layerId}`,
                  chip: `L${r.layer}`,
                  prefix: 'OQ',
                }))}
                query={q}
                emptyHint="No open questions match."
              />
            )}
            {mode === 'tech' && (
              <ResultList
                rows={techs.map((t) => ({
                  primary: t.name,
                  secondary: `${t.group ? `${t.group} · ` : ''}Layer ${t.layer} — ${
                    layers.find((l) => l.number === t.layer)?.name ?? ''
                  }`,
                  href: `#layer-${t.layer}`,
                  chip: `L${t.layer}`,
                }))}
                query={q}
                emptyHint="No technologies match."
              />
            )}
          </div>

          <footer className="px-4 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
            <span className="text-[0.6875rem] font-mono text-white/45 tracking-[0.14em] uppercase">
              {mode === 'concerns'
                ? `${concerns.length} of ${totals.concerns} concerns`
                : mode === 'tech'
                  ? `${techs.length} of ${totals.tech} technologies`
                  : `${questions.length} of ${totals.questions} open questions`}
            </span>
            <span className="text-[0.6875rem] font-mono text-white/35 tracking-[0.14em]">
              click any result to jump to its layer panel
            </span>
          </footer>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded border transition-colors ${
        active
          ? 'bg-white/5 border-white/15 text-white shadow-sm'
          : 'border-transparent text-white/50 hover:text-white/90'
      }`}
    >
      {children}
    </button>
  );
}

function LayerFilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded border text-[0.6875rem] font-mono tracking-[0.14em] uppercase transition-colors ${
        active
          ? 'bg-[#f05122] border-[#f05122] text-white'
          : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
      }`}
    >
      {children}
    </button>
  );
}

interface Row {
  primary: string;
  secondary: string;
  href: string;
  chip: string;
  prefix?: string;
}

function ResultList({ rows, query, emptyHint }: { rows: Row[]; query: string; emptyHint: string }) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-white/45 font-mono">{emptyHint}</div>
    );
  }
  return (
    <ul className="divide-y divide-white/5">
      {rows.map((r, i) => (
        <li key={i}>
          <a
            href={r.href}
            className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
          >
            {r.prefix && (
              <span className="text-[0.6875rem] font-mono text-[#ff8a5c] tracking-[0.18em] pt-0.5 w-6 flex-shrink-0">
                {r.prefix}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white leading-snug">
                {highlight(r.primary, query)}
              </div>
              <div className="text-[0.6875rem] font-mono text-white/45 tracking-wide mt-0.5">
                {r.secondary}
              </div>
            </div>
            <span className="chip chip-mono flex-shrink-0">{r.chip}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function highlight(text: string, q: string) {
  const lq = q.trim();
  if (!lq) return text;
  const idx = text.toLowerCase().indexOf(lq.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#f05122]/30 text-white rounded px-0.5">{text.slice(idx, idx + lq.length)}</mark>
      {text.slice(idx + lq.length)}
    </>
  );
}
