import { useMemo, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { layers } from '../content/layers';
import { spans } from '../content/spans';
import { useLocalStorage, LS_KEYS } from '../hooks/useLocalStorage';

type Status = 'coherent' | 'gap' | 'notyet' | 'na';
type AssessmentState = Partial<Record<string, Status>>;

/**
 * Interactive architecture canvas — the full OIA stack with
 * cross-layer spans overlaid. Click a layer to see which spans
 * touch it. Click a span to see which layers it covers.
 * If the user has rated layers in the Assessment tool, those
 * ratings colour the stack.
 */
export function StackDiagram() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [activeSpan, setActiveSpan] = useState<string | null>(null);
  const [assessment] = useLocalStorage<AssessmentState>(LS_KEYS.assessment, {});

  const activeSpanData = useMemo(
    () => spans.find((s) => s.id === activeSpan) ?? null,
    [activeSpan],
  );
  const activeLayerData = useMemo(
    () => (activeLayer !== null ? layers.find((l) => l.number === activeLayer) : null),
    [activeLayer],
  );

  // Architectural convention: L9 at top, L0 at bottom.
  const stackOrder = useMemo(() => [...layers].reverse(), []);

  function toggleLayer(n: number) {
    setActiveLayer((curr) => (curr === n ? null : n));
    setActiveSpan(null);
  }
  function toggleSpan(id: string) {
    setActiveSpan((curr) => (curr === id ? null : id));
    setActiveLayer(null);
  }

  return (
    <TelemetryRegion id="stack-diagram">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent"
                aria-hidden="true"
              />
              Implementation Tool · Architecture Canvas
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-white display-font">
              Stack Diagram
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              The full nine-layer stack with six cross-layer spans overlaid. Click a layer
              to highlight which spans touch it, or click a span to see which layers it
              covers. If you have filled in the Architecture Assessment, your ratings are
              projected onto the stack here.
            </p>
          </div>
          <Chip tone="accent">10 layers · 6 spans</Chip>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <CmdPanel bodyClassName="p-0">
            <div className="flex border-b border-white/10 bg-white/[0.02]">
              <div className="px-4 py-3 flex-1 text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase">
                Layer
              </div>
              <div className="px-2 py-3 flex items-center gap-1">
                {spans.map((s) => {
                  const activeCol = activeSpan === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSpan(s.id)}
                      title={`${s.code} — ${s.name}`}
                      className={`w-10 px-1 py-2 rounded border text-[0.625rem] font-mono tracking-[0.14em] uppercase transition-colors ${
                        activeCol
                          ? 'border-[#f05122] bg-[#f05122]/20 text-white'
                          : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {s.code.replace('SPAN-', '').slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              {/* Operational-band bracket */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
                aria-hidden="true"
              >
                <div
                  className="absolute left-0 w-[3px] bg-[#f05122]/40 rounded"
                  style={{
                    /* Rows 2..5 correspond to L7..L4 in stackOrder. */
                    top: `${(2 / 10) * 100}%`,
                    height: `${(4 / 10) * 100}%`,
                  }}
                />
              </div>

              {stackOrder.map((l) => {
                const status = assessment[l.id];
                const isStateHolding = l.number === 3 || l.number === 8;
                const layerActive = activeLayer === l.number;
                const spanActive = activeSpanData && activeSpanData.layerRange.includes(l.number);
                const dim = (activeLayer !== null && !layerActive) || (activeSpan !== null && !spanActive);

                const rowTint = status === 'coherent'
                  ? 'bg-[#f05122]/[0.08]'
                  : status === 'gap'
                    ? 'bg-[#f05122]/[0.04] border-l-2 border-l-[#f05122]'
                    : status === 'notyet'
                      ? 'bg-white/[0.02]'
                      : status === 'na'
                        ? 'bg-black opacity-70'
                        : '';

                return (
                  <div
                    key={l.id}
                    className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center border-b border-white/5 last:border-b-0 transition-all ${rowTint} ${
                      layerActive ? 'bg-[#f05122]/15' : ''
                    } ${spanActive ? 'bg-[#f05122]/[0.06]' : ''} ${dim ? 'opacity-35' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLayer(l.number)}
                      aria-pressed={layerActive}
                      className="pl-4 pr-2 py-3 text-left hover:bg-white/[0.03] flex items-center gap-2"
                    >
                      <span
                        className={`w-9 text-sm font-mono flex items-center gap-1.5 ${
                          isStateHolding ? 'text-[#ff8a5c]' : 'text-white/70'
                        }`}
                      >
                        L{l.number}
                      </span>
                      {isStateHolding && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#f05122] shadow-[0_0_6px_#f05122]"
                          aria-hidden="true"
                          title="State-holding layer"
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleLayer(l.number)}
                      className="py-3 text-left hover:text-white flex flex-col min-w-0"
                    >
                      <span className="text-sm text-white truncate">{l.name}</span>
                      <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.14em] uppercase truncate">
                        {status ? statusLabel(status) : `${l.concerns.length} concerns · ${l.openQuestions.length} OQ`}
                      </span>
                    </button>

                    <div className="pr-2 py-3 flex items-center gap-1">
                      {spans.map((s) => {
                        const touches = s.layerRange.includes(l.number);
                        const isActiveCol = activeSpan === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSpan(s.id)}
                            title={`${s.name}${touches ? ' · touches this layer' : ' · does not touch'}`}
                            className={`w-10 h-8 rounded border flex items-center justify-center transition-colors ${
                              touches
                                ? isActiveCol
                                  ? 'bg-[#f05122] border-[#f05122] shadow-[0_0_10px_rgba(240,81,34,0.45)]'
                                  : 'bg-[#f05122]/25 border-[#f05122]/60 hover:bg-[#f05122]/50'
                                : 'border-white/5 bg-transparent'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                touches ? 'bg-white' : 'bg-transparent'
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="px-4 py-3 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center gap-4 text-[0.6875rem] font-mono text-white/45 tracking-[0.14em] uppercase">
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f05122] shadow-[0_0_6px_#f05122]" />
                State-holding
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-1 h-4 bg-[#f05122]/40" />
                Operational band (L4–L7)
              </span>
              <span className="inline-flex items-center gap-2 ml-auto">
                Click a layer or span → detail panel
              </span>
            </footer>
          </CmdPanel>

          {/* Side detail */}
          <div className="flex flex-col gap-4">
            <CmdPanel eyebrow="Detail" title={activeLayerData ? `Layer ${activeLayerData.number}` : activeSpanData ? activeSpanData.code : 'Select a cell'}>
              {!activeLayerData && !activeSpanData && (
                <p className="text-sm text-white/55 leading-relaxed">
                  Click any layer row or any span column to inspect its shape here.
                  State-holding layers (L3 &amp; L8) and the operational band (L4–L7) are
                  flagged in the canvas.
                </p>
              )}

              {activeLayerData && (
                <div className="flex flex-col gap-3">
                  <div className="text-lg text-white">{activeLayerData.name}</div>
                  <div className="text-[0.6875rem] font-mono text-white/45 tracking-[0.14em] uppercase">
                    Touched by {spans.filter((s) => s.layerRange.includes(activeLayerData.number)).length} spans
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {spans
                      .filter((s) => s.layerRange.includes(activeLayerData.number))
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setActiveSpan(s.id);
                            setActiveLayer(null);
                          }}
                          className="chip chip-accent hover:chip-strong cursor-pointer"
                        >
                          {s.code}
                        </button>
                      ))}
                  </div>
                  <div className="text-[0.6875rem] font-mono text-white/45 tracking-[0.14em] uppercase mt-3">
                    Concerns
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeLayerData.concerns.slice(0, 6).map((c) => (
                      <Chip key={c} tone="mono">
                        {c}
                      </Chip>
                    ))}
                    {activeLayerData.concerns.length > 6 && (
                      <Chip tone="mono">+{activeLayerData.concerns.length - 6}</Chip>
                    )}
                  </div>
                  <a
                    href={`#${activeLayerData.id}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-mono text-[#ff8a5c] hover:text-white"
                  >
                    Open full layer panel →
                  </a>
                </div>
              )}

              {activeSpanData && (
                <div className="flex flex-col gap-3">
                  <div className="text-lg text-white">{activeSpanData.name}</div>
                  <div className="text-[0.6875rem] font-mono text-white/45 tracking-[0.14em] uppercase">
                    Touches {activeSpanData.layerRange.length} layers
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[...activeSpanData.layerRange].sort((a, b) => a - b).map((n) => {
                      const l = layers.find((x) => x.number === n)!;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setActiveLayer(n);
                            setActiveSpan(null);
                          }}
                          className="chip chip-accent hover:chip-strong cursor-pointer"
                          title={l.name}
                        >
                          L{n}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mt-3">
                    {activeSpanData.body.length > 260 ? activeSpanData.body.slice(0, 260) + '…' : activeSpanData.body}
                  </p>
                  <a
                    href={`#${activeSpanData.id}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-mono text-[#ff8a5c] hover:text-white"
                  >
                    Open span panel →
                  </a>
                </div>
              )}
            </CmdPanel>

            <CmdPanel eyebrow="Legend" title="Assessment overlay">
              <ul className="flex flex-col gap-2 text-[0.8125rem]">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#f05122]/20 border border-[#f05122]/50" />
                  <span className="text-white/80">Coherent — rated working</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#f05122]/10 border-l-2 border-l-[#f05122] border border-[#f05122]/20" />
                  <span className="text-white/80">Gap — known gap</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white/5 border border-white/15" />
                  <span className="text-white/80">Not yet addressed</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-black border border-white/10 opacity-70" />
                  <span className="text-white/80">N/A — out of scope</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded border border-white/10" />
                  <span className="text-white/60">Unrated</span>
                </li>
              </ul>
              <a
                href="#assessment"
                className="mt-3 inline-flex items-center gap-2 text-sm font-mono text-[#ff8a5c] hover:text-white"
              >
                Rate your architecture →
              </a>
            </CmdPanel>
          </div>
        </div>
      </div>
    </TelemetryRegion>
  );
}

function statusLabel(s: Status) {
  switch (s) {
    case 'coherent': return 'Coherent · rated';
    case 'gap': return 'Gap · rated';
    case 'notyet': return 'Not yet · rated';
    case 'na': return 'N/A · rated';
  }
}
