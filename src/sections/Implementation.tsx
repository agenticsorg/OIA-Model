import { useMemo, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { layers } from '../content/layers';
import { useLocalStorage, LS_KEYS } from '../hooks/useLocalStorage';

type ImplState = Partial<Record<string, Record<string, boolean>>>;

/**
 * Per-layer implementation checklist. Every Key Concern becomes a
 * "decide approach for …" task; every Open Question becomes a "track
 * resolution of …" task. Progress persists to localStorage and
 * exports as a Markdown project plan.
 */
export function Implementation() {
  const [state, setState] = useLocalStorage<ImplState>(LS_KEYS.implementation, {});
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['layer-0']));
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const perLayerCounts = useMemo(() => {
    return layers.map((l) => {
      const tasks = tasksFor(l);
      const done = tasks.filter((t) => state[l.id]?.[t.id]).length;
      return { layer: l, done, total: tasks.length, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0, tasks };
    });
  }, [state]);

  const overall = useMemo(() => {
    const total = perLayerCounts.reduce((a, x) => a + x.total, 0);
    const done = perLayerCounts.reduce((a, x) => a + x.done, 0);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const layersUnderway = perLayerCounts.filter((x) => x.done > 0).length;
    const layersComplete = perLayerCounts.filter((x) => x.total > 0 && x.done === x.total).length;
    return { total, done, pct, layersUnderway, layersComplete };
  }, [perLayerCounts]);

  function toggleTask(layerId: string, taskId: string) {
    setState((prev) => {
      const n = { ...prev };
      const row = { ...(n[layerId] ?? {}) };
      if (row[taskId]) delete row[taskId];
      else row[taskId] = true;
      if (Object.keys(row).length === 0) delete n[layerId];
      else n[layerId] = row;
      return n;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function expandAll() {
    setExpanded(new Set(layers.map((l) => l.id)));
  }
  function collapseAll() {
    setExpanded(new Set());
  }
  function reset() {
    if (window.confirm('Clear your implementation checklist?')) setState({});
  }

  function exportPlan() {
    const lines: string[] = ['# OIA Model — Implementation Plan', ''];
    lines.push(`Overall: ${overall.done}/${overall.total} tasks (${overall.pct}%) · ${overall.layersComplete} complete · ${overall.layersUnderway} underway`);
    lines.push('');
    for (const { layer, tasks, done, total, pct } of perLayerCounts) {
      lines.push(`## Layer ${layer.number} — ${layer.name}  (${done}/${total} · ${pct}%)`);
      for (const t of tasks) {
        const box = state[layer.id]?.[t.id] ? '[x]' : '[ ]';
        lines.push(`- ${box} ${t.label}`);
      }
      lines.push('');
    }
    const md = lines.join('\n');
    navigator.clipboard.writeText(md).then(
      () => {
        setCopyStatus('Plan copied to clipboard (Markdown)');
        window.setTimeout(() => setCopyStatus(null), 2800);
      },
      () => {
        setCopyStatus('Clipboard unavailable');
        window.setTimeout(() => setCopyStatus(null), 2800);
      },
    );
  }

  return (
    <TelemetryRegion id="implementation">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent"
                aria-hidden="true"
              />
              Implementation Tool · Per-Layer Roadmap
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-white display-font">
              Implementation Roadmap
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              Every Key Concern becomes a &quot;decide approach for …&quot; task, every Open
              Question a &quot;track resolution of …&quot; item. Check off as you progress,
              then export the whole plan as Markdown.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Chip tone="accent">{overall.done}/{overall.total} · {overall.pct}%</Chip>
            <button
              type="button"
              onClick={expandAll}
              className="text-[0.6875rem] font-mono text-white/55 hover:text-white uppercase tracking-[0.18em] px-2 py-1 border border-white/10 rounded"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="text-[0.6875rem] font-mono text-white/55 hover:text-white uppercase tracking-[0.18em] px-2 py-1 border border-white/10 rounded"
            >
              Collapse
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-[0.6875rem] font-mono text-white/45 hover:text-[#ff8a5c] uppercase tracking-[0.18em] px-2 py-1 border border-white/10 rounded"
            >
              Reset
            </button>
          </div>
        </header>

        {/* Overall tracker */}
        <CmdPanel eyebrow="Plan tracker" title="Overall progress">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="flex flex-col gap-3">
              <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f05122] to-[#ff8a5c] transition-all duration-500"
                  style={{ width: `${overall.pct}%` }}
                />
              </div>
              <div className="grid grid-cols-10 gap-1">
                {perLayerCounts.map(({ layer, pct }) => (
                  <a
                    key={layer.id}
                    href={`#${layer.id}-impl`}
                    title={`${layer.name} — ${pct}%`}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="h-10 w-full bg-black rounded border border-white/10 overflow-hidden flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-[#f05122] to-[#ff8a5c] transition-all duration-500"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[0.625rem] font-mono text-white/50 tracking-wide group-hover:text-white">
                      L{layer.number}
                    </span>
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <div className="grid grid-cols-2 gap-2 md:w-60">
                <SummaryCell label="Layers complete" value={overall.layersComplete} strong />
                <SummaryCell label="Layers underway" value={overall.layersUnderway} />
              </div>
              <button
                type="button"
                onClick={exportPlan}
                disabled={overall.done === 0}
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#f05122] hover:bg-[#ff7a4a] text-white text-sm font-normal rounded transition-colors shadow-[0_0_20px_rgba(240,81,34,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Export plan (Markdown)
              </button>
              {copyStatus && (
                <span className="text-[0.6875rem] font-mono text-[#ff8a5c] tracking-wide">
                  {copyStatus}
                </span>
              )}
            </div>
          </div>
        </CmdPanel>

        {/* Per-layer cards */}
        <div className="mt-6 flex flex-col gap-3">
          {perLayerCounts.map(({ layer, tasks, done, total, pct }) => {
            const isOpen = expanded.has(layer.id);
            const isStateHolding = layer.number === 3 || layer.number === 8;
            return (
              <article
                key={layer.id}
                id={`${layer.id}-impl`}
                className="cmd-panel overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(layer.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left"
                >
                  <header className="cmd-panel-header">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-sm font-mono ${isStateHolding ? 'text-[#ff8a5c]' : 'text-white/70'}`}>
                        L{layer.number}
                      </span>
                      {isStateHolding && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#f05122] shadow-[0_0_6px_#f05122]"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-base text-white truncate">{layer.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="h-1.5 w-24 bg-white/[0.04] rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-gradient-to-r from-[#f05122] to-[#ff8a5c] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[0.6875rem] font-mono text-white/70 tracking-wide">
                        {done}/{total} · {pct}%
                      </span>
                      <span
                        className={`text-xs text-white/50 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        aria-hidden="true"
                      >
                        ▸
                      </span>
                    </div>
                  </header>
                </button>
                {isOpen && (
                  <div className="cmd-panel-body flex flex-col gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-px bg-[#f05122]" aria-hidden="true" />
                        <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
                          Decisions to make ({layer.concerns.length})
                        </div>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tasks
                          .filter((t) => t.kind === 'concern')
                          .map((t) => {
                            const done = !!state[layer.id]?.[t.id];
                            return (
                              <li key={t.id}>
                                <label
                                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                                    done
                                      ? 'bg-[#f05122]/10 border-[#f05122]/50'
                                      : 'bg-white/[0.02] border-white/10 hover:border-white/25'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={done}
                                    onChange={() => toggleTask(layer.id, t.id)}
                                    className="sr-only"
                                  />
                                  <span
                                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      done
                                        ? 'bg-[#f05122] border-[#f05122] shadow-[0_0_6px_rgba(240,81,34,0.5)]'
                                        : 'bg-black border-white/20'
                                    }`}
                                    aria-hidden="true"
                                  >
                                    {done && (
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M20 6 9 17l-5-5" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="text-sm text-white/90 leading-snug">
                                    {t.label}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-px bg-[#f05122]" aria-hidden="true" />
                        <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
                          Open questions to track ({layer.openQuestions.length})
                        </div>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tasks
                          .filter((t) => t.kind === 'oq')
                          .map((t) => {
                            const done = !!state[layer.id]?.[t.id];
                            return (
                              <li key={t.id}>
                                <label
                                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                                    done
                                      ? 'bg-[#f05122]/10 border-[#f05122]/50'
                                      : 'bg-white/[0.02] border-white/10 hover:border-white/25'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={done}
                                    onChange={() => toggleTask(layer.id, t.id)}
                                    className="sr-only"
                                  />
                                  <span
                                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      done
                                        ? 'bg-[#f05122] border-[#f05122] shadow-[0_0_6px_rgba(240,81,34,0.5)]'
                                        : 'bg-black border-white/20'
                                    }`}
                                    aria-hidden="true"
                                  >
                                    {done && (
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M20 6 9 17l-5-5" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="text-sm text-white/90 leading-snug">
                                    <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase mr-2">
                                      OQ
                                    </span>
                                    {t.label}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <a
                        href={`#${layer.id}`}
                        className="text-sm font-mono text-[#ff8a5c] hover:text-white"
                      >
                        Open full layer panel →
                      </a>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </TelemetryRegion>
  );
}

function tasksFor(l: (typeof layers)[number]) {
  return [
    ...l.concerns.map((c, i) => ({
      id: `c-${i}`,
      kind: 'concern' as const,
      label: `Decide approach for: ${c}`,
    })),
    ...l.openQuestions.map((q, i) => ({
      id: `q-${i}`,
      kind: 'oq' as const,
      label: `Track resolution of: ${q}`,
    })),
  ];
}

function SummaryCell({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div
      className={`flex flex-col px-3 py-2 rounded border gap-0.5 ${
        strong ? 'border-[#f05122]/50 bg-[#f05122]/10' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <span className="text-[0.625rem] font-mono text-white/50 tracking-[0.18em] uppercase">{label}</span>
      <span className={`text-2xl font-normal display-font ${strong ? 'text-[#ff8a5c]' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
