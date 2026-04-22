import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { spans, spansIntro, spansIntersections } from '../content/spans';
import type { Span } from '../content/types';
import { SpanGapMemo } from '../components/micro/SpanGapMemo';

function SpanLaneVisual({ span }: { span: Span }) {
  /* Show a signal-texture + sweep-block lane overlaid on a 10-cell
     layer strip, so each span visibly sweeps the layers it touches. */
  const touched = new Set(span.layerRange);
  return (
    <div className="w-full">
      <div className="relative h-14 w-full bg-black rounded-lg border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute inset-0 signal-texture opacity-25" aria-hidden="true" />
        <div className="absolute inset-0 grid grid-cols-10" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => {
            const on = touched.has(i);
            return (
              <div
                key={i}
                className={`relative border-r border-white/5 last:border-r-0 flex items-center justify-center ${
                  on ? 'bg-[#f05122]/10' : ''
                }`}
              >
                <span
                  className={`text-[0.625rem] font-mono tracking-[0.18em] ${
                    on ? 'text-[#ff8a5c]' : 'text-white/20'
                  }`}
                >
                  L{i}
                </span>
              </div>
            );
          })}
        </div>
        <div className="sweep-block absolute inset-y-0 border-x flex items-center justify-between px-2 z-10">
          <div className="w-px h-8 bg-[#ff8a5c]/80 shadow-[0_0_8px_rgba(255,138,92,0.8)]" />
          <div className="w-px h-8 bg-[#ff8a5c]/80 shadow-[0_0_8px_rgba(255,138,92,0.8)]" />
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase">
        <span>Physical</span>
        <span>Operational</span>
        <span>Interface</span>
      </div>
    </div>
  );
}

export function CrossLayerSpans() {
  return (
    <TelemetryRegion id="cross-layer-spans" className="">
      <div className="main-inset py-8 flex flex-col gap-6">
        <CmdPanel
          eyebrow="Section 5"
          title="§5  Cross-Layer Spans"
          trailing={<Chip tone="accent">6 spans · Horizontal</Chip>}
        >
          <Prose paragraphs={[spansIntro]} className="max-w-3xl" />
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {spans.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group p-3 rounded border border-white/10 bg-white/[0.02] hover:border-[#f05122]/40 hover:bg-[#f05122]/5 transition-colors"
              >
                <div className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
                  {s.code}
                </div>
                <div className="text-sm text-white mt-1 group-hover:text-[#ff8a5c] transition-colors">
                  {s.name}
                </div>
                <div className="text-[0.625rem] font-mono text-white/40 mt-2">
                  {s.layerRange.length} layers
                </div>
              </a>
            ))}
          </div>
        </CmdPanel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {spans.map((s) => (
            <CmdPanel
              key={s.id}
              id={s.id}
              className=""
              eyebrow={s.code}
              title={s.name}
              trailing={
                <Chip tone="accent" dot>
                  Horizontal Span
                </Chip>
              }
            >
              <SpanLaneVisual span={s} />
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-px bg-[#f05122]" aria-hidden="true" />
                  <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
                    Treatment
                  </div>
                </div>
                <Prose paragraphs={[s.body]} />
              </div>
            </CmdPanel>
          ))}
        </div>

        <CmdPanel
          eyebrow="Span Intersections"
          title="Designing for intersections, not spans in isolation"
          trailing={<Chip tone="accent">Closing</Chip>}
        >
          <Prose paragraphs={[spansIntersections]} className="max-w-3xl" />
          <SpanGapMemo />
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
