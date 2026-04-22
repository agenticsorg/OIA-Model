import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { foundations } from '../content/digest';
import { LineageConstellation } from '../components/viz/LineageConstellation';
import { ContextTimeline } from '../components/viz/ContextTimeline';

export function Foundations() {
  return (
    <TelemetryRegion id="foundations" className="">
      <div className="main-inset py-8 flex flex-col gap-6">
        {/* §2.1 Lineage */}
        <CmdPanel id="foundations-lineage" eyebrow="Section 2.1" title={foundations.lineage.heading}>
          <Prose paragraphs={[foundations.lineage.body]} className="max-w-3xl" />
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Frameworks consulted">
            {foundations.lineage.frameworks.map((f) => (
              <Chip key={f} tone="mono">
                {f}
              </Chip>
            ))}
          </div>
          <LineageConstellation />
        </CmdPanel>

        {/* §2.2 Contemporary Context */}
        <CmdPanel id="foundations-context" eyebrow="Section 2.2" title={foundations.context.heading}>
          <Prose paragraphs={[foundations.context.body]} className="max-w-3xl" />
          <ContextTimeline />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {foundations.context.developments.map((d, i) => (
              <div
                key={d.title}
                className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-4 flex flex-col gap-2 relative overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f05122]/60 to-transparent"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
                    Development {i + 1}
                  </span>
                  <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em]">
                    0{i + 1}
                  </span>
                </div>
                <h4 className="text-sm text-white font-normal">{d.title}</h4>
                <p className="text-[0.8125rem] text-white/60 leading-relaxed">{d.body}</p>
              </div>
            ))}
          </div>
        </CmdPanel>

        {/* §2.3 Defining Properties */}
        <CmdPanel
          id="foundations-properties"
          eyebrow="Section 2.3"
          title={foundations.properties.heading}
        >
          <Prose paragraphs={[foundations.properties.body]} className="max-w-3xl" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {foundations.properties.list.map((p) => (
              <div
                key={p.name}
                className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-5 flex flex-col gap-3 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 bg-[#f05122]/5 rounded-full blur-2xl pointer-events-none"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between relative">
                  <span className="text-lg text-white font-normal">{p.name}</span>
                  <Chip tone="accent">Property</Chip>
                </div>
                <p className="text-sm text-white/65 leading-relaxed">{p.body}</p>
                <a
                  href={`#${p.anchorTarget}`}
                  className="mt-auto pt-2 text-xs font-mono text-[#ff8a5c] hover:text-white flex items-center gap-1.5"
                >
                  {p.addressedAt} →
                </a>
              </div>
            ))}
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
